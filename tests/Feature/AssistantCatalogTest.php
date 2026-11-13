<?php

namespace Tests\Feature;

use App\Models\InteractionEvent;
use Carbon\CarbonImmutable;
use Tests\CatalogTestCase;

class AssistantCatalogTest extends CatalogTestCase
{
    public function test_assistant_uses_catalog_prices_location_and_availability(): void
    {
        $business = $this->business('Dapur Uji');
        $post = $business->sellingPosts()->first();
        $menu = $business->menuItems()->first();
        $this->business('Dapur Jauh', 113.8)->sellingPosts()->update(['address' => 'Krian, Sidoarjo']);
        $draft = $this->business('Dapur Draf');
        $draft->update(['status' => 'draft']);
        $this->withSession(['search_location' => ['latitude' => -7.38, 'longitude' => 112.73, 'label' => 'Gedangan']]);

        $this->postJson('/asisten/rekomendasi', ['prompt' => 'Cari ayam terdekat di bawah Rp25 ribu'])
            ->assertOk()
            ->assertJsonCount(1, 'places')
            ->assertJsonPath('places.0.post_id', $post->id)
            ->assertJsonPath('places.0.price', 20000)
            ->assertJsonMissingPath('places.0.latitude');

        $menu->availabilityOverrides()->attach($post->id, ['sold_out' => true]);
        $this->postJson('/asisten/rekomendasi', ['prompt' => 'Cari ayam di Gedangan di bawah Rp25 ribu'])
            ->assertOk()
            ->assertJsonCount(0, 'places');

        $menu->availabilityOverrides()->detach($post->id);
        $menu->update(['price' => 26000]);
        $this->postJson('/asisten/rekomendasi', ['prompt' => 'Cari ayam terdekat di bawah Rp25 ribu'])
            ->assertOk()
            ->assertJsonCount(0, 'places');
    }

    public function test_recent_profile_views_change_popular_recommendations(): void
    {
        $first = $this->business('A Ayam');
        $second = $this->business('B Ayam');
        $prompt = ['prompt' => 'Rekomendasi terpopuler hari ini'];
        $this->postJson('/asisten/rekomendasi', $prompt)->assertJsonPath('places.0.slug', $first->slug);

        InteractionEvent::create([
            'business_id' => $second->id,
            'selling_post_id' => $second->sellingPosts()->first()->id,
            'type' => 'profile_view',
            'fingerprint' => str_repeat('a', 64),
            'dedup_key' => str_repeat('b', 64),
            'created_at' => CarbonImmutable::now('UTC')->subHour(),
        ]);

        $this->postJson('/asisten/rekomendasi', $prompt)
            ->assertJsonPath('places.0.slug', $second->slug)
            ->assertJsonMissingPath('places.0.fingerprint');
    }
}
