<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_archive_and_restore_business(): void
    {
        $owner = User::factory()->create();
        $business = Business::create([
            'owner_id' => $owner->id,
            'name' => 'Kedai Kopi Santai',
            'slug' => 'kedai-kopi-santai',
            'kind' => 'ruko',
            'description' => 'Kedai kopi hangat untuk ngobrol.',
            'status' => 'published',
            'photo' => '/images/demo/coffee.jpg',
            'is_demo' => false,
        ]);
        $post = $business->sellingPosts()->create([
            'name' => 'Pos Utama',
            'address' => 'Jl. Sedap No. 1, Sidoarjo',
            'latitude' => -7.387,
            'longitude' => 112.734,
            'operating_status' => 'operating',
        ]);
        $business->menuItems()->create([
            'name' => 'Kopi Tubruk',
            'group' => 'food',
            'category' => 'Minuman',
            'price' => 10000,
            'photo' => '/images/demo/coffee.jpg',
        ]);
        $post->weeklySchedules()->create([
            'weekday' => 1,
            'opens_at' => '08:00',
            'closes_at' => '22:00',
            'all_day' => false,
        ]);

        // 1. Initial check: business is published and searchable
        $this->assertEquals('published', $business->fresh()->status);
        $response = $this->get('/jelajah?q=Kedai+Kopi+Santai');
        $response->assertOk();
        $this->assertTrue(
            collect($response->original->getData()['page']['props']['businesses'] ?? [])
                ->contains('slug', 'kedai-kopi-santai')
        );

        // 2. Owner archives business
        $archiveResponse = $this->actingAs($owner)->post("/kelola-usaha/{$business->slug}/arsip");
        $archiveResponse->assertRedirect("/kelola-usaha/{$business->slug}");
        $this->assertEquals('archived', $business->fresh()->status);

        // 3. Archived business is excluded from public search
        $responseAfterArchive = $this->get('/jelajah?q=Kedai+Kopi+Santai');
        $responseAfterArchive->assertOk();
        $this->assertFalse(
            collect($responseAfterArchive->original->getData()['page']['props']['businesses'] ?? [])
                ->contains('slug', 'kedai-kopi-santai')
        );

        // 4. Owner restores business
        $restoreResponse = $this->actingAs($owner)->post("/kelola-usaha/{$business->slug}/pulihkan");
        $restoreResponse->assertRedirect("/kelola-usaha/{$business->slug}");
        $this->assertEquals('published', $business->fresh()->status);

        // 5. Restored business is visible again
        $responseAfterRestore = $this->get('/jelajah?q=Kedai+Kopi+Santai');
        $this->assertTrue(
            collect($responseAfterRestore->original->getData()['page']['props']['businesses'] ?? [])
                ->contains('slug', 'kedai-kopi-santai')
        );
    }

    public function test_non_owner_cannot_archive_business(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $business = Business::create([
            'owner_id' => $owner->id,
            'name' => 'Warung Rahasia',
            'slug' => 'warung-rahasia',
            'kind' => 'warung',
            'description' => 'Warung tertutup.',
            'status' => 'published',
            'photo' => '/images/demo/rice.jpg',
            'is_demo' => false,
        ]);

        // Attempt by another authenticated user
        $response = $this->actingAs($otherUser)->post("/kelola-usaha/{$business->slug}/arsip");
        $response->assertForbidden();

        // Attempt by guest
        auth()->logout();
        $guestResponse = $this->post("/kelola-usaha/{$business->slug}/arsip");
        $guestResponse->assertRedirect('/masuk');

        $this->assertEquals('published', $business->fresh()->status);
    }
}
