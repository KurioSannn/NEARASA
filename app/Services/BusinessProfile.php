<?php

namespace App\Services;

use App\Models\Business;
use App\Models\MenuItem;
use App\Models\SellingPost;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class BusinessProfile
{
    public const SERVICES = ['dine_in', 'takeaway', 'pickup', 'delivery'];

    public const FACILITIES = ['wifi', 'outdoor_seating', 'toilet', 'prayer_room', 'motorcycle_parking', 'car_parking', 'wheelchair_access', 'child_seating'];

    public const PAYMENTS = ['cash', 'qris', 'debit_card', 'credit_card', 'bank_transfer'];

    public const SOCIAL = ['instagram', 'facebook', 'tiktok', 'youtube', 'x', 'linkedin', 'pinterest'];

    public const ACTIONS = ['menu', 'ordering', 'reservation', 'gofood', 'grabfood', 'shopeefood'];

    public function information(Business $business, bool $public = false): array
    {
        $business->loadMissing(['galleryPhotos', 'updates']);
        $today = CarbonImmutable::now('Asia/Jakarta')->format('Y-m-d');
        $updates = $business->updates->filter(fn ($update) => ! $public || ($update->is_published
            && (! $update->starts_on || $update->starts_on->format('Y-m-d') <= $today)
            && (! $update->ends_on || $update->ends_on->format('Y-m-d') >= $today)));

        return [...$business->only(['business_category', 'phone', 'contact_email', 'website', 'logo', 'menu_pdf']),
            'whatsapp' => preg_match('/^62[0-9]{8,13}$/', $business->whatsapp ?? '') ? $business->whatsapp : null,
            'additional_categories' => array_values($business->additional_categories ?? []), 'opened_on' => $business->opened_on?->format('Y-m-d'),
            'social_links' => $business->social_links ?? (object) [], 'action_links' => $business->action_links ?? (object) [],
            'gallery' => $business->galleryPhotos->map->only(['id', 'photo', 'caption', 'kind'])->values(),
            'updates' => $updates->map(fn ($update) => [...$update->only(['id', 'type', 'title', 'body', 'photo', 'cta_label', 'cta_url', 'is_published']), 'starts_on' => $update->starts_on?->format('Y-m-d'), 'ends_on' => $update->ends_on?->format('Y-m-d')])->values()];
    }

    public function menuInformation(MenuItem $menu, Collection $posts): array
    {
        return [...$menu->only(['id', 'name', 'description', 'group', 'category', 'price', 'photo', 'sold_out']),
            'availability' => $posts->sortBy('id')->values()->map(fn ($post) => ['post_id' => $post->id, 'sold_out' => $menu->soldOutAt($post->id)])->all()];
    }

    public function postInformation(SellingPost $post, ?CarbonImmutable $now = null): array
    {
        return [...$post->only(['service_area', 'operating_status', 'closure_note']),
            'hours_updated_at' => $post->hours_updated_at?->toIso8601String(), 'today_hours' => app(OpeningHours::class)->todayHours($post, $now ?? CarbonImmutable::now('Asia/Jakarta')),
            'service_options' => array_values($post->service_options ?? []), 'facilities' => array_values($post->facilities ?? []), 'payment_methods' => array_values($post->payment_methods ?? []),
            'special_hours' => $post->scheduleExceptions->sortBy('date')->map(fn ($day) => [...$day->only(['is_closed', 'all_day', 'opens_at', 'closes_at']), 'date' => $day->date->format('Y-m-d')])->values()];
    }
}
