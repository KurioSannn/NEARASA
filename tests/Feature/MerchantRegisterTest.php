<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_registration(): void
    {
        $response = $this->get('/kelola-usaha/daftar');
        $response->assertRedirect('/masuk');
    }

    public function test_authenticated_user_can_view_registration_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/kelola-usaha/daftar');
        $response->assertOk();
    }

    public function test_user_can_register_new_business_successfully(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'Warung Pojok Sedap',
            'kind' => 'warung',
            'business_category' => 'Masakan rumahan',
            'description' => 'Warung makan sederhana dengan masakan khas rumahan setiap hari.',
            'whatsapp' => '081234567890',
            'post_name' => 'Gerai Utama',
            'address' => 'Jl. Merdeka No. 45, Sidoarjo',
            'landmark' => 'Dekat pasar',
            'latitude' => -7.387,
            'longitude' => 112.734,
            'opens_at' => '07:00',
            'closes_at' => '20:00',
        ];

        $response = $this->actingAs($user)->post('/kelola-usaha/daftar', $payload);

        $response->assertRedirect('/kelola-usaha');

        $this->assertDatabaseHas('businesses', [
            'owner_id' => $user->id,
            'name' => 'Warung Pojok Sedap',
            'slug' => 'warung-pojok-sedap',
            'kind' => 'warung',
            'whatsapp' => '6281234567890',
            'status' => 'published',
            'is_demo' => false,
        ]);

        $business = Business::where('slug', 'warung-pojok-sedap')->firstOrFail();
        $this->assertCount(1, $business->sellingPosts);

        $post = $business->sellingPosts->first();
        $this->assertEquals('Gerai Utama', $post->name);
        $this->assertEquals('Jl. Merdeka No. 45, Sidoarjo', $post->address);
        $this->assertCount(7, $post->weeklySchedules);
    }
}
