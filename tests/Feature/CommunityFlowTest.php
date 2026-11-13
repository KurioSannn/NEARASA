<?php

namespace Tests\Feature;

use App\Models\PostReview;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class CommunityFlowTest extends CatalogTestCase
{
    public function test_reviews_are_per_post_require_login_and_allow_an_account_to_update_its_rating(): void
    {
        $business = $this->business('Ulasan');
        $this->sellingPost($business, 112.74);
        [$first, $second] = $business->sellingPosts()->orderBy('id')->get()->all();
        $url = '/usaha/ulasan/pos/'.$first->id.'/ulasan';
        $this->post($url, ['rating' => 5])->assertRedirect('/masuk');
        $user = User::factory()->create();
        $this->actingAs($user)->post($url, ['rating' => 5, 'comment' => 'Enak'])->assertRedirect();
        $this->post($url, ['rating' => 3])->assertRedirect();
        $this->assertDatabaseCount('post_reviews', 1);
        $this->get('/usaha/ulasan?post='.$first->id)->assertInertia(fn (Assert $page) => $page
            ->where('reviews.0.rating.average', 3)->where('reviews.0.rating.count', 1)
            ->where('reviews.1.rating.count', 0)->where('reviews.0.own.rating', 3));
        $business->update(['owner_id' => $user->id]);
        $this->post('/usaha/ulasan/pos/'.$second->id.'/ulasan', ['rating' => 5])->assertForbidden();
    }

    public function test_customer_review_appears_in_the_owning_merchant_workspace(): void
    {
        $owner = User::factory()->create();
        $customer = User::factory()->create(['public_name' => 'Pelanggan Uji']);
        $business = $this->business('Warung Uji');
        $business->update(['owner_id' => $owner->id]);
        $post = $business->sellingPosts()->first();

        $this->actingAs($customer)->post("/usaha/{$business->slug}/pos/{$post->id}/ulasan", [
            'rating' => 5,
            'comment' => 'Sambalnya enak.',
        ])->assertRedirect();

        $this->get('/kelola-usaha/ulasan')->assertInertia(fn (Assert $page) => $page->has('reviews.data', 0));
        $this->actingAs($owner)->get('/kelola-usaha/ulasan?business='.$business->id)->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/Reviews')
            ->has('reviews.data', 1)
            ->where('reviews.data.0.rating', 5)
            ->where('reviews.data.0.comment', 'Sambalnya enak.')
            ->where('reviews.data.0.post_name', $post->name)
            ->where('reviews.data.0.author', 'Pelanggan Uji')
            ->missing('reviews.data.0.user_id')
            ->missing('reviews.data.0.email'));
        $this->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page->where('reviewCount', 1));
    }

    public function test_interactions_are_scoped_deduplicated_and_do_not_count_owner_activity(): void
    {
        $owner = User::factory()->create();
        $consumer = User::factory()->create();
        $business = $this->business('Statistik');
        $business->update(['owner_id' => $owner->id]);
        $post = $business->sellingPosts()->first();
        $event = ['business_id' => $business->id, 'post_id' => $post->id, 'type' => 'map_click'];
        $this->actingAs($consumer)->postJson('/interaksi', $event)->assertSuccessful();
        $this->postJson('/interaksi', $event)->assertSuccessful();
        $this->assertDatabaseCount('interaction_events', 1);
        $this->actingAs($owner)->postJson('/interaksi', $event)->assertSuccessful();
        $this->assertDatabaseCount('interaction_events', 1);
        $this->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page
            ->where('statistics.days', 7)->where('statistics.totals.map_click', 1)->where('statistics.totals.whatsapp_click', 0));
    }

    public function test_public_owner_identity_does_not_expose_email_or_drafts_and_history_is_private(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $business = $this->business('Terlihat');
        $business->update(['owner_id' => $owner->id]);
        $draft = $this->business('Rahasia');
        $draft->update(['owner_id' => $owner->id, 'status' => 'draft']);
        $this->actingAs($owner)->patch('/akun/nama-publik', ['public_name' => 'Dapur Tetangga'])->assertRedirect();
        $this->get('/pemilik/'.$owner->id)->assertInertia(fn (Assert $page) => $page
            ->component('OwnerProfile', false)->where('owner.public_name', 'Dapur Tetangga')
            ->missing('owner.email')->has('businesses', 1));
        $this->actingAs($other)->get('/usaha/terlihat')->assertOk();
        $this->get('/riwayat')->assertInertia(fn (Assert $page) => $page->component('History', false)->has('businesses', 1));
        $this->actingAs($owner)->get('/riwayat')->assertInertia(fn (Assert $page) => $page->has('businesses', 0));
    }

    public function test_report_goes_to_its_owner_without_closing_post_and_is_not_duplicated(): void
    {
        $owner = User::factory()->create();
        $consumer = User::factory()->create();
        $other = User::factory()->create();
        $business = $this->business('Laporan');
        $business->update(['owner_id' => $owner->id]);
        $post = $business->sellingPosts()->first();
        $url = '/usaha/laporan/pos/'.$post->id.'/laporan-tutup';
        $this->actingAs($consumer)->post($url, ['note' => 'Pagar tutup'])->assertRedirect();
        $this->post($url, [])->assertRedirect();
        $this->assertDatabaseCount('closed_reports', 1);
        $this->assertSame('operating', $post->fresh()->operating_status);
        $this->actingAs($owner)->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page->has('reports', 1)->where('reports.0.post_id', $post->id));
        $this->actingAs($other)->post('/kelola-usaha/laporan/1/selesai')->assertForbidden();
        $this->actingAs($owner)->post('/kelola-usaha/laporan/1/selesai')->assertRedirect();
        $this->assertDatabaseMissing('closed_reports', ['id' => 1, 'resolved_at' => null]);
    }

    public function test_review_and_interaction_reject_foreign_posts_menus_and_invalid_ratings(): void
    {
        $user = User::factory()->create();
        $business = $this->business('Satu');
        $other = $this->business('Lain');
        $post = $business->sellingPosts()->first();
        $foreignPost = $other->sellingPosts()->first();
        $this->actingAs($user)->post('/usaha/satu/pos/'.$foreignPost->id.'/ulasan', ['rating' => 5])->assertNotFound();
        $this->post('/usaha/satu/pos/'.$post->id.'/ulasan', ['rating' => 6])->assertSessionHasErrors('rating');
        $this->postJson('/interaksi', ['business_id' => $business->id, 'post_id' => $post->id, 'type' => 'menu_open', 'menu_id' => $other->menuItems()->first()->id])->assertUnprocessable();
        $this->postJson('/interaksi', ['business_id' => $business->id, 'post_id' => $foreignPost->id, 'type' => 'map_click'])->assertNotFound();
        $this->postJson('/interaksi', ['business_id' => $business->id, 'post_id' => $post->id, 'type' => 'purchase'])->assertUnprocessable();
        $business->update(['status' => 'draft']);
        $this->post('/usaha/satu/pos/'.$post->id.'/ulasan', ['rating' => 5])->assertNotFound();
        $this->assertDatabaseCount('post_reviews', 0);
        $this->assertDatabaseCount('interaction_events', 0);
    }

    public function test_optional_review_photo_is_validated_and_replaced_in_isolated_storage(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $business = $this->business('Foto ulasan');
        $url = '/usaha/foto-ulasan/pos/'.$business->sellingPosts()->first()->id.'/ulasan';
        $this->actingAs($user)->post($url, ['rating' => 4, 'photo' => UploadedFile::fake()->create('bukan.html', 1, 'text/html')])->assertSessionHasErrors(['photo' => 'Pilih foto JPG, PNG, atau WebP.']);
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9BkAAAAASUVORK5CYII=');
        $this->post($url, ['rating' => 4, 'photo' => UploadedFile::fake()->createWithContent('foto.png', $png)])->assertRedirect();
        $this->assertCount(1, Storage::disk('public')->allFiles('merchant'));
        $existing = PostReview::firstOrFail();
        $this->post($url, ['rating' => 1, 'photo' => UploadedFile::fake()->create('bukan-foto.txt', 1, 'text/plain')])->assertSessionHasErrors(['photo' => 'Pilih foto JPG, PNG, atau WebP.']);
        $this->assertDatabaseHas('post_reviews', ['id' => $existing->id, 'rating' => 4, 'photo' => $existing->photo]);
        $this->assertTrue(Storage::disk('public')->exists('merchant/'.basename($existing->photo)));
        $this->assertCount(1, Storage::disk('public')->allFiles('merchant'));
        $this->post($url, ['rating' => 5, 'photo' => UploadedFile::fake()->createWithContent('baru.png', $png)])->assertRedirect();
        $this->assertCount(1, Storage::disk('public')->allFiles('merchant'));
        $this->assertDatabaseCount('post_reviews', 1);
        $owner = User::factory()->create();
        $business->update(['owner_id' => $owner->id]);
        $this->sellingPost($business, 112.75);
        $post = $business->sellingPosts()->orderBy('id')->first();
        $this->actingAs($owner)->delete('/kelola-usaha/foto-ulasan/pos/'.$post->id)->assertRedirect();
        $this->assertDatabaseCount('post_reviews', 0);
        $this->assertCount(0, Storage::disk('public')->allFiles('merchant'));
    }

    public function test_repeat_activity_counts_again_after_thirty_minutes_but_not_as_a_purchase(): void
    {
        $user = User::factory()->create();
        $business = $this->business('Waktu');
        $post = $business->sellingPosts()->first();
        $event = ['business_id' => $business->id, 'post_id' => $post->id, 'type' => 'map_click'];
        $this->actingAs($user)->postJson('/interaksi', $event)->assertSuccessful();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 12:31', 'Asia/Jakarta'));
        $this->postJson('/interaksi', $event)->assertSuccessful();
        $this->assertDatabaseCount('interaction_events', 2);
        $this->assertDatabaseMissing('interaction_events', ['type' => 'purchase']);
    }

    public function test_recommendations_use_only_internal_activity_and_keep_a_discovery_choice(): void
    {
        $user = User::factory()->create();
        $this->business('Ayam satu');
        $this->business('Ayam dua');
        $this->business('Ayam tiga');
        $this->business('Ayam empat');
        $this->actingAs($user)->get('/')->assertInertia(fn (Assert $page) => $page->has('recommendations', 0));
        $this->get('/usaha/ayam-satu')->assertOk();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('recommendations', 4));
    }
}
