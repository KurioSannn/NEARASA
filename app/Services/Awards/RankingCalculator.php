<?php

namespace App\Services\Awards;

use App\Models\Business;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RankingCalculator
{
    public const FORMULA_VERSION = 'hybrid-demo-v1';

    /**
     * Calculate rankings for a given period, start date, and region.
     *
     * @return array{
     *   schema_version: string,
     *   formula_version: string,
     *   data_status: string,
     *   result_status: string,
     *   region: string,
     *   category: string,
     *   period: string,
     *   start: string,
     *   end: string,
     *   timezone: string,
     *   params: array,
     *   eligible_business_count: int,
     *   minimum_participants: int,
     *   entries: array,
     *   notes: array
     * }
     */
    public function calculate(string $period, string $startDateWib, string $region): array
    {
        $tz = 'Asia/Jakarta';
        $startWib = CarbonImmutable::parse($startDateWib, $tz)->startOfDay();

        [$endWib, $params] = match ($period) {
            'monthly' => [
                $startWib->addMonth()->startOfDay(),
                [
                    'volume_weight' => 0.6,
                    'rate_weight' => 0.4,
                    'volume_target' => 300,
                    'prior_rate' => 0.1,
                    'prior_strength' => 100,
                    'rate_target' => 0.2,
                ],
            ],
            'yearly', 'annual' => [
                $startWib->addYear()->startOfDay(),
                [
                    'annual_mean_weight' => 0.7,
                    'annual_median_weight' => 0.3,
                    'volume_target' => 300,
                    'prior_rate' => 0.1,
                    'prior_strength' => 100,
                    'rate_target' => 0.2,
                ],
            ],
            default => [ // weekly
                $startWib->addDays(7)->startOfDay(),
                [
                    'volume_weight' => 0.6,
                    'rate_weight' => 0.4,
                    'volume_target' => 75,
                    'prior_rate' => 0.1,
                    'prior_strength' => 100,
                    'rate_target' => 0.2,
                ],
            ],
        };

        // Half-open interval in UTC: [startUtc, endUtc)
        $startUtc = $startWib->setTimezone('UTC')->toDateTimeString();
        $endUtc = $endWib->setTimezone('UTC')->toDateTimeString();

        // 1. Fetch businesses in the requested region
        $businesses = Business::query()
            ->with(['sellingPosts'])
            ->whereHas('sellingPosts', function ($q) use ($region) {
                $q->where('address', 'like', "%{$region}%");
            })
            ->get();

        $entries = [];

        foreach ($businesses as $business) {
            // Aggregate events from award_demo_events for this business in interval
            $events = DB::table('award_demo_events')
                ->where('business_id', $business->id)
                ->where('occurred_at', '>=', $startUtc)
                ->where('occurred_at', '<', $endUtc)
                ->get();

            // Unique visitors who viewed profile: V
            $viewers = $events->where('type', 'profile_view')->pluck('visitor_key')->unique();
            $v = $viewers->count();

            // Unique interested visitors who also viewed profile: I
            $interested = $events
                ->whereIn('type', ['map_click', 'whatsapp_click'])
                ->pluck('visitor_key')
                ->unique()
                ->intersect($viewers);
            $i = $interested->count();

            // Raw favorites if present in events (for inspection/compatibility)
            $favorites = $events->where('type', 'favorite')->pluck('visitor_key')->unique()->count();

            // Mathematical calculation of hybrid score
            $scoreParts = $this->calculateScore($i, $v, $params);

            $entries[] = [
                'business_id' => $business->id,
                'slug' => $business->slug,
                'name' => $business->name,
                'kind' => $business->kind,
                'cover_photo' => $business->cover_path,
                'metrics' => [
                    'views' => $v,
                    'intent' => $i,
                    'favorites' => $favorites,
                    'unique_profile_visitors' => $v,
                    'unique_interested_visitors' => $i,
                    'raw_rate_pct' => $v > 0 ? round(($i / $v) * 100, 2) : 0,
                ],
                'score_parts' => $scoreParts,
                'score' => $scoreParts['total'],
            ];
        }

        // Sort deterministically:
        // 1. Score desc
        // 2. Intent desc
        // 3. Smoothed rate desc
        // 4. Views desc
        // 5. Business ID asc
        usort($entries, function ($a, $b) {
            if ($a['score'] !== $b['score']) {
                return $b['score'] <=> $a['score'];
            }
            if ($a['metrics']['intent'] !== $b['metrics']['intent']) {
                return $b['metrics']['intent'] <=> $a['metrics']['intent'];
            }
            if ($a['score_parts']['smoothed_rate'] !== $b['score_parts']['smoothed_rate']) {
                return $b['score_parts']['smoothed_rate'] <=> $a['score_parts']['smoothed_rate'];
            }
            if ($a['metrics']['views'] !== $b['metrics']['views']) {
                return $b['metrics']['views'] <=> $a['metrics']['views'];
            }
            return $a['business_id'] <=> $b['business_id'];
        });

        // Assign ranks and badge data
        foreach ($entries as $idx => &$entry) {
            $rank = $idx + 1;
            $entry['rank'] = $rank;
            $entry['badge'] = [
                'eligible' => $entry['score'] > 0 && $rank <= 3,
                'rank' => $rank,
                'award_type' => $period,
                'label' => match ($rank) {
                    1 => 'Juara 1 Paling Diminati',
                    2 => 'Juara 2 Paling Diminati',
                    3 => 'Juara 3 Paling Diminati',
                    default => 'Peserta Kualifikasi',
                },
            ];
        }
        unset($entry);

        return [
            'schema_version' => '1.0',
            'formula_version' => self::FORMULA_VERSION,
            'data_status' => 'simulated',
            'result_status' => 'finalized',
            'region' => $region,
            'category' => 'most_interested',
            'period' => $period,
            'start' => $startWib->toIso8601String(),
            'end' => $endWib->toIso8601String(),
            'timezone' => $tz,
            'params' => $params,
            'eligible_business_count' => count($entries),
            'minimum_participants' => 3,
            'entries' => $entries,
            'notes' => [
                'DATA SIMULASI: Penghargaan digital berbasis sinyal minat (kunjungan profil, rute peta, kontak WhatsApp).',
                'Bukan sertifikasi cita rasa kuliner atau transaksi moneter.',
            ],
        ];
    }

    /**
     * Calculate volume score (L), smoothed engagement rate (R), ratio score (C), and final score (S).
     */
    public function calculateScore(int $intent, int $views, array $params): array
    {
        if ($views <= 0 || $intent <= 0) {
            return [
                'volume' => 0.0,
                'smoothed_rate' => 0.0,
                'ratio_score' => 0.0,
                'total' => 0.0,
            ];
        }

        $volumeTarget = $params['volume_target'] ?? 75;
        $volumeWeight = $params['volume_weight'] ?? 0.6;
        $rateWeight = $params['rate_weight'] ?? 0.4;
        $r0 = $params['prior_rate'] ?? 0.1;
        $lambda = $params['prior_strength'] ?? 100;
        $rateTarget = $params['rate_target'] ?? 0.2;

        // L(I, T) = 100 * min(1, ln(1+I) / ln(1+T))
        $l = 100.0 * min(1.0, log(1 + $intent) / log(1 + $volumeTarget));

        // R(I, V) = (I + lambda * r0) / (V + lambda)
        $r = ($intent + $lambda * $r0) / ($views + $lambda);

        // C(I, V) = 100 * min(1, R / rateTarget)
        $c = 100.0 * min(1.0, $r / $rateTarget);

        // S = volumeWeight * L + rateWeight * C
        $s = ($volumeWeight * $l) + ($rateWeight * $c);

        return [
            'volume' => round($l, 2),
            'smoothed_rate' => round($r * 100, 2),
            'ratio_score' => round($c, 2),
            'total' => round($s, 2),
        ];
    }
}
