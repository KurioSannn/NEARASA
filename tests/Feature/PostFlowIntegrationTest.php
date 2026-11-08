<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class PostFlowIntegrationTest extends CatalogTestCase
{
    public function test_editing_an_overnight_session_after_midnight_preserves_its_original_start_day(): void
    {
        $owner = User::factory()->create();
        $business = $this->business('Malam');
        $business->update(['owner_id' => $owner->id]);
        $post = $business->sellingPosts()->first();
        $url = '/kelola-usaha/malam/pos/'.$post->id.'/jam-hari-ini';
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 22:30', 'Asia/Jakarta'));
        $this->actingAs($owner)->post($url, ['opens_at' => '22:00', 'closes_at' => '02:00'])->assertRedirect();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-27 01:00', 'Asia/Jakarta'));
        $this->post($url, ['opens_at' => '22:00', 'closes_at' => '03:00'])->assertRedirect();
        $this->assertSame('2026-10-26 22:00', $post->fresh()->today_opens_at->format('Y-m-d H:i'));
        $this->assertSame('2026-10-27 03:00', $post->fresh()->today_closes_at->format('Y-m-d H:i'));
        $this->post($url, ['opens_at' => '00:30', 'closes_at' => '03:00'])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame('2026-10-27 00:30', $post->fresh()->today_opens_at->format('Y-m-d H:i'));
    }

    public function test_new_customer_pages_include_location_options_and_saved_businesses_appear_in_history(): void
    {
        $owner = User::factory()->create();
        $consumer = User::factory()->create();
        $business = $this->business('Disimpan');
        $business->update(['owner_id' => $owner->id]);
        $this->get('/pemilik/'.$owner->id)->assertInertia(fn (Assert $page) => $page->has('options.areas'));
        $this->actingAs($consumer)->post('/favorit/disimpan')->assertRedirect();
        $this->get('/riwayat')->assertInertia(fn (Assert $page) => $page->has('options.areas')->has('businesses', 1));
    }

    public function test_login_from_a_post_returns_to_that_post_and_rejects_external_return_urls(): void
    {
        $user = User::factory()->create(['password' => 'qa-login-only']);
        $this->get('/masuk?from='.rawurlencode('/usaha/contoh?post=12'))->assertOk();
        $this->post('/masuk', ['email' => $user->email, 'password' => 'qa-login-only'])->assertRedirect('/usaha/contoh?post=12');
        $this->post('/keluar');
        $this->get('/masuk?from='.rawurlencode('https://example.com'))->assertOk();
        $this->post('/masuk', ['email' => $user->email, 'password' => 'qa-login-only'])->assertRedirect('/akun');
    }
}
