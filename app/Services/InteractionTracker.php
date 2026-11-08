<?php

namespace App\Services;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Models\Business;
use App\Models\InteractionEvent;
use App\Models\SellingPost;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class InteractionTracker
{
    public const TYPES = ['profile_view', 'menu_open', 'map_click', 'whatsapp_click'];

    public function record(Request $request, Business $business, SellingPost $post, string $type): void
    {
        if (($request->user() && $business->owner_id === $request->user()->id) || ! in_array($type, self::TYPES, true)) {
            return;
        }
        $now = CarbonImmutable::now();
        $visitor = $request->user() ? 'account:'.$request->user()->id : 'session:'.$request->session()->getId();
        $fingerprint = hash_hmac('sha256', $visitor.'|'.$post->id.'|'.$type, (string) config('app.key'));
        if (InteractionEvent::where('fingerprint', $fingerprint)->where('created_at', '>=', $now->subMinutes(30))->exists()) {
            return;
        }
        $dedup = hash('sha256', $fingerprint.'|'.intdiv($now->timestamp, 1800));
        InteractionEvent::firstOrCreate(['dedup_key' => $dedup], ['fingerprint' => $fingerprint,
            'business_id' => $business->id, 'selling_post_id' => $post->id, 'user_id' => $request->user()?->id, 'type' => $type, 'created_at' => $now, 'updated_at' => $now]);
    }

    public function statistics(User $owner): array
    {
        $ids = $owner->businesses()->pluck('id');
        $rows = InteractionEvent::whereIn('business_id', $ids)->where('created_at', '>=', CarbonImmutable::now('Asia/Jakarta')->subDays(6)->startOfDay())
            ->selectRaw('selling_post_id, type, COUNT(*) as total')->groupBy('selling_post_id', 'type')->get();
        $totals = array_fill_keys(self::TYPES, 0);
        $posts = SellingPost::whereIn('business_id', $ids)->with('business:id,name')->orderBy('business_id')->orderBy('id')->get()->map(function ($post) use ($rows, &$totals) {
            $counts = array_fill_keys(self::TYPES, 0);
            foreach ($rows->where('selling_post_id', $post->id) as $row) {
                if (array_key_exists($row->type, $counts)) {
                    $counts[$row->type] = (int) $row->total;
                    $totals[$row->type] += (int) $row->total;
                }
            }

            return ['post_id' => $post->id, 'post_name' => $post->name, 'business_name' => $post->business->name, ...$counts];
        })->all();

        return ['days' => 7, 'totals' => $totals, 'by_post' => $posts];
    }

    public function history(User $user, CatalogService $catalog, ?SearchLocation $location): Collection
    {
        $events = InteractionEvent::where('user_id', $user->id)->orderByDesc('created_at')->orderByDesc('id')->limit(200)->get()->unique('selling_post_id')->take(30)->keyBy('selling_post_id');
        $ids = $events->keys()->all();
        $order = array_flip($ids);

        $cards = $catalog->search(new CatalogFilters(radius: 'unlimited'), $location, CarbonImmutable::now());
        $visited = $cards->filter(fn ($card) => isset($order[$card['post']['id']]))->sortBy(fn ($card) => $order[$card['post']['id']])->map(fn ($card) => [...$card, 'activity' => ['type' => $events[$card['post']['id']]->type, 'at' => $events[$card['post']['id']]->created_at->toIso8601String()]])->values();
        $favoriteModels = $user->favorites()->orderByDesc('business_user.created_at')->get(['businesses.id']);
        $favorites = $favoriteModels->pluck('id')->all();
        $favoriteOrder = array_flip($favorites);
        $saved = $cards->filter(fn ($card) => isset($favoriteOrder[$card['id']]))->unique('id')
            ->reject(fn ($card) => $visited->contains(fn ($item) => $item['post']['id'] === $card['post']['id']))
            ->sortBy(fn ($card) => $favoriteOrder[$card['id']])->map(fn ($card) => [...$card, 'activity' => ['type' => 'favorite', 'at' => $favoriteModels->firstWhere('id', $card['id'])->pivot->created_at?->toIso8601String()]]);

        return $visited->concat($saved)->take(30)->values();
    }

    public function recommendations(User $user, Collection $cards): Collection
    {
        $seen = InteractionEvent::where('user_id', $user->id)->where('created_at', '>=', CarbonImmutable::now()->subDays(30))->pluck('business_id')->unique();
        $favorites = $user->favorites()->pluck('businesses.id');
        if ($seen->isEmpty() && $favorites->isEmpty()) {
            return collect();
        }
        $categories = Business::whereIn('id', $seen->merge($favorites)->unique())->where('status', 'published')->with('menuItems')->get()
            ->flatMap(fn ($business) => $business->menuItems->pluck('category'))->countBy();
        $ranked = $cards->reject(fn ($card) => $card['all_sold_out'] ?? false)->map(function ($card, $index) use ($categories) {
            $score = collect($card['menus'])->pluck('category')->unique()->sum(fn ($category) => $categories->get($category, 0));

            return ['card' => $card, 'score' => $score, 'index' => $index];
        })->sort(fn ($a, $b) => ($b['score'] <=> $a['score']) ?: ($a['index'] <=> $b['index']));
        $picks = $ranked->take(3)->pluck('card');
        $explore = $cards->reject(fn ($card) => $picks->contains(fn ($pick) => $pick['post']['id'] === $card['post']['id']) || ($card['all_sold_out'] ?? false))->first();
        if ($explore) {
            $picks->push($explore);
        }

        return $picks->values();
    }
}
