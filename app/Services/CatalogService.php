<?php

namespace App\Services;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Models\Business;
use App\Models\SellingPost;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class CatalogService
{
    public function __construct(private OpeningHours $hours) {}

    public function search(CatalogFilters $filters, ?SearchLocation $location, CarbonImmutable $now): Collection
    {
        return $this->sortCards($this->matchingCards($filters, $location, $now));
    }

    public function mapPoints(CatalogFilters $filters, ?SearchLocation $location, CarbonImmutable $now): Collection
    {
        return $this->search($filters, $location, $now);
    }

    public function mapDestination(string $slug, int $postId, ?SearchLocation $location, CarbonImmutable $now): ?array
    {
        $business = Business::where('slug', $slug)->where('status', 'published')
            ->with(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions'])->first();
        $post = $business?->sellingPosts->firstWhere('id', $postId);
        if (! $post || $business->menuItems->isEmpty()) {
            return null;
        }

        return $this->card($business, $business->menuItems, $this->post($post, $location, $now));
    }

    private function matchingCards(CatalogFilters $filters, ?SearchLocation $location, CarbonImmutable $now): Collection
    {
        $q = mb_strtolower($filters->q);

        return Business::where('status', 'published')->with(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions'])
            ->get()->flatMap(function (Business $business) use ($q, $filters, $location, $now) {
                $nameMatches = str_contains(mb_strtolower($business->name), $q);
                $menus = $business->menuItems->filter(fn ($menu) => (! $filters->group || $menu->group === $filters->group)
                    && (! $filters->category || $menu->category === $filters->category)
                    && ($filters->maxPrice === null || $menu->price <= $filters->maxPrice)
                    && ($q === '' || $nameMatches || str_contains(mb_strtolower($menu->name), $q)));
                if ($menus->isEmpty()) {
                    return [];
                }

                return $business->sellingPosts->reject(fn ($post) => $post->operating_status === 'permanently_closed')
                    ->map(function (SellingPost $post) use ($business, $menus, $filters, $location, $now) {
                        $availableMatches = $menus->contains(fn ($menu) => ! $menu->soldOutAt($post->id));
                        $allSoldOut = $business->menuItems->every(fn ($menu) => $menu->soldOutAt($post->id));
                        if (! $availableMatches && ! $allSoldOut) {
                            return null;
                        }
                        $data = $this->post($post, $location, $now);
                        if ($location && $filters->radius !== 'unlimited' && $data['distance'] > $filters->radius) {
                            return null;
                        }

                        return $this->card($business, $menus, $data);
                    })->filter()->values();
            })->filter()->values();
    }

    private function card(Business $business, Collection $menus, array $post): array
    {
        $menuData = $menus->sortBy('price')->values()->map(fn ($menu) => [...$menu->only(['id', 'name', 'description', 'group', 'category', 'price', 'photo']), 'sold_out' => $menu->soldOutAt($post['id'])]);
        $matched = $menuData->firstWhere('sold_out', false);

        return ['id' => $business->id, 'slug' => $business->slug, 'name' => $business->name,
            'photo' => $business->photo, 'kind' => $business->kind, 'business_category' => $business->business_category, 'is_demo' => $business->is_demo,
            'menus' => $menuData->all(), 'matched_menu' => $matched, 'min_price' => $matched['price'] ?? $menuData->min('price'),
            'all_sold_out' => $business->menuItems->every(fn ($menu) => $menu->soldOutAt($post['id'])),
            'rating' => $post['rating'], 'is_open' => $post['is_open'], 'distance' => $post['distance'], 'post' => $post];
    }

    private function sortCards(Collection $cards): Collection
    {
        return $cards->sort(fn ($a, $b) => ((int) $b['is_open'] <=> (int) $a['is_open'])
            ?: (($a['distance'] ?? 0) <=> ($b['distance'] ?? 0)) ?: strnatcasecmp($a['name'], $b['name'])
            ?: ($a['post']['id'] <=> $b['post']['id']))->values();
    }

    public function post(SellingPost $post, ?SearchLocation $location, CarbonImmutable $now): array
    {
        return [...app(BusinessProfile::class)->postInformation($post, $now), 'id' => $post->id, 'name' => $post->name, 'address' => $post->address, 'landmark' => $post->landmark,
            'latitude' => $post->latitude, 'longitude' => $post->longitude, 'is_open' => $this->hours->isOpen($post, $now),
            'rating' => app(PostCommunity::class)->rating($post->id),
            'day_schedule' => $this->hours->scheduleToday($post, $now),
            'distance' => $location ? $this->distance($location, $post) : null,
            'schedules' => $post->weeklySchedules->map->only(['weekday', 'opens_at', 'closes_at', 'all_day'])->values()->all()];
    }

    public function sortPosts(Collection $posts): Collection
    {
        return $posts->sort(fn ($a, $b) => ((int) $b['is_open'] <=> (int) $a['is_open']) ?: (($a['distance'] ?? 0) <=> ($b['distance'] ?? 0)) ?: ($a['id'] <=> $b['id']))->values();
    }

    private function distance(SearchLocation $origin, SellingPost $post): float
    {
        $dLat = deg2rad($post->latitude - $origin->latitude);
        $dLon = deg2rad($post->longitude - $origin->longitude);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($origin->latitude)) * cos(deg2rad($post->latitude)) * sin($dLon / 2) ** 2;

        return 6371.0088 * 2 * asin(sqrt(min(1.0, max(0.0, $a))));
    }
}
