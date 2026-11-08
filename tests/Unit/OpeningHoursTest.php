<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\SellingPost;
use App\Services\OpeningHours;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpeningHoursTest extends TestCase
{
    use RefreshDatabase;

    private function makePost(string $opens, string $closes): SellingPost
    {
        $business = Business::create(['name' => 'Uji', 'slug' => 'uji', 'description' => '', 'kind' => 'warung', 'photo' => '']);
        $post = $business->sellingPosts()->create(['name' => 'Pos 1', 'address' => 'Gedangan', 'landmark' => '', 'latitude' => -7.38, 'longitude' => 112.73]);
        $post->weeklySchedules()->create(['weekday' => 1, 'opens_at' => $opens, 'closes_at' => $closes]);

        return $post;
    }

    public function test_opening_is_inclusive_and_closing_is_exclusive_in_jakarta(): void
    {
        $post = $this->makePost('08:00', '13:00');
        $hours = new OpeningHours;
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-26 07:59', 'Asia/Jakarta')));
        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-26 01:00', 'UTC')));
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-26 13:00', 'Asia/Jakarta')));
    }

    public function test_overnight_schedule_carries_into_next_day(): void
    {
        $post = $this->makePost('22:00', '01:00');
        $hours = new OpeningHours;
        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 00:30', 'Asia/Jakarta')));
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 01:00', 'Asia/Jakarta')));
    }

    public function test_closed_date_overrides_overnight_schedule(): void
    {
        $post = $this->makePost('22:00', '01:00');
        $post->scheduleExceptions()->create(['date' => '2026-10-27']);
        $this->assertFalse((new OpeningHours)->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-27 00:30', 'Asia/Jakarta')));
    }

    public function test_explicit_today_session_replaces_routine_and_carries_into_next_day(): void
    {
        $post = $this->makePost('08:00', '23:00');
        $post->forceFill(['today_opens_at' => '2026-10-26 22:00:00', 'today_closes_at' => '2026-10-27 02:00:00']);
        $hours = new OpeningHours;

        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-26 12:00', 'Asia/Jakarta')));
        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-26 15:00', 'UTC')));
        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 01:59:59', 'Asia/Jakarta')));
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 02:00', 'Asia/Jakarta')));
    }

    public function test_routine_resumes_at_the_exact_session_end_and_stale_overrides_do_not_repeat(): void
    {
        $post = $this->makePost('08:00', '23:00');
        $post->weeklySchedules()->create(['weekday' => 2, 'opens_at' => '00:00', 'closes_at' => '04:00']);
        $post->forceFill(['today_opens_at' => '2026-10-26 22:00:00', 'today_closes_at' => '2026-10-27 02:00:00']);
        $hours = new OpeningHours;

        $this->assertTrue($hours->isOpen($post, CarbonImmutable::parse('2026-10-27 02:00', 'Asia/Jakarta')));
        $this->assertFalse($hours->isOpen($post, CarbonImmutable::parse('2026-10-28 01:00', 'Asia/Jakarta')));
    }

    public function test_explicit_closure_blocks_a_previously_saved_today_session(): void
    {
        $post = $this->makePost('08:00', '23:00');
        $post->forceFill(['today_opens_at' => '2026-10-26 10:00:00', 'today_closes_at' => '2026-10-26 14:00:00']);
        foreach (['temporarily_closed', 'permanently_closed'] as $status) {
            $post->operating_status = $status;
            $this->assertFalse((new OpeningHours)->isOpen($post, CarbonImmutable::parse('2026-10-26 12:00', 'Asia/Jakarta')));
        }
    }
}
