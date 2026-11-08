<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\OpeningHours;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class UiContextTest extends CatalogTestCase
{
    public function test_daily_dashboard_exposes_actual_hours_and_date_exceptions(): void
    {
        $owner = User::factory()->create();
        $business = $this->business('Jam nyata');
        $business->update(['owner_id' => $owner->id]);
        $post = $business->sellingPosts()->first();
        $this->actingAs($owner)->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page
            ->where('operations.0.post.schedule_today.label', '08:00–23:00')
            ->where('operations.0.post.schedule_today.source', 'Jadwal rutin'));
        $post->scheduleExceptions()->create(['date' => '2026-10-26', 'is_closed' => true]);
        $this->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page
            ->where('operations.0.post.schedule_today.label', 'Libur hari ini')
            ->where('operations.0.post.is_open', false));
        $post->scheduleExceptions()->update(['is_closed' => false, 'opens_at' => '14:00', 'closes_at' => '18:00']);
        $this->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page
            ->where('operations.0.post.schedule_today.label', '14:00–18:00')
            ->where('operations.0.post.schedule_today.source', 'Jadwal tanggal khusus'));
    }

    public function test_daily_hours_summary_retains_midnight_context_and_all_day(): void
    {
        $business = $this->business('Malam uji');
        $post = $business->sellingPosts()->first();
        $post->weeklySchedules()->update(['opens_at' => '22:00', 'closes_at' => '02:00']);
        $hours = app(OpeningHours::class);
        $this->assertSame('22:00–02:00 besok', $hours->scheduleToday($post->fresh(), CarbonImmutable::parse('2026-10-26 22:30', 'Asia/Jakarta'))['label']);
        $this->assertSame('22:00 kemarin–02:00', $hours->scheduleToday($post->fresh(), CarbonImmutable::parse('2026-10-27 01:00', 'Asia/Jakarta'))['label']);
        $this->assertSame('Tidak ada jadwal hari ini', $hours->scheduleToday($post->fresh(), CarbonImmutable::parse('2026-10-27 03:00', 'Asia/Jakarta'))['label']);
        $post->scheduleExceptions()->create(['date' => '2026-10-27', 'is_closed' => true]);
        $this->assertSame('Libur hari ini', $hours->scheduleToday($post->fresh(), CarbonImmutable::parse('2026-10-27 01:00', 'Asia/Jakarta'))['label']);
        $post->scheduleExceptions()->update(['is_closed' => false, 'all_day' => true]);
        $this->assertSame('24 jam', $hours->scheduleToday($post->fresh(), CarbonImmutable::parse('2026-10-27 12:00', 'Asia/Jakarta'))['label']);
    }

    public function test_history_describes_only_the_signed_in_accounts_last_activity_and_saved_time(): void
    {
        $consumer = User::factory()->create();
        $other = User::factory()->create();
        $viewed = $this->business('Dilihat');
        $saved = $this->business('Disimpan');
        $post = $viewed->sellingPosts()->first();
        $this->actingAs($consumer)->get('/usaha/dilihat')->assertOk();
        CarbonImmutable::setTestNow(CarbonImmutable::now()->addMinutes(5));
        $this->postJson('/interaksi', ['business_id' => $viewed->id, 'post_id' => $post->id, 'type' => 'map_click'])->assertSuccessful();
        $this->post('/favorit/disimpan')->assertRedirect();
        $this->get('/riwayat')->assertInertia(fn (Assert $page) => $page->has('businesses', 2)
            ->where('businesses.0.activity.type', 'map_click')->has('businesses.0.activity.at')
            ->where('businesses.1.activity.type', 'favorite')->has('businesses.1.activity.at'));
        $this->actingAs($other)->get('/riwayat')->assertInertia(fn (Assert $page) => $page->has('businesses', 0));
    }
}
