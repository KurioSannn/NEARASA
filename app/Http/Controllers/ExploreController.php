<?php

namespace App\Http\Controllers;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Http\Requests\CatalogRequest;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __invoke(CatalogRequest $request, CatalogService $catalog): Response
    {
        $filters = CatalogFilters::from($request->validated());

        return Inertia::render('Explore', ['businesses' => $catalog->search($filters, SearchLocation::fromSession($request->session()->get('search_location')), CarbonImmutable::now()), 'filters' => $filters->toArray(), 'options' => CatalogOptions::all()]);
    }
}
