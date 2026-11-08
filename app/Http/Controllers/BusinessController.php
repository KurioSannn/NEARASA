<?php

namespace App\Http\Controllers;

use App\Data\SearchLocation;
use App\Models\Business;
use App\Models\User;
use App\Services\BusinessProfile;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use App\Services\InteractionTracker;
use App\Services\PostCommunity;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __invoke(Request $request, Business $business, CatalogService $catalog): Response
    {
        abort_unless($business->status === 'published', 404);
        $business->load(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions']);
        $location = SearchLocation::fromSession($request->session()->get('search_location'));
        $posts = $catalog->sortPosts($business->sellingPosts->map(fn ($post) => $catalog->post($post, $location, CarbonImmutable::now())));
        $postInput = $request->query('post');
        $selectedPost = is_scalar($postInput) ? $posts->firstWhere('id', (int) $postInput) : null;
        $selectedPost ??= $posts->first();
        $profile = app(BusinessProfile::class);
        $owner = $business->owner_id ? User::find($business->owner_id) : null;
        $selectedModel = $business->sellingPosts->firstWhere('id', $selectedPost['id'] ?? null);
        if ($selectedModel && ! $request->prefetch()) {
            app(InteractionTracker::class)->record($request, $business, $selectedModel, 'profile_view');
        }

        return Inertia::render('BusinessDetail', ['business' => [...$business->only(['id', 'slug', 'name', 'description', 'kind', 'photo', 'is_demo']), ...$profile->information($business, true),
            'menus' => $business->menuItems->map(fn ($menu) => $profile->menuInformation($menu, $business->sellingPosts))->all(), 'posts' => $posts],
            'owner' => $owner ? ['id' => $owner->id, 'public_name' => $owner->public_name ?: 'Pemilik usaha'] : null,
            'reviews' => app(PostCommunity::class)->reviews($business, $request->user()?->id),
            'selectedPostId' => $selectedPost['id'] ?? null, 'backUrl' => $this->catalogReturnUrl($request->query('from')), 'options' => CatalogOptions::all()]);
    }

    private function catalogReturnUrl(mixed $value): string
    {
        $parts = is_string($value) ? parse_url($value) : false;
        $path = $parts['path'] ?? '';
        $catalogPage = in_array($path, ['/', '/jelajah', '/peta'], true);
        $accountPage = in_array($path, ['/favorit', '/riwayat'], true) || preg_match('#^/pemilik/[1-9][0-9]*$#D', $path);
        if (! $parts || isset($parts['host']) || isset($parts['scheme']) || (! $catalogPage && ! $accountPage)) {
            return '/jelajah';
        }
        parse_str($parts['query'] ?? '', $query);
        $keys = $catalogPage ? ['q', 'group', 'category', 'max_price', 'radius'] : [];
        if ($parts['path'] === '/peta') {
            $keys = [...$keys, 'business', 'post'];
        }
        $query = array_filter(array_intersect_key($query, array_flip($keys)), 'is_string');

        return $parts['path'].($query ? '?'.http_build_query($query) : '');
    }
}
