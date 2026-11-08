<?php

namespace Tests\Feature;

use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class DiscoveryScheduleTest extends CatalogTestCase
{
    public function test_list_and_map_expose_each_posts_routine_hours_without_a_today_override(): void
    {
        $business = $this->business('Dua jadwal');
        $this->sellingPost($business, 112.731, false);

        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page
            ->where('businesses.0.post.day_schedule', ['label' => '08:00–23:00', 'source' => 'Jadwal rutin'])
            ->where('businesses.1.post.day_schedule.label', '18:00–23:00')
            ->where('businesses.0.post.today_hours', null));
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->where('pins.0.post.day_schedule.label', '08:00–23:00')
            ->where('pins.1.post.day_schedule.label', '18:00–23:00'));
    }

    public function test_discovery_hours_respect_a_special_closure_and_jakarta_calendar_day(): void
    {
        $business = $this->business('Jadwal khusus');
        $post = $business->sellingPosts()->first();
        $post->scheduleExceptions()->create(['date' => '2026-10-26', 'is_closed' => true]);
        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page
            ->where('businesses.0.post.day_schedule', ['label' => 'Libur hari ini', 'source' => 'Jadwal tanggal khusus'])
            ->where('businesses.0.is_open', false));

        $post->weeklySchedules()->create(['weekday' => 2, 'opens_at' => '18:00', 'closes_at' => '01:00']);
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 20:00', 'UTC'));
        $this->get('/peta')->assertInertia(fn (Assert $page) => $page
            ->where('pins.0.post.day_schedule', ['label' => '18:00–01:00 besok', 'source' => 'Jadwal rutin']));
    }
}
