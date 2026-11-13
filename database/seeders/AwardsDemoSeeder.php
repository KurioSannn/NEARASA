<?php

namespace Database\Seeders;

use App\Models\Business;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AwardsDemoSeeder extends Seeder
{
    /**
     * Seed synthetic events for NEARASA Awards demonstration.
     * Deterministic, idempotent, isolated in award_demo_events table.
     */
    public function run(): void
    {
        $now = CarbonImmutable::now('Asia/Jakarta');
        $monthStart = $now->startOfMonth();
        $weekStart = max($now->startOfWeek(CarbonImmutable::MONDAY), $monthStart);

        // Each fixture pairs unique profile visitors with a subset who clicked Maps or WhatsApp.
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

        $businesses = Business::query()
            ->with('sellingPosts')
            ->where('is_demo', true)
            ->whereIn('slug', array_keys($configs))
            ->get();

        DB::transaction(function () use ($now, $monthStart, $weekStart, $configs, $businesses) {
            DB::table('award_demo_events')->delete();

            $this->seedWindow($businesses, $configs, $weekStart, $now);

            if ($monthStart->lt($weekStart)) {
                $this->seedWindow($businesses, array_replace($configs, [
                    'pizza-sore' => ['views' => 480, 'intent' => 290],
                    'mie-malam' => ['views' => 420, 'intent' => 260],
                ]), $monthStart, $weekStart);
            }

            $history = array_replace($configs, [
                'dapur-griya' => ['views' => 360, 'intent' => 300],
                'rasa-segar' => ['views' => 340, 'intent' => 290],
            ]);

            $previousMonth = $monthStart->subMonthNoOverflow();
            if ($previousMonth->year === $now->year) {
                $this->seedWindow($businesses, $history, $previousMonth, $monthStart);
            }

            $olderMonth = $previousMonth->subMonthNoOverflow();
            if ($olderMonth->year === $now->year) {
                $history['dapur-griya'] = ['views' => 345, 'intent' => 260];
                $history['rasa-segar'] = ['views' => 325, 'intent' => 245];
                $this->seedWindow($businesses, $history, $olderMonth, $previousMonth);
            }
        });
    }

    private function seedWindow(Collection $businesses, array $configs, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $availableSeconds = max(1, (int) $start->diffInSeconds($end));
        $windowKey = $start->toDateString();
        $start = $start->setTimezone('UTC');

        $rows = [];
        $batchSize = 500;

        foreach ($businesses as $business) {
            $config = $configs[$business->slug];

            $posts = $business->sellingPosts;
            if ($posts->isEmpty()) {
                continue;
            }

            $vCount = $config['views'];
            $iCount = $config['intent'];

            for ($k = 1; $k <= $vCount; $k++) {
                $visitorKey = "v-{$windowKey}-{$business->slug}-{$k}";
                $post = $posts[($k - 1) % $posts->count()];
                $offsetSeconds = ($k * 187) % $availableSeconds;
                $occurredAt = $start->addSeconds($offsetSeconds)->toDateTimeString();

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
                    $intentOffset = min($offsetSeconds + 120, $availableSeconds - 1); // 2 minutes after view
                    $rows[] = [
                        'business_id' => $business->id,
                        'selling_post_id' => $post->id,
                        'visitor_key' => $visitorKey,
                        'type' => $intentType,
                        'occurred_at' => $start->addSeconds($intentOffset)->toDateTimeString(),
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
