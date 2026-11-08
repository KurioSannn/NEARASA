<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use App\Services\OpeningHours;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class MerchantOperationsTest extends CatalogTestCase
{
    private function ownedBusiness(): Business
    {
        $owner = User::factory()->create();
        $business = $this->business('Usaha harian');
        $business->update(['owner_id' => $owner->id]);
        $this->actingAs($owner);

        return $business;
    }

    private function base(Business $business, int $postId): string
    {
        return '/kelola-usaha/'.$business->slug.'/pos/'.$postId;
    }

    public function test_availability_changes_only_the_selected_post_and_persists_across_days(): void
    {
        $business = $this->ownedBusiness();
        $this->sellingPost($business, 112.731);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $menu = $business->menuItems()->first();
        $base = $this->base($business, $first->id);

        $this->from('/kelola-usaha')->patch($base.'/menu/'.$menu->id.'/ketersediaan', ['sold_out' => true])->assertRedirect('/kelola-usaha');

        $this->assertDatabaseHas('menu_item_post_availability', ['menu_item_id' => $menu->id, 'selling_post_id' => $first->id, 'sold_out' => true]);
        $this->assertFalse($menu->fresh()->sold_out);
        $this->get('/usaha/'.$business->slug.'?post='.$first->id)->assertInertia(fn (Assert $page) => $page
            ->where('business.menus.0.availability.0', ['post_id' => $first->id, 'sold_out' => true])
            ->where('business.menus.0.availability.1', ['post_id' => $second->id, 'sold_out' => false]));
        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page
            ->has('businesses', 2)->where('businesses.0.post.id', $first->id)->where('businesses.0.all_sold_out', true)
            ->where('businesses.1.post.id', $second->id)->where('businesses.1.all_sold_out', false));

        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-27 12:00', 'Asia/Jakarta'));
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->where('pins.0.all_sold_out', true)->where('pins.1.all_sold_out', false));
        $this->patch($base.'/menu/'.$menu->id.'/ketersediaan', ['sold_out' => false])->assertRedirect();
        $this->assertSame(1, DB::table('menu_item_post_availability')->count());
        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page->where('businesses.0.all_sold_out', false));
    }

    public function test_explicit_available_override_wins_over_legacy_sold_out_default_only_at_its_post(): void
    {
        $business = $this->ownedBusiness();
        $this->sellingPost($business, 112.731);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $menu = $business->menuItems()->first();
        $menu->update(['sold_out' => true]);

        $this->patch($this->base($business, $second->id).'/menu/'.$menu->id.'/ketersediaan', ['sold_out' => false])->assertRedirect();

        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page
            ->where('businesses.0.post.id', $first->id)->where('businesses.0.all_sold_out', true)
            ->where('businesses.1.post.id', $second->id)->where('businesses.1.matched_menu.sold_out', false));
    }

    public function test_unavailable_matching_menu_cannot_borrow_other_posts_stock_or_unrelated_available_menu(): void
    {
        $business = $this->ownedBusiness();
        $this->sellingPost($business, 112.731);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $menu = $business->menuItems()->first();
        $business->menuItems()->create(['name' => 'Pizza', 'group' => 'Makanan', 'category' => 'Pizza', 'price' => 40000]);
        $this->patch($this->base($business, $first->id).'/menu/'.$menu->id.'/ketersediaan', ['sold_out' => true])->assertRedirect();

        foreach (['/jelajah', '/peta'] as $path) {
            $key = $path === '/peta' ? 'pins' : 'businesses';
            $this->get($path.'?category=Ayam&max_price=25000')->assertInertia(fn (Assert $page) => $page
                ->has($key, 1)->where($key.'.0.post.id', $second->id)->where($key.'.0.matched_menu.id', $menu->id));
        }
    }

    public function test_current_day_hours_store_real_datetimes_and_expire_after_overnight_end(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $menu = $business->menuItems()->first();
        $menu->update(['sold_out' => true]);
        $base = $this->base($business, $post->id);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 17:30', 'Asia/Jakarta'));

        $this->post($base.'/jam-hari-ini', ['opens_at' => '22:00', 'closes_at' => '02:00'])->assertRedirect()->assertSessionHasNoErrors();

        $post->refresh();
        $this->assertSame('2026-10-26 22:00:00', $post->today_opens_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-27 02:00:00', $post->today_closes_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-26 17:30:00', $post->hours_updated_at->format('Y-m-d H:i:s'));
        $this->assertSame('08:00', $post->weeklySchedules()->first()->opens_at);
        $this->assertSame(0, $post->scheduleExceptions()->count());
        $this->assertTrue($menu->fresh()->sold_out);
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page
            ->where('business.posts.0.today_hours', ['opens_at' => '22:00', 'closes_at' => '02:00', 'closes_tomorrow' => true])
            ->where('business.posts.0.hours_updated_at', '2026-10-26T17:30:00+07:00')->where('business.posts.0.is_open', false));

        $hours = app(OpeningHours::class);
        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 01:59:59', 'Asia/Jakarta')));
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 02:00:00', 'Asia/Jakarta')));
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-27 01:59:59', 'Asia/Jakarta'));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page
            ->where('business.posts.0.today_hours.closes_tomorrow', false)->where('business.posts.0.is_open', true));
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-27 02:00:00', 'Asia/Jakarta'));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.posts.0.today_hours', null));
    }

    public function test_each_post_uses_its_own_cheapest_available_matching_menu_and_price(): void
    {
        $business = $this->ownedBusiness();
        $this->sellingPost($business, 112.731);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $expensive = $business->menuItems()->first();
        $cheap = $business->menuItems()->create(['name' => 'Ayam kecil', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 12000]);
        $this->patch($this->base($business, $first->id).'/menu/'.$cheap->id.'/ketersediaan', ['sold_out' => true])->assertRedirect();

        $this->get('/jelajah?category=Ayam&max_price=25000')->assertInertia(fn (Assert $page) => $page
            ->has('businesses', 2)
            ->where('businesses.0.post.id', $first->id)->where('businesses.0.matched_menu.id', $expensive->id)->where('businesses.0.min_price', 20000)
            ->where('businesses.1.post.id', $second->id)->where('businesses.1.matched_menu.id', $cheap->id)->where('businesses.1.min_price', 12000));
    }

    public function test_today_hours_use_the_current_jakarta_date_when_the_clock_is_in_utc(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-12-31 18:30:00', 'UTC'));

        $this->post($this->base($business, $post->id).'/jam-hari-ini', ['opens_at' => '22:00', 'closes_at' => '02:00'])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame('2027-01-01 22:00:00', $post->fresh()->today_opens_at->format('Y-m-d H:i:s'));
        $this->assertSame('2027-01-02 02:00:00', $post->fresh()->today_closes_at->format('Y-m-d H:i:s'));
        $this->assertSame('2027-01-01T01:30:00+07:00', $post->fresh()->hours_updated_at->toIso8601String());
    }

    public function test_unrelated_post_edits_cannot_rewrite_the_dedicated_hours_timestamp(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $base = $this->base($business, $post->id);
        $this->post($base.'/jam-hari-ini', ['opens_at' => '18:00', 'closes_at' => '21:00'])->assertRedirect();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 12:30', 'Asia/Jakarta'));

        $this->patch($base, ['name' => 'Patokan baru', 'address' => 'Gedangan', 'landmark' => 'Depan taman',
            'latitude' => -7.38, 'longitude' => 112.73, 'schedules' => [['weekday' => 1, 'opens_at' => '08:00', 'closes_at' => '23:00']],
            'hours_updated_at' => '2026-10-26 12:30:00', 'today_opens_at' => '2026-10-26 00:00:00'])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame('2026-10-26 12:30:00', $post->fresh()->updated_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-26 12:00:00', $post->fresh()->hours_updated_at->format('Y-m-d H:i:s'));
        $this->assertSame('18:00', $post->fresh()->today_opens_at->format('H:i'));
    }

    public function test_removed_menu_or_post_cascades_its_availability_without_removing_other_overrides(): void
    {
        $business = $this->ownedBusiness();
        $this->sellingPost($business, 112.731);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $menu = $business->menuItems()->first();
        $otherMenu = $business->menuItems()->create(['name' => 'Ayam kecil', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 12000]);
        foreach ([[$first, $menu], [$second, $menu], [$first, $otherMenu]] as [$post, $item]) {
            $this->patch($this->base($business, $post->id).'/menu/'.$item->id.'/ketersediaan', ['sold_out' => true])->assertRedirect();
        }

        $this->delete('/kelola-usaha/'.$business->slug.'/menu/'.$menu->id)->assertRedirect();
        $this->assertSame(1, DB::table('menu_item_post_availability')->count());
        $this->assertDatabaseHas('menu_item_post_availability', ['menu_item_id' => $otherMenu->id, 'selling_post_id' => $first->id]);
        $this->delete($this->base($business, $first->id))->assertRedirect();
        $this->assertSame(0, DB::table('menu_item_post_availability')->count());
        $this->assertDatabaseHas('selling_posts', ['id' => $second->id]);
        $this->assertDatabaseHas('menu_items', ['id' => $otherMenu->id]);
    }

    public function test_restoring_routine_clears_today_hours_without_replacing_weekly_schedule(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $base = $this->base($business, $post->id);
        $this->post($base.'/jam-hari-ini', ['opens_at' => '18:00', 'closes_at' => '21:00'])->assertRedirect();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 12:05', 'Asia/Jakarta'));
        $this->delete($base.'/jam-hari-ini')->assertRedirect();

        $post->refresh();
        $this->assertNull($post->today_opens_at);
        $this->assertNull($post->today_closes_at);
        $this->assertSame('2026-10-26 12:05:00', $post->hours_updated_at->format('Y-m-d H:i:s'));
        $this->assertSame(1, $post->weeklySchedules()->count());
        $this->assertTrue(app(OpeningHours::class)->isOpen($post, CarbonImmutable::now()));
    }

    public function test_only_a_valid_hours_action_reopens_temporary_closure_and_permanent_closure_rejects_it(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $base = $this->base($business, $post->id);
        $post->update(['operating_status' => 'temporarily_closed', 'closure_note' => 'Libur']);
        $this->postJson($base.'/jam-hari-ini', ['opens_at' => '12:00', 'closes_at' => '12:00'])->assertUnprocessable()->assertJsonValidationErrors('closes_at');
        $this->assertSame('temporarily_closed', $post->fresh()->operating_status);
        $this->post($base.'/jam-hari-ini', ['opens_at' => '12:00', 'closes_at' => '15:00'])->assertRedirect();
        $this->assertSame('operating', $post->fresh()->operating_status);
        $this->assertNull($post->fresh()->closure_note);

        $post->update(['operating_status' => 'permanently_closed']);
        $this->postJson($base.'/jam-hari-ini', ['opens_at' => '12:00', 'closes_at' => '15:00'])->assertUnprocessable()->assertJsonValidationErrors('post');
        $this->assertSame('permanently_closed', $post->fresh()->operating_status);
        $this->delete($base.'/jam-hari-ini')->assertRedirect();
        $this->assertSame('permanently_closed', $post->fresh()->operating_status);
    }

    public function test_invalid_or_finished_today_hours_and_nonboolean_stock_leave_existing_state_untouched(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $base = $this->base($business, $post->id);
        $this->postJson($base.'/jam-hari-ini', ['opens_at' => '25:00', 'closes_at' => 'nope'])->assertUnprocessable()->assertJsonValidationErrors(['opens_at', 'closes_at']);
        $this->postJson($base.'/jam-hari-ini', ['opens_at' => '08:00', 'closes_at' => '11:00'])->assertUnprocessable()->assertJsonValidationErrors('closes_at');
        $this->patchJson($base.'/menu/'.$business->menuItems()->first()->id.'/ketersediaan', ['sold_out' => 'yes'])->assertUnprocessable()->assertJsonValidationErrors('sold_out');
        $this->assertNull($post->fresh()->hours_updated_at);
        $this->assertSame(0, DB::table('menu_item_post_availability')->count());
    }

    public function test_guest_wrong_owner_and_mismatched_children_cannot_change_daily_operations(): void
    {
        $mine = $this->ownedBusiness();
        $other = $this->business('Usaha lain');
        $other->update(['owner_id' => User::factory()->create()->id]);
        $myPost = $mine->sellingPosts()->first();
        $otherPost = $other->sellingPosts()->first();
        $myMenu = $mine->menuItems()->first();
        $otherMenu = $other->menuItems()->first();
        foreach ([[$mine, $otherPost, $myMenu], [$mine, $myPost, $otherMenu], [$other, $otherPost, $otherMenu]] as [$business, $post, $menu]) {
            $this->patchJson($this->base($business, $post->id).'/menu/'.$menu->id.'/ketersediaan', ['sold_out' => true])->assertForbidden();
        }
        foreach ([[$mine, $otherPost], [$other, $otherPost]] as [$business, $post]) {
            $base = $this->base($business, $post->id);
            $this->postJson($base.'/jam-hari-ini', ['opens_at' => '12:00', 'closes_at' => '15:00'])->assertForbidden();
            $this->delete($base.'/jam-hari-ini')->assertForbidden();
        }
        auth()->logout();
        $base = $this->base($mine, $myPost->id);
        $this->patch($base.'/menu/'.$myMenu->id.'/ketersediaan', ['sold_out' => true])->assertRedirect('/masuk');
        $this->post($base.'/jam-hari-ini', ['opens_at' => '12:00', 'closes_at' => '15:00'])->assertRedirect('/masuk');
        $this->delete($base.'/jam-hari-ini')->assertRedirect('/masuk');
    }
}
