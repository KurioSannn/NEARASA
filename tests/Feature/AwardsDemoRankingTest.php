<?php

namespace Tests\Feature;

use App\Services\Awards\RankingCalculator;
use Database\Seeders\AwardsDemoSeeder;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\DB;
use Tests\CatalogTestCase;

class AwardsDemoRankingTest extends CatalogTestCase
{
    public function test_one_visitor_is_counted_once_per_business_across_posts_and_actions(): void
    {
        $business = $this->business('Bakso Uji');
        $business->update(['is_demo' => true]);
        $business->sellingPosts()->first()->update(['address' => 'Gedangan, Sidoarjo']);
        $this->sellingPost($business, 112.75);
        $posts = $business->sellingPosts()->orderBy('id')->get();
        $posts[1]->update(['address' => 'Gedangan, Sidoarjo']);

        foreach ([
            [$posts[0]->id, 'profile_view', '2026-11-02 02:00:00'],
            [$posts[1]->id, 'profile_view', '2026-11-02 03:00:00'],
            [$posts[0]->id, 'map_click', '2026-11-02 04:00:00'],
            [$posts[1]->id, 'whatsapp_click', '2026-11-02 05:00:00'],
            [$posts[0]->id, 'favorite', '2026-11-02 06:00:00'],
            [$posts[1]->id, 'favorite', '2026-11-03 06:00:00'],
        ] as [$postId, $type, $at]) {
            $this->event($business->id, $postId, 'visitor-1', $type, $at);
        }

        $ranking = app(RankingCalculator::class)->calculate('weekly', '2026-11-02', 'Sidoarjo');

        $this->assertCount(1, $ranking['entries']);
        $this->assertSame(1, $ranking['entries'][0]['metrics']['views']);
        $this->assertSame(1, $ranking['entries'][0]['metrics']['intent']);
        $this->assertSame(1, $ranking['entries'][0]['metrics']['favorites']);
    }

    public function test_weekly_boundaries_use_jakarta_time_and_exclude_end_instant(): void
    {
        $business = $this->business('Batas Waktu');
        $business->update(['is_demo' => true]);
        $post = $business->sellingPosts()->first();
        $post->update(['address' => 'Gedangan, Sidoarjo']);

        $this->event($business->id, $post->id, 'before', '2026-11-01 16:59:59');
        $this->event($business->id, $post->id, 'start', '2026-11-01 17:00:00');
        $this->event($business->id, $post->id, 'last', '2026-11-08 16:59:59');
        $this->event($business->id, $post->id, 'after', '2026-11-08 17:00:00');

        $ranking = app(RankingCalculator::class)->calculate('weekly', '2026-11-02', 'Sidoarjo');

        $this->assertSame('2026-11-02T00:00:00+07:00', $ranking['start']);
        $this->assertSame('2026-11-09T00:00:00+07:00', $ranking['end']);
        $this->assertSame(2, $ranking['entries'][0]['metrics']['views']);
    }

    public function test_intent_can_outweigh_higher_raw_views_and_results_are_deterministic(): void
    {
        $highViews = $this->business('Banyak Dilihat');
        $highViews->update(['is_demo' => true]);
        $highViews->sellingPosts()->first()->update(['address' => 'Sidoarjo']);
        $highIntent = $this->business('Banyak Dikunjungi');
        $highIntent->update(['is_demo' => true]);
        $highIntent->sellingPosts()->first()->update(['address' => 'Sidoarjo']);

        foreach (range(1, 16) as $i) {
            $this->event($highViews->id, $highViews->sellingPosts()->first()->id, 'viewer-'.$i, 'profile_view', '2026-11-03 03:00:00');
        }
        foreach (range(1, 8) as $i) {
            $this->event($highIntent->id, $highIntent->sellingPosts()->first()->id, 'visitor-'.$i, 'map_click', '2026-11-03 03:00:00');
        }

        $calculator = app(RankingCalculator::class);
        $first = $calculator->calculate('weekly', '2026-11-02', 'Sidoarjo');
        $second = $calculator->calculate('weekly', '2026-11-02', 'Sidoarjo');

        $this->assertSame($first, $second);
        $this->assertSame('banyak-dikunjungi', $first['entries'][0]['slug']);
        $this->assertSame(1, $first['entries'][0]['rank']);
    }

    public function test_demo_seeder_can_be_repeated_without_duplicate_events_or_affecting_live_tracker(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->seed(AwardsDemoSeeder::class);
        $count = DB::table('award_demo_events')->count();

        $this->assertGreaterThan(0, $count);
        $this->assertSame(0, DB::table('interaction_events')->count());

        $this->seed(AwardsDemoSeeder::class);
        $this->assertSame($count, DB::table('award_demo_events')->count());

        $weekly = app(RankingCalculator::class)->calculate('weekly', '2026-11-02', 'Sidoarjo');
        $monthly = app(RankingCalculator::class)->calculate('monthly', '2026-10-01', 'Surabaya');
        $yearly = app(RankingCalculator::class)->calculate('yearly', '2025-01-01', 'Sidoarjo');

        $this->assertNotEmpty($weekly['entries']);
        $this->assertNotEmpty($monthly['entries']);
        $this->assertNotEmpty($yearly['entries']);
        $this->assertSame('simulated', $weekly['data_status']);
    }

    private function event(int $businessId, int $postId, string $visitor, string $type = 'profile_view', string $at = '2026-11-03 02:00:00'): void
    {
        DB::table('award_demo_events')->insert([
            'business_id' => $businessId,
            'selling_post_id' => $postId,
            'visitor_key' => $visitor,
            'type' => $type,
            'occurred_at' => $at,
        ]);
    }
}
