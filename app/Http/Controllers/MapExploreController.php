<?php

namespace App\Http\Controllers;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Http\Requests\MapCatalogRequest;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class MapExploreController extends Controller
{
    public function __invoke(MapCatalogRequest $request, CatalogService $catalog): Response
    {
        $data = $request->validated();
        $filters = CatalogFilters::from($data);
        $location = SearchLocation::fromSession($request->session()->get('search_location'));
        $now = CarbonImmutable::now();
        $pins = $catalog->mapPoints($filters, $location, $now);
        $selected = $pins->first(fn ($pin) => $pin['slug'] === ($data['business'] ?? null) && $pin['post']['id'] === (int) ($data['post'] ?? 0));
        $focus = ! $selected && ! empty($data['business']) && ! empty($data['post'])
            ? $catalog->mapDestination($data['business'], (int) $data['post'], $location, $now) : null;

        return Inertia::render('MapExplore', ['pins' => $pins, 'focus' => $focus, 'selectedPostId' => $selected['post']['id'] ?? $focus['post']['id'] ?? null,
            'filters' => $filters->toArray(), 'options' => CatalogOptions::all()]);
    }
}
