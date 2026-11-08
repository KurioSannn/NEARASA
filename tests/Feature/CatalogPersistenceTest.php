<?php

namespace Tests\Feature;

use App\Models\Business;
use Database\Seeders\CatalogSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_is_idempotent_and_preserves_relations(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->seed(CatalogSeeder::class);
        $this->assertDatabaseCount('businesses', 8);
        $business = Business::where('slug', 'dapur-griya')->firstOrFail();
        $this->assertGreaterThan(0, $business->menuItems()->count());
        $this->assertGreaterThan(1, $business->sellingPosts()->count());
        $this->assertCount(7, $business->sellingPosts->first()->weeklySchedules);
        $this->assertTrue($business->is_demo);
        $this->assertNull($business->whatsapp);
    }

    public function test_business_slug_must_be_unique(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->expectException(QueryException::class);
        Business::create(['name' => 'Duplikat', 'slug' => 'dapur-griya', 'description' => 'Contoh', 'kind' => 'warung', 'photo' => '/images/demo/rice.jpg']);
    }
}
