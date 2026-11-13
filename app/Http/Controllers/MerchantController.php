<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantProfileRequest;
use App\Models\Business;
use App\Models\ClosedReport;
use App\Services\BusinessProfile;
use App\Services\CatalogOptions;
use App\Services\CatalogService;
use App\Services\InteractionTracker;
use App\Services\MerchantPhotos;
use App\Services\OpeningHours;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Throwable;

class MerchantController extends Controller
{
    public function index(Request $request)
    {
        $businesses = $request->user()->businesses()->withCount(['menuItems', 'sellingPosts'])->with(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions'])->orderBy('name')->get();

        return Inertia::render('Merchant/Dashboard', [
            'businesses' => $this->businessOptions($businesses),
            'operations' => $this->operations($businesses, includeMenus: false), 'statistics' => app(InteractionTracker::class)->statistics($request->user()),
            'reports' => $this->reports($businesses->pluck('id')), 'publicName' => $request->user()->public_name ?? '',
            'merchantNavigation' => $this->navigation($request, $businesses),
        ]);
    }

    public function manage(Request $request)
    {
        $businesses = $request->user()->businesses()->orderBy('name')->get();
        $selected = $businesses->firstWhere('id', $request->session()->get('merchant_business_id')) ?? $businesses->first();
        if ($selected) {
            return redirect()->route('merchant.edit', $selected->slug);
        }

        return Inertia::render('Merchant/BusinessEdit', ['business' => null, 'operations' => [], 'options' => CatalogOptions::all(), 'merchantNavigation' => $this->navigation($request, $businesses)]);
    }

    public function edit(Request $request, Business $business)
    {
        abort_unless($business->owner_id === $request->user()->id, 403);
        $request->session()->put('merchant_business_id', $business->id);
        $business->load(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions']);

        $profile = app(BusinessProfile::class);

        return Inertia::render('Merchant/BusinessEdit', ['options' => CatalogOptions::all(), 'merchantNavigation' => $this->navigation($request), 'operations' => $this->operations(collect([$business])), 'business' => [...$business->only(['id', 'slug', 'name', 'description', 'kind', 'photo', 'status', 'is_demo']), ...$profile->information($business),
            'menus' => $business->menuItems->map(fn ($menu) => $profile->menuInformation($menu, $business->sellingPosts))->values(),
            'posts' => $business->sellingPosts->sortBy('id')->map(fn ($post) => [...$post->only(['id', 'name', 'address', 'landmark', 'latitude', 'longitude']), ...$profile->postInformation($post), 'schedules' => $post->weeklySchedules->map->only(['weekday', 'opens_at', 'closes_at', 'all_day'])->values(), 'closed_dates' => $post->scheduleExceptions->where('is_closed', true)->map(fn ($date) => $date->date->format('Y-m-d'))->sort()->values()])->values()]]);
    }

    public function reportIndex(Request $request)
    {
        $businesses = $request->user()->businesses()->orderBy('name')->get();
        $ids = $businesses->pluck('id');
        $businessId = $request->integer('business') ?: null;
        abort_if($businessId && ! $ids->contains($businessId), 404);
        $status = in_array($request->query('status'), ['pending', 'resolved'], true) ? $request->query('status') : 'all';
        $filteredIds = $businessId ? collect([$businessId]) : $ids;
        $all = ClosedReport::whereIn('business_id', $filteredIds);
        $pending = (clone $all)->whereNull('resolved_at')->count();
        $resolved = (clone $all)->whereNotNull('resolved_at')->count();
        $reports = $this->reportQuery($filteredIds);
        if ($status === 'pending') {
            $reports->whereNull('closed_reports.resolved_at');
        } elseif ($status === 'resolved') {
            $reports->whereNotNull('closed_reports.resolved_at');
        }

        return Inertia::render('Merchant/Reports', [
            'merchantNavigation' => $this->navigation($request, $businesses),
            'filters' => ['status' => $status, 'business' => $businessId],
            'counts' => ['all' => $pending + $resolved, 'pending' => $pending, 'resolved' => $resolved],
            'reports' => $reports->paginate(15, $this->reportFields())->withQueryString(),
        ]);
    }

    public function settings(Request $request)
    {
        $businesses = $request->user()->businesses()->withCount(['menuItems', 'sellingPosts'])->with(['menuItems.availabilityOverrides', 'sellingPosts.weeklySchedules', 'sellingPosts.scheduleExceptions'])->orderBy('name')->get();
        $requestedSlug = $request->query('usaha');
        $selected = ($requestedSlug ? $businesses->firstWhere('slug', $requestedSlug) : null)
            ?? $businesses->firstWhere('id', $request->session()->get('merchant_business_id'))
            ?? $businesses->first();

        if ($selected) {
            $request->session()->put('merchant_business_id', $selected->id);
        }

        $profile = app(BusinessProfile::class);
        $businessData = $selected ? [
            ...$selected->only(['id', 'slug', 'name', 'description', 'kind', 'photo', 'status', 'is_demo']),
            ...$profile->information($selected),
            'menus' => [],
            'posts' => [],
        ] : null;

        return Inertia::render('Merchant/Settings', [
            'business' => $businessData,
            'businesses' => $this->businessOptions($businesses),
            'publicName' => $request->user()->public_name ?? '',
            'publicProfileAvailable' => $businesses->where('status', 'published')->isNotEmpty(),
            'merchantNavigation' => $this->navigation($request, $businesses),
        ]);
    }

    private function businessOptions(Collection $businesses): Collection
    {
        return $businesses->map->only(['id', 'slug', 'name', 'kind', 'photo', 'status', 'is_demo', 'menu_items_count', 'selling_posts_count'])->values();
    }

    private function navigation(Request $request, ?Collection $businesses = null): array
    {
        $businesses ??= $request->user()->businesses()->orderBy('name')->get();
        $selected = $businesses->firstWhere('id', $request->session()->get('merchant_business_id')) ?? $businesses->first();

        return ['businesses' => $this->businessOptions($businesses), 'manage_url' => $selected ? route('merchant.edit', $selected->slug, false) : route('merchant.manage', absolute: false),
            'pending_reports' => ClosedReport::whereIn('business_id', $businesses->pluck('id'))->whereNull('resolved_at')->count()];
    }

    private function operations(Collection $businesses, bool $includeMenus = true): array
    {
        $profile = app(BusinessProfile::class);
        $catalog = app(CatalogService::class);
        $now = CarbonImmutable::now();
        $openingHours = app(OpeningHours::class);

        return $businesses->flatMap(fn ($business) => $business->sellingPosts->map(function ($post) use ($business, $profile, $catalog, $openingHours, $now, $includeMenus) {
            $menus = $includeMenus ? $business->menuItems->map(function ($menu) use ($business, $profile, $post) {
                $item = $profile->menuInformation($menu, $business->sellingPosts);
                $item['sold_out'] = collect($item['availability'])->firstWhere('post_id', $post->id)['sold_out'] ?? $item['sold_out'];

                return $item;
            })->values()->all() : [];

            return ['business_id' => $business->id, 'business_slug' => $business->slug, 'business_name' => $business->name,
                'post' => [...$catalog->post($post, null, $now), 'schedule_today' => $openingHours->scheduleToday($post, $now)],
                'menus' => $menus];
        }))->values()->all();
    }

    private function reports(Collection $businessIds): array
    {
        return $this->reportQuery($businessIds)->limit(50)->get($this->reportFields())->toArray();
    }

    private function reportQuery(Collection $businessIds): Builder
    {
        return ClosedReport::whereIn('closed_reports.business_id', $businessIds)
            ->join('selling_posts', 'selling_posts.id', '=', 'closed_reports.selling_post_id')
            ->join('businesses', 'businesses.id', '=', 'closed_reports.business_id')
            ->orderByRaw('closed_reports.resolved_at IS NOT NULL')->orderByDesc('closed_reports.created_at')->orderByDesc('closed_reports.id');
    }

    private function reportFields(): array
    {
        return ['closed_reports.id', 'closed_reports.selling_post_id as post_id', 'selling_posts.name as post_name', 'businesses.id as business_id', 'businesses.slug as business_slug', 'businesses.photo as business_photo', 'businesses.is_demo as business_is_demo', 'businesses.name as business_name', 'closed_reports.note', 'closed_reports.created_at', 'closed_reports.resolved_at'];
    }

    public function update(MerchantProfileRequest $request, Business $business, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id, 403);
        $data = $request->validated();
        unset($data['section'], $data['photo'], $data['logo'], $data['menu_pdf'], $data['remove_logo'], $data['remove_menu_pdf']);
        foreach (['social_links', 'action_links'] as $links) {
            if (isset($data[$links])) {
                $data[$links] = array_filter($data[$links], fn ($url) => is_string($url) && $url !== '');
            }
        }
        if (array_key_exists('whatsapp', $data) && $data['whatsapp']) {
            $data['whatsapp'] = str_starts_with($data['whatsapp'], '0') ? '62'.substr($data['whatsapp'], 1) : ltrim($data['whatsapp'], '+');
        }
        $changed = [];
        try {
            foreach (['photo', 'logo', 'menu_pdf'] as $field) {
                if ($request->hasFile($field)) {
                    $data[$field] = $photos->store($request->file($field));
                    $changed[$field] = $business->$field;
                } elseif ($field !== 'photo' && $request->boolean('remove_'.$field)) {
                    $data[$field] = null;
                    $changed[$field] = $business->$field;
                }
            }
            $business->update($data);
        } catch (Throwable $error) {
            foreach (array_keys($changed) as $field) {
                $photos->delete($data[$field] ?? null);
            }
            throw $error;
        }
        foreach ($changed as $previous) {
            $photos->delete($previous);
        }

        return back(303)->with('success', 'Profil usaha berhasil disimpan.');
    }
}
