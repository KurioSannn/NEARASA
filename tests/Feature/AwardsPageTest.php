<?php

namespace Tests\Feature;

use Database\Seeders\AwardsDemoSeeder;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class AwardsPageTest extends CatalogTestCase
{
    public function test_awards_page_can_be_rendered(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->seed(AwardsDemoSeeder::class);

        $response = $this->get('/awards');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Awards')
            ->has('ranking')
            ->has('ranking.entries')
            ->where('selectedPeriod', 'weekly')
            ->where('selectedRegion', 'Sidoarjo')
        );
    }

    public function test_awards_page_can_filter_by_region_and_period(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->seed(AwardsDemoSeeder::class);

        $response = $this->get('/awards?period=monthly&region=Surabaya');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Awards')
            ->where('selectedPeriod', 'monthly')
            ->where('selectedRegion', 'Surabaya')
            ->has('ranking.entries')
        );
    }
}
