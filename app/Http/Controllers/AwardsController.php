<?php

namespace App\Http\Controllers;

use App\Services\Awards\RankingCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AwardsController extends Controller
{
    public function __invoke(Request $request, RankingCalculator $calculator): Response
    {
        $period = $request->query('period', 'weekly');
        if (! in_array($period, ['weekly', 'monthly', 'annual'], true)) {
            $period = 'weekly';
        }

        $region = $request->query('region', 'Sidoarjo');
        if (! in_array($region, ['Sidoarjo', 'Surabaya'], true)) {
            $region = 'Sidoarjo';
        }

        $today = CarbonImmutable::now('Asia/Jakarta');
        $defaultStart = (match ($period) {
            'monthly' => $today->startOfMonth(),
            'annual' => $today->startOfYear(),
            default => $today->startOfWeek(CarbonImmutable::MONDAY),
        })->toDateString();

        $startDate = $request->query('start', $defaultStart);
        if (Validator::make(['start' => $startDate], ['start' => ['required', 'date_format:Y-m-d']])->fails()) {
            $startDate = $defaultStart;
        }

        $ranking = $calculator->calculate($period, $startDate, $region);

        return Inertia::render('Awards', [
            'ranking' => $ranking,
            'selectedPeriod' => $period,
            'selectedRegion' => $region,
            'selectedStart' => $startDate,
        ]);
    }
}
