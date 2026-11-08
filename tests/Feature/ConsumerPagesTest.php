<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class ConsumerPagesTest extends CatalogTestCase
{
    public function test_public_profile_link_is_available_only_with_a_published_owned_business(): void
    {
        $owner = User::factory()->create();
        $this->actingAs($owner)->get('/akun')->assertInertia(fn (Assert $page) => $page->where('publicProfileAvailable', false)->where('ownedCount', 0));
        $business = $this->business('Usaha draf');
        $business->update(['owner_id' => $owner->id, 'status' => 'draft']);
        $this->get('/akun')->assertInertia(fn (Assert $page) => $page->where('publicProfileAvailable', false)->where('ownedCount', 1));
        $business->update(['status' => 'published']);
        $this->get('/akun')->assertInertia(fn (Assert $page) => $page->where('publicProfileAvailable', true));
    }

    public function test_favorite_counts_distinguish_saved_businesses_from_visible_posts_and_unavailable_businesses(): void
    {
        $user = User::factory()->create();
        $visible = $this->business('Dua lokasi');
        $this->sellingPost($visible, 112.731);
        $hidden = $this->business('Sudah tidak terbit');
        $hidden->update(['status' => 'draft']);
        $user->favorites()->attach([$visible->id, $hidden->id]);
        $this->actingAs($user)->get('/favorit')->assertInertia(fn (Assert $page) => $page
            ->where('savedCount', 2)->where('unavailableCount', 1)->has('businesses', 2)
            ->where('businesses.0.id', $visible->id)->where('businesses.1.id', $visible->id));
    }

    public function test_public_business_category_does_not_expose_the_owners_private_email(): void
    {
        $owner = User::factory()->create(['public_name' => 'Nama pemilik publik']);
        $business = $this->business('Kategori milik usaha');
        $business->update(['owner_id' => $owner->id, 'business_category' => 'Masakan rumahan']);
        $this->get('/pemilik/'.$owner->id)->assertInertia(fn (Assert $page) => $page
            ->where('businesses.0.business_category', 'Masakan rumahan')->where('owner.public_name', 'Nama pemilik publik')
            ->missing('owner.email')->missing('businesses.0.owner.email')->missing('businesses.0.contact_email'));
    }

    public function test_invalid_public_name_keeps_the_saved_name_and_valid_changes_are_trimmed(): void
    {
        $user = User::factory()->create(['public_name' => 'Nama tersimpan']);
        $this->actingAs($user)->from('/akun')->patch('/akun/nama-publik', ['public_name' => str_repeat('a', 81)])
            ->assertSessionHasErrors(['public_name' => 'Nama publik maksimal 80 karakter.']);
        $this->assertSame('Nama tersimpan', $user->fresh()->public_name);
        $this->patch('/akun/nama-publik', ['public_name' => '  Nama publik baru  '])->assertRedirect('/akun');
        $this->get('/akun')->assertInertia(fn (Assert $page) => $page->where('publicName', 'Nama publik baru')->where('publicProfileAvailable', false));
    }
}
