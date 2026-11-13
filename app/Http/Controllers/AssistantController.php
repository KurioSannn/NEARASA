<?php

namespace App\Http\Controllers;

use App\Data\SearchLocation;
use App\Services\AssistantCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function __invoke(Request $request, AssistantCatalog $assistant): JsonResponse
    {
        $input = $request->validate(['prompt' => ['required', 'string', 'max:200']]);
        $location = SearchLocation::fromSession($request->session()->get('search_location'));

        return response()->json($assistant->recommend($input['prompt'], $location))
            ->header('Cache-Control', 'private, no-store');
    }
}
