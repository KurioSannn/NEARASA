<?php

namespace Tests\Feature;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Services\CatalogService;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class CatalogSearchTest extends CatalogTestCase
{
    private function search(array $filters = [], bool $located = true)
    {
        return app(CatalogService::class)->search(CatalogFilters::from($filters), $located ? new SearchLocation(-7.38, 112.73, 'Gedangan') : null, CarbonImmutable::now());
    }

    public function test_category_and_budget_must_match_the_same_menu(): void
    {
        $business = $this->business('Tidak cocok');
        $business->menuItems()->delete();
        $business->menuItems()->createMany([
            ['name' => 'Pizza', 'group' => 'Makanan', 'category' => 'Pizza', 'price' => 40000],
            ['name' => 'Kopi', 'group' => 'Minuman', 'category' => 'Kopi', 'price' => 10000],
        ]);
        $this->assertCount(0, $this->search(['category' => 'Pizza', 'max_price' => 15000]));
    }

    public function test_literal_unicode_quote_and_percent_search(): void
    {
        $this->business("Kedai 100% Énak 'Bu'");
        $this->business('Kedai lain');
        foreach (['%', 'énak', "'Bu'"] as $term) {
            $this->assertCount(1, $this->search(['q' => $term]));
        }
    }

    public function test_open_results_sort_before_nearer_closed_results(): void
    {
        $this->business('Dekat tutup', 112.731, false);
        $this->business('Jauh buka', 112.75, true);
        $this->assertSame(['jauh-buka', 'dekat-tutup'], $this->search()->pluck('slug')->all());
    }

    public function test_each_post_gets_a_card_and_open_post_sorts_first_within_radius(): void
    {
        $business = $this->business('Dua pos', 112.731, false);
        $this->sellingPost($business, 112.75, true);
        $cards = $this->search();
        $this->assertCount(2, $cards);
        $this->assertTrue($cards[0]['is_open']);
        $this->assertSame(112.75, $cards[0]['post']['longitude']);
        $smallRadius = $this->search(['radius' => 0.5]);
        $this->assertFalse($smallRadius[0]['is_open']);
    }

    public function test_radius_unlimited_and_unknown_location(): void
    {
        $this->business('Surabaya', 112.85);
        $this->assertCount(0, $this->search());
        $this->assertCount(1, $this->search(['radius' => 'unlimited']));
        $this->assertNull($this->search([], false)[0]['distance']);
    }

    public function test_pages_read_published_catalog_and_unknown_slug_is_404(): void
    {
        $business = $this->business('Terbit');
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Home', false)->has('businesses', 1));
        $this->get('/jelajah?q=Terbit')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Explore', false)->has('businesses', 1));
        $this->get('/usaha/terbit')->assertOk()->assertInertia(fn (Assert $page) => $page->component('BusinessDetail', false)->where('business.name', 'Terbit'));
        $business->update(['status' => 'draft']);
        $this->get('/usaha/terbit')->assertNotFound();
        $this->get('/usaha/tidak-ada')->assertNotFound();
    }

    public function test_invalid_filters_are_rejected(): void
    {
        $this->getJson('/jelajah?radius=-1&max_price=abc&category=unknown')->assertUnprocessable()->assertJsonValidationErrors(['radius', 'max_price', 'category']);
    }

    public function test_detail_preserves_selected_post_even_when_another_post_is_open(): void
    {
        $business = $this->business('Dua pos', 112.731, false);
        $this->sellingPost($business, 112.75, true);
        $selectedPost = $this->search(['radius' => 0.5])[0]['post'];
        $this->get('/usaha/dua-pos?post='.$selectedPost['id'])
            ->assertInertia(fn (Assert $page) => $page->where('selectedPostId', $selectedPost['id']));
    }

    public function test_detail_preserves_safe_catalog_return_url(): void
    {
        $this->business('Uji');
        $origin = '/jelajah?category=Ayam&max_price=25000&radius=unlimited';
        $this->get('/usaha/uji?from='.rawurlencode($origin))->assertInertia(fn (Assert $page) => $page->where('backUrl', $origin));
        $this->get('/usaha/uji?from='.rawurlencode('https://example.com/jelajah'))->assertInertia(fn (Assert $page) => $page->where('backUrl', '/jelajah'));
    }
}
