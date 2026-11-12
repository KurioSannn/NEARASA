<?php

namespace Database\Seeders;

use App\Models\Business;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AwardsDemoSeeder extends Seeder
{
    /**
     * Seed synthetic events for NEARASA Awards demonstration.
     * Deterministic, idempotent, isolated in award_demo_events table.
     */
    public function run(): void
    {
        // Clear previous demo events to ensure idempotency
        DB::table('award_demo_events')->delete();

        // Weekly period start: 2026-11-02 00:00:00 WIB
        // In UTC: 2026-11-01 17:00:00 UTC
        $weeklyStart = CarbonImmutable::parse('2026-11-02 00:00:00', 'Asia/Jakarta')->setTimezone('UTC');

        // Distribution of synthetic metrics per business matching section 8.6
        // Sidoarjo businesses:
        // - roti-pagi:   V=250, I=55 -> Rank 1
        // - dapur-griya: V=400, I=65 -> Rank 2
        // - pizza-sore:  V=1000, I=60 -> Rank 3
        // - burger-pos:  V=20, I=10  -> Rank 4
        // - dapur-bara:  V=1500, I=15 -> Rank 5
        //
        // Surabaya businesses:
        // - kopi-sudut:  V=320, I=52 -> Rank 1
        // - rasa-segar:  V=280, I=44 -> Rank 2
        // - mie-malam:   V=350, I=48 -> Rank 3

        $configs = [
            'roti-pagi' => ['views' => 250, 'intent' => 55],
            'dapur-griya' => ['views' => 400, 'intent' => 65],
            'pizza-sore' => ['views' => 1000, 'intent' => 60],
            'burger-pos' => ['views' => 20, 'intent' => 10],
            'dapur-bara' => ['views' => 1500, 'intent' => 15],
            'kopi-sudut' => ['views' => 320, 'intent' => 52],
            'rasa-segar' => ['views' => 280, 'intent' => 44],
            'mie-malam' => ['views' => 350, 'intent' => 48],
        ];

        $businesses = Business::query()->with('sellingPosts')->whereIn('slug', array_keys($configs))->get();

        $rows = [];
        $batchSize = 500;

        foreach ($businesses as $business) {
            $config = $configs[$business->slug] ?? null;
            if (! $config) {
                continue;
            }

            $posts = $business->sellingPosts;
            if ($posts->isEmpty()) {
                continue;
            }

            $vCount = $config['views'];
            $iCount = $config['intent'];

            // We generate synthetic events across the 7 days of the week
            for ($k = 1; $k <= $vCount; $k++) {
                $visitorKey = "v-{$business->slug}-{$k}";
                $post = $posts[($k - 1) % $posts->count()];
                // Stagger occurred_at across the week (days 0..6, hours 1..22)
                $offsetSeconds = (($k * 187) % (6 * 86400)) + 3600;
                $occurredAt = $weeklyStart->addSeconds($offsetSeconds)->toDateTimeString();

                // 1. Profile view
                $rows[] = [
                    'business_id' => $business->id,
                    'selling_post_id' => $post->id,
                    'visitor_key' => $visitorKey,
                    'type' => 'profile_view',
                    'occurred_at' => $occurredAt,
                ];

                // 2. If this visitor is also interested (I subset V)
                if ($k <= $iCount) {
                    $intentType = ($k % 2 === 0) ? 'map_click' : 'whatsapp_click';
                    $intentOffset = $offsetSeconds + 120; // 2 minutes after view
                    $rows[] = [
                        'business_id' => $business->id,
                        'selling_post_id' => $post->id,
                        'visitor_key' => $visitorKey,
                        'type' => $intentType,
                        'occurred_at' => $weeklyStart->addSeconds($intentOffset)->toDateTimeString(),
                    ];
                }

                if (count($rows) >= $batchSize) {
                    DB::table('award_demo_events')->insert($rows);
                    $rows = [];
                }
            }
        }

        if (! empty($rows)) {
            DB::table('award_demo_events')->insert($rows);
        }
    }
}
