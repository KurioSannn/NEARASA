<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'location' => fn () => $request->session()->get('search_location'),
            'mapTiles' => config('nearasa.map_tiles'),
            'assistantUsesGemini' => filled(config('services.gemini.key')),
            'auth' => fn () => [
                'user' => $request->user() ? [
                    ...$request->user()->only(['id', 'name', 'email', 'is_demo', 'public_name', 'avatar']),
                    'has_business' => $request->user()->businesses()->exists(),
                ] : null,
                'favorites' => $request->user()?->favorites()->pluck('businesses.id')->all() ?? [],
            ],
            'flash' => fn () => ['success' => $request->session()->get('success')],
        ];
    }
}
