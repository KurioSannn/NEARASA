<?php

namespace App\Http\Controllers;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Models\User;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use App\Services\InteractionTracker;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicOwnerController extends Controller
{
    public function show(Request $request, User $user, CatalogService $catalog)
    {
        $ids = $user->businesses()->where('status', 'published')->pluck('id');
        abort_if($ids->isEmpty(), 404);
        $cards = $catalog->search(new CatalogFilters(radius: 'unlimited'), SearchLocation::fromSession($request->session()->get('search_location')), CarbonImmutable::now())->whereIn('id', $ids)->values();

        return Inertia::render('OwnerProfile', ['owner' => ['id' => $user->id, 'public_name' => $user->public_name ?: 'Pemilik usaha'], 'businesses' => $cards, 'options' => CatalogOptions::all()]);
    }

    public function update(Request $request)
    {
        $data = $request->validate(['public_name' => ['required', 'string', 'max:80', 'not_regex:/[\x00-\x1F]/']], ['public_name.required' => 'Isi nama publikmu.', 'public_name.max' => 'Nama publik maksimal 80 karakter.', 'public_name.not_regex' => 'Nama publik tidak boleh memuat karakter kontrol.']);
        $request->user()->forceFill(['public_name' => trim($data['public_name'])])->save();

        return back(303)->with('success', 'Nama publik berhasil disimpan.');
    }

    public function history(Request $request, CatalogService $catalog, InteractionTracker $tracker)
    {
        return Inertia::render('History', ['businesses' => $tracker->history($request->user(), $catalog, SearchLocation::fromSession($request->session()->get('search_location'))), 'options' => CatalogOptions::all()]);
    }
}
