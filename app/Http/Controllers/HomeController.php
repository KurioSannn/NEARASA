<?php

namespace App\Http\Controllers;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Http\Requests\CatalogRequest;
use App\Services\Awards\RankingCalculator;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use App\Services\InteractionTracker;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(CatalogRequest $request, CatalogService $catalog, RankingCalculator $awards): Response
    {
        $filters = CatalogFilters::from($request->validated());

        $cards = $catalog->search($filters, SearchLocation::fromSession($request->session()->get('search_location')), CarbonImmutable::now());

        $weekStart = CarbonImmutable::now('Asia/Jakarta')->startOfWeek(CarbonImmutable::MONDAY)->toDateString();
        $leader = $awards->calculate('weekly', $weekStart, 'Sidoarjo')['entries'][0] ?? null;
        $awardHighlight = $leader && $leader['score'] > 0
            ? ['name' => $leader['name'], 'slug' => $leader['slug'], 'photo' => $leader['cover_photo'], 'is_demo' => $leader['is_demo']]
            : null;

        return Inertia::render('Home', [
            'businesses' => $cards,
            'recommendations' => $request->user() ? app(InteractionTracker::class)->recommendations($request->user(), $cards) : [],
            'filters' => $filters->toArray(),
            'options' => CatalogOptions::all(),
            'awardHighlight' => $awardHighlight,
        ]);
    }
}
