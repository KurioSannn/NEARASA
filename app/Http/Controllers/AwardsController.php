<?php

namespace App\Http\Controllers;

use App\Services\Awards\RankingCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AwardsController extends Controller
{
    public function __invoke(Request $request, RankingCalculator $calculator): Response
    {
        $period = $request->query('period', 'weekly');
        if (! in_array($period, ['weekly', 'monthly', 'annual'])) {
            $period = 'weekly';
        }

        $region = $request->query('region', 'Sidoarjo');
        if (! in_array($region, ['Sidoarjo', 'Surabaya'])) {
            $region = 'Sidoarjo';
        }

        $defaultStart = match ($period) {
            'monthly' => '2026-10-01',
            'annual' => '2025-01-01',
            default => '2026-11-02',
        };

        $startDate = $request->query('start', $defaultStart);

        $ranking = $calculator->calculate($period, $startDate, $region);

        return Inertia::render('Awards', [
            'ranking' => $ranking,
            'selectedPeriod' => $period,
            'selectedRegion' => $region,
            'selectedStart' => $startDate,
        ]);
    }
}
