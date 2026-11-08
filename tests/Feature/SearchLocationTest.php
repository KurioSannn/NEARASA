<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class SearchLocationTest extends CatalogTestCase
{
    public function test_partial_out_of_bounds_and_non_finite_coordinates_are_rejected(): void
    {
        foreach ([['latitude' => -7.38], ['latitude' => 91, 'longitude' => 112], ['latitude' => -7, 'longitude' => 'NaN']] as $location) {
            $this->postJson('/lokasi', [...$location, 'label' => 'Uji'])->assertUnprocessable();
            $this->assertNull(session('search_location'));
        }
    }

    public function test_location_is_saved_in_session_without_entering_result_url(): void
    {
        $this->business('Gedangan');
        $this->from('/jelajah?q=Nasi')->post('/lokasi', ['latitude' => -7.38, 'longitude' => 112.73, 'label' => 'Gedangan'])->assertRedirect('/jelajah?q=Nasi')->assertSessionHas('search_location.latitude', -7.38);
        $this->get('/jelajah?q=Nasi')->assertInertia(fn (Assert $page) => $page->where('location.label', 'Gedangan')->has('businesses', 1)->url('/jelajah?q=Nasi'));
        $this->delete('/lokasi')->assertSessionMissing('search_location');
    }
}
