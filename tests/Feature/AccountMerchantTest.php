<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class AccountMerchantTest extends CatalogTestCase
{
    public function test_guest_is_sent_to_login_and_returns_to_merchant_after_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => 'local-test-password']);
        $this->get('/kelola-usaha')->assertRedirect('/masuk');
        $this->post('/masuk', ['email' => $user->email, 'password' => 'local-test-password'])->assertRedirect('/kelola-usaha');
        $this->assertAuthenticatedAs($user);
    }

    public function test_wrong_password_does_not_start_a_session(): void
    {
        $user = User::factory()->create(['password' => 'correct-password']);
        $this->post('/masuk', ['email' => $user->email, 'password' => 'wrong-password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_logout_ends_authenticated_session(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post('/keluar')->assertRedirect('/');
        $this->assertGuest();
        $this->get('/akun')->assertRedirect('/masuk');
    }

    public function test_demo_login_is_unavailable_outside_local_even_if_flag_is_on(): void
    {
        config(['nearasa.demo_auth' => true]);
        $this->post('/masuk/demo')->assertNotFound();
        $this->assertGuest();
    }

    public function test_local_demo_login_only_uses_marked_demo_account(): void
    {
        app()->detectEnvironment(fn () => 'local');
        config(['nearasa.demo_auth' => true]);
        $user = User::factory()->create(['email' => 'pemilik@nearasa.test', 'is_demo' => false]);
        $this->withSession(['_token' => 'demo-test-token'])->post('/masuk/demo', ['_token' => 'demo-test-token'])->assertNotFound();
        $user->forceFill(['is_demo' => true])->save();
        $this->withSession(['_token' => 'demo-test-token'])->post('/masuk/demo', ['_token' => 'demo-test-token'])->assertRedirect('/akun');
        $this->assertAuthenticatedAs($user);
    }

    public function test_owner_can_only_see_and_update_owned_businesses(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $mine = $this->business('Milik saya');
        $mine->update(['owner_id' => $owner->id]);
        $theirs = $this->business('Milik lain');
        $theirs->update(['owner_id' => $other->id]);
        $this->actingAs($owner)->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page->component('Merchant/Dashboard', false)->has('businesses', 1)->where('businesses.0.name', 'Milik saya'));
        $this->get('/kelola-usaha/'.$theirs->slug)->assertForbidden();
        $this->patch('/kelola-usaha/'.$theirs->slug, ['name' => 'Diganti', 'kind' => 'warung', 'description' => 'Tidak boleh'])->assertForbidden();
        $this->patch('/kelola-usaha/'.$mine->slug, ['name' => 'Nama baru', 'kind' => 'ruko', 'description' => 'Profil diperbarui', 'owner_id' => $other->id, 'status' => 'draft'])->assertRedirect();
        $this->assertSame('Nama baru', $mine->fresh()->name);
        $this->assertSame($owner->id, $mine->fresh()->owner_id);
        $this->assertSame('published', $mine->fresh()->status);
    }

    public function test_favorites_are_persisted_per_account_without_duplicates(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $business = $this->business('Favorit');
        $this->actingAs($user)->post('/favorit/'.$business->slug)->assertRedirect();
        $this->post('/favorit/'.$business->slug)->assertRedirect();
        $this->assertDatabaseCount('business_user', 1);
        $this->get('/favorit')->assertInertia(fn (Assert $page) => $page->component('Favorites', false)->has('businesses', 1));
        $this->actingAs($other)->get('/favorit')->assertInertia(fn (Assert $page) => $page->has('businesses', 0));
        $this->actingAs($user)->delete('/favorit/'.$business->slug)->assertRedirect();
        $this->assertDatabaseCount('business_user', 0);
    }

    public function test_local_demo_still_requires_csrf_and_can_be_disabled(): void
    {
        app()->detectEnvironment(fn () => 'local');
        config(['nearasa.demo_auth' => true]);
        $this->post('/masuk/demo')->assertStatus(419);
        config(['nearasa.demo_auth' => false]);
        $this->withSession(['_token' => 'valid-token'])->post('/masuk/demo', ['_token' => 'valid-token'])->assertNotFound();
        $this->assertGuest();
    }

    public function test_account_props_never_expose_password_or_session_credentials(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/akun')->assertInertia(fn (Assert $page) => $page->where('auth.user.email', $user->email)->missing('auth.user.password')->missing('auth.user.remember_token'));
    }
}
