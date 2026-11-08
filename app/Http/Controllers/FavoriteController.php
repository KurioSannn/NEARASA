<?php

namespace App\Http\Controllers;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Models\Business;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function index(Request $request, CatalogService $catalog)
    {
        $ids = $request->user()->favorites()->pluck('businesses.id')->all();
        $businesses = $catalog->search(new CatalogFilters(radius: 'unlimited'), SearchLocation::fromSession($request->session()->get('search_location')), CarbonImmutable::now())->whereIn('id', $ids)->values();

        return Inertia::render('Favorites', ['businesses' => $businesses, 'savedCount' => count($ids), 'unavailableCount' => count($ids) - $businesses->pluck('id')->unique()->count(), 'options' => CatalogOptions::all()]);
    }

    public function store(Request $request, Business $business)
    {
        abort_unless($business->status === 'published', 404);
        $request->user()->favorites()->syncWithoutDetaching([$business->id]);

        return back(303);
    }

    public function destroy(Request $request, Business $business)
    {
        $request->user()->favorites()->detach($business->id);

        return back(303);
    }
}
