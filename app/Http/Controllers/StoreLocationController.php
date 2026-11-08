<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StoreLocationController extends Controller
{
    public function store(StoreLocationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $request->session()->put('search_location', ['latitude' => (float) $data['latitude'], 'longitude' => (float) $data['longitude'], 'label' => $data['label']]);

        return back(303);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->forget('search_location');

        return back(303);
    }
}
