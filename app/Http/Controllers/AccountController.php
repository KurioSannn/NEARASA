<?php

namespace App\Http\Controllers;

use App\Services\CatalogOptions;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('Account', ['ownedCount' => $request->user()->businesses()->count(), 'favoriteCount' => $request->user()->favorites()->count(), 'publicProfileAvailable' => $request->user()->businesses()->where('status', 'published')->exists(), 'publicName' => $request->user()->public_name ?? '', 'options' => CatalogOptions::all()]);
    }
}
