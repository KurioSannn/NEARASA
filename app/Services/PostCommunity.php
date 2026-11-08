<?php

namespace App\Services;

use App\Models\Business;
use App\Models\PostReview;

class PostCommunity
{
    public function rating(int $postId): array
    {
        $ratings = request()->attributes->get('nearasa_ratings');
        if ($ratings === null) {
            $ratings = PostReview::query()->selectRaw('selling_post_id, AVG(rating) as average, COUNT(*) as total')
                ->groupBy('selling_post_id')->get()->keyBy('selling_post_id')->all();
            request()->attributes->set('nearasa_ratings', $ratings);
        }
        $summary = $ratings[$postId] ?? null;

        return ['average' => $summary ? round((float) $summary->average, 1) : null, 'count' => (int) ($summary?->total ?? 0)];
    }

    public function reviews(Business $business, ?int $userId): array
    {
        $reviews = PostReview::where('business_id', $business->id)->with('author:id,public_name')->orderByDesc('updated_at')->orderByDesc('id')->get();

        return $business->sellingPosts->sortBy('id')->values()->map(function ($post) use ($reviews, $userId) {
            $items = $reviews->where('selling_post_id', $post->id);
            $own = $userId ? $items->firstWhere('user_id', $userId) : null;

            return ['post_id' => $post->id, 'rating' => $this->rating($post->id),
                'items' => $items->take(50)->map(fn ($review) => [...$review->only(['id', 'rating', 'comment', 'photo']), 'author' => $review->author?->public_name ?: 'Pengguna NEARASA', 'created_at' => $review->created_at->toIso8601String()])->values()->all(),
                'own' => $own?->only(['id', 'rating', 'comment', 'photo'])];
        })->all();
    }
}
