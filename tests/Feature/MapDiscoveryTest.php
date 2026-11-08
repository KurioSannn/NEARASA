<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class MapDiscoveryTest extends CatalogTestCase
{
    private function location(): array
    {
        return ['search_location' => ['latitude' => -7.38, 'longitude' => 112.73, 'label' => 'Titik saya']];
    }

    public function test_guests_can_see_every_published_selling_post_without_signing_in(): void
    {
        $business = $this->business('Dua pos');
        $this->sellingPost($business, 112.731);
        $draft = $this->business('Belum terbit');
        $draft->update(['status' => 'draft']);

        $this->get('/peta')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('MapExplore', false)->has('pins', 2)
            ->where('pins.0.slug', 'dua-pos')->where('pins.1.slug', 'dua-pos')
            ->where('pins.0.post.id', $business->sellingPosts()->first()->id)
            ->where('pins.0.distance', null)->where('location', null)
            ->where('selectedPostId', null)->where('filters.radius', 5)
            ->missing('pins.0.owner_id')->missing('pins.0.contact_email'));
    }

    public function test_radius_filters_each_post_and_unlimited_includes_far_posts(): void
    {
        $business = $this->business('Dekat jauh');
        $this->sellingPost($business, 112.85);

        $this->withSession($this->location())->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->has('pins', 1)->where('pins.0.post.longitude', 112.73)
            ->where('pins.0.distance', 0)->where('location.label', 'Titik saya'));
        $this->get('/peta?radius=unlimited')->assertInertia(fn (Assert $page) => $page->has('pins', 2));
    }

    public function test_map_and_list_use_the_same_menu_matching_and_price_rules(): void
    {
        $business = $this->business('Menu silang');
        $business->menuItems()->delete();
        $business->menuItems()->createMany([
            ['name' => 'Pizza', 'group' => 'Makanan', 'category' => 'Pizza', 'price' => 40000],
            ['name' => 'Kopi', 'group' => 'Minuman', 'category' => 'Kopi', 'price' => 10000],
        ]);
        $this->get('/peta?category=Pizza&max_price=15000')->assertInertia(fn (Assert $page) => $page->has('pins', 0));
        $this->get('/peta?q=Pizza&category=Pizza&max_price=45000')->assertInertia(fn (Assert $page) => $page
            ->has('pins', 1)->has('pins.0.menus', 1)->where('pins.0.min_price', 40000));
        $business->menuItems()->update(['sold_out' => true]);
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page->has('pins', 1)->where('pins.0.all_sold_out', true)->where('pins.0.matched_menu', null));
    }

    public function test_permanent_closure_is_hidden_and_temporary_closure_remains_labelled(): void
    {
        $closed = $this->business('Permanen');
        $closed->sellingPosts()->update(['operating_status' => 'permanently_closed']);
        $temporary = $this->business('Sementara');
        $temporary->sellingPosts()->update(['operating_status' => 'temporarily_closed']);
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->has('pins', 1)->where('pins.0.slug', 'sementara')->where('pins.0.is_open', false)
            ->where('pins.0.post.operating_status', 'temporarily_closed'));
    }

    public function test_profile_link_selects_only_a_visible_post_belonging_to_that_business(): void
    {
        $business = $this->business('Pilihan');
        $this->sellingPost($business, 112.731);
        $postId = $business->sellingPosts()->latest('id')->first()->id;
        $other = $this->business('Lain');
        $otherId = $other->sellingPosts()->first()->id;

        $this->get('/peta?business=pilihan&post='.$postId)->assertInertia(fn (Assert $page) => $page->where('selectedPostId', $postId));
        $this->get('/peta?business=pilihan&post='.$otherId)->assertInertia(fn (Assert $page) => $page->where('selectedPostId', null));
        $business->update(['status' => 'draft']);
        $this->get('/peta?business=pilihan&post='.$postId)->assertInertia(fn (Assert $page) => $page->where('selectedPostId', null)->has('pins', 1));
    }

    public function test_bad_filters_or_focus_shapes_are_rejected_without_server_errors(): void
    {
        $this->getJson('/peta?radius=-1&category=unknown&business[]=x&post[]=1')
            ->assertUnprocessable()->assertJsonValidationErrors(['radius', 'category', 'business', 'post']);
    }

    public function test_explicit_destination_keeps_permanent_closure_visible_and_sold_out_in_results(): void
    {
        $closed = $this->business('Tujuan tutup');
        $closed->sellingPosts()->update(['operating_status' => 'permanently_closed']);
        $soldOut = $this->business('Tujuan habis');
        $soldOut->menuItems()->update(['sold_out' => true]);
        foreach ([$closed, $soldOut] as $business) {
            $postId = $business->sellingPosts()->first()->id;
            $this->get('/peta?business='.$business->slug.'&post='.$postId)->assertInertia(fn (Assert $page) => $page
                ->has('pins', 1)->where('selectedPostId', $postId)
                ->where($business->id === $closed->id ? 'focus.slug' : 'pins.0.slug', $business->slug)
                ->where($business->id === $closed->id ? 'focus.post.id' : 'pins.0.post.id', $postId));
        }
        $closed->update(['status' => 'draft']);
        $this->get('/peta?business=tujuan-tutup&post='.$closed->sellingPosts()->first()->id)
            ->assertInertia(fn (Assert $page) => $page->where('selectedPostId', null)->where('focus', null));
    }

    public function test_detail_can_return_to_the_map_with_filters_and_selected_post_but_no_coordinates(): void
    {
        $business = $this->business('Asal peta');
        $postId = $business->sellingPosts()->first()->id;
        $origin = '/peta?category=Ayam&radius=unlimited&business=asal-peta&post='.$postId;
        $this->get('/usaha/asal-peta?from='.rawurlencode($origin.'&latitude=-7.38&longitude=112.73&tracking=secret'))
            ->assertInertia(fn (Assert $page) => $page->where('backUrl', $origin));
    }

    public function test_saved_merchant_pin_and_schedule_are_immediately_read_by_the_public_map(): void
    {
        $business = $this->business('Pindah pos');
        $user = User::factory()->create();
        $business->update(['owner_id' => $user->id]);
        $post = $business->sellingPosts()->first();
        $this->actingAs($user)->patch('/kelola-usaha/pindah-pos/pos/'.$post->id, [
            'name' => 'Pos baru', 'address' => 'Depan sekolah', 'landmark' => 'Gerbang timur',
            'latitude' => -7.39, 'longitude' => 112.745, 'operating_status' => 'operating',
            'schedules' => [['weekday' => 1, 'opens_at' => '00:00', 'closes_at' => '00:00', 'all_day' => true]],
            'special_hours' => [], 'service_options' => [], 'facilities' => [], 'payment_methods' => [],
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->where('pins.0.post.name', 'Pos baru')->where('pins.0.post.latitude', -7.39)
            ->where('pins.0.post.longitude', 112.745)->where('pins.0.post.landmark', 'Gerbang timur')
            ->where('pins.0.is_open', true));
    }
}
