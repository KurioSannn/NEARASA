<?php

namespace Tests;

use App\Models\Business;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

abstract class CatalogTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-26 12:00', 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    protected function business(string $name, float $longitude = 112.73, bool $open = true): Business
    {
        $business = Business::create(['name' => $name, 'slug' => Str::slug($name), 'description' => 'Katalog uji', 'kind' => 'warung', 'photo' => '/images/demo/rice.jpg']);
        $business->menuItems()->create(['name' => 'Nasi ayam', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 20000]);
        $this->sellingPost($business, $longitude, $open);

        return $business;
    }

    protected function sellingPost(Business $business, float $longitude, bool $open = true): void
    {
        $post = $business->sellingPosts()->create(['name' => 'Pos', 'address' => 'Gedangan', 'latitude' => -7.38, 'longitude' => $longitude]);
        $post->weeklySchedules()->create(['weekday' => 1, 'opens_at' => $open ? '08:00' : '18:00', 'closes_at' => '23:00']);
    }
}
