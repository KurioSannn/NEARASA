<?php

namespace Tests\Feature;

use App\Models\InteractionEvent;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Tests\CatalogTestCase;

class AssistantCatalogTest extends CatalogTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['services.gemini.key' => null]);
    }

    public function test_greetings_help_and_unrelated_requests_receive_guidance(): void
    {
        Http::preventStrayRequests();
        config(['services.gemini.key' => 'test-key']);

        foreach ([
            'halo' => 'Halo!',
            'gimana cara mencari makanannya?' => 'Ketik nama makanan',
            'kirimkan code html untuk membuat website umkm' => 'Aku bisa bantu mencari makanan',
        ] as $prompt => $prefix) {
            $response = $this->postJson('/asisten/rekomendasi', ['prompt' => $prompt])
                ->assertOk()->assertJsonCount(0, 'places');
            $this->assertStringStartsWith($prefix, $response->json('reply'));
        }

        Http::assertNothingSent();
    }

    public function test_project_and_registration_questions_are_answered_without_gemini(): void
    {
        Http::preventStrayRequests();
        config(['services.gemini.key' => 'test-key']);

        foreach ([
            'siapa firzan' => ['Firzan Syaroni', null],
            'web ini tentang apa?' => ['Sidoarjo dan Surabaya', '/jelajah'],
            'gimana cara jadi umkm' => ['Menu & harga', '/kelola-usaha/daftar'],
            'apa batasan asisten?' => ['Kelola Usaha', null],
        ] as $prompt => [$expectedText, $href]) {
            $response = $this->postJson('/asisten/rekomendasi', ['prompt' => $prompt])
                ->assertOk()->assertJsonCount(0, 'places')->assertJsonPath('source', 'catalog');
            $this->assertStringContainsString($expectedText, $response->json('reply'));
            $response->assertJsonPath($href === null ? 'action' : 'action.href', $href);
        }

        Http::assertNothingSent();
    }

    public function test_compound_question_about_function_and_team_is_answered_completely(): void
    {
        $response = $this->postJson('/asisten/rekomendasi', [
            'prompt' => 'Web NEARASA ini tentang apa dan siapa yang membuatnya?',
        ])->assertOk()->assertJsonCount(0, 'places')->assertJsonPath('source', 'catalog');

        $reply = $response->json('reply');
        $this->assertStringContainsString('Sidoarjo dan Surabaya', $reply);
        $this->assertStringContainsString('Firzan Syaroni', $reply);
        $this->assertStringContainsString('bismillah alhamdulillah', $reply);
        $response->assertJsonPath('action.href', '/jelajah');
    }

    public function test_gemini_interprets_search_but_catalog_checks_price_and_area(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [['finishReason' => 'STOP', 'content' => ['parts' => [
                    ['text' => '{"intent":"search","keywords":"ayam"}'],
                ]]]],
            ]),
        ]);
        $this->business('Warung cocok');
        $this->business('Warung mahal')->menuItems()->update(['price' => 30000]);
        $this->business('Warung beda area')->sellingPosts()->update(['address' => 'Krian']);

        $this->postJson('/asisten/rekomendasi', ['prompt' => 'Perut keroncongan, pengin ayam di Gedangan di bawah Rp25 ribu'])
            ->assertOk()->assertJsonPath('source', 'gemini')
            ->assertJsonCount(1, 'places')->assertJsonPath('places.0.slug', 'warung-cocok');
        Http::assertSentCount(1);
    }

    public function test_provider_errors_keep_catalog_search_available(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response([], 503)]);
        $this->business('Warung Ayam');

        $this->postJson('/asisten/rekomendasi', ['prompt' => 'Cari ayam di bawah Rp25 ribu'])
            ->assertOk()->assertJsonPath('source', 'catalog')->assertJsonCount(1, 'places');
    }

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
