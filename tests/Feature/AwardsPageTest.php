<?php

namespace Tests\Feature;

use Database\Seeders\AwardsDemoSeeder;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class AwardsPageTest extends CatalogTestCase
{
    public function test_home_awards_highlight_uses_the_current_public_leader_name_and_photo(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('awardHighlight', null));
        $this->seed(AwardsDemoSeeder::class);

        $leader = \App\Models\Business::where('slug', 'roti-pagi')->firstOrFail();
        $owner = \App\Models\User::factory()->create();
        $leader->update(['owner_id' => $owner->id]);
        $this->actingAs($owner)->patch('/kelola-usaha/'.$leader->slug, [
            'section' => 'about',
            'name' => 'Roti Pagi Baru',
            'kind' => $leader->kind,
            'description' => $leader->description,
        ])->assertRedirect();
        $leader->update(['photo' => '/media/foto-baru.webp']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('awardHighlight.slug', $leader->slug)
            ->where('awardHighlight.name', 'Roti Pagi Baru')
            ->where('awardHighlight.photo', '/media/foto-baru.webp'));

        $leader->update(['status' => 'draft']);
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('awardHighlight.slug', 'dapur-griya'));
    }

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

    public function test_invalid_dates_fall_back_to_the_default_for_the_period(): void
    {
        $this->travelTo(\Carbon\CarbonImmutable::parse('2026-11-13 10:00:00', 'Asia/Jakarta'));

        foreach (['start=2025-02-30', 'start=invalid', 'start%5B%5D=invalid'] as $query) {
            $this->get('/awards?period=annual&region=Surabaya&'.$query)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->where('selectedPeriod', 'annual')
                    ->where('selectedRegion', 'Surabaya')
                    ->where('selectedStart', '2026-01-01'));
        }
    }
}
