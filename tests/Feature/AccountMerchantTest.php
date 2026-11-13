<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use App\Services\MerchantPhotos;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\UserAccountSeeder;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
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

    public function test_example_account_seeder_does_not_create_or_overwrite_accounts_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        $owner = User::factory()->create(['email' => 'pemilik@nearasa.test', 'is_demo' => true]);
        $originalPasswordHash = $owner->password;

        (new UserAccountSeeder)->run();

        $this->assertDatabaseMissing('users', ['email' => 'user@nearasa.test']);
        $this->assertSame($originalPasswordHash, $owner->fresh()->password);
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

    public function test_provisioned_demo_owner_uses_regular_login_and_owns_only_demo_businesses(): void
    {
        $this->seed(CatalogSeeder::class);
        app()->detectEnvironment(fn () => 'production');
        $other = User::factory()->create();
        $real = $this->business('Usaha sungguhan');
        $real->update(['owner_id' => $other->id]);

        $this->artisan('nearasa:provision-demo-owner', ['email' => 'Juri@nearasa.test'])
            ->expectsQuestion('Kata sandi akun demo (min. 12 karakter)', 'sandi-demo-untuk-uji')
            ->assertSuccessful();

        $owner = User::where('email', 'juri@nearasa.test')->firstOrFail();
        $this->assertTrue($owner->is_demo);
        $this->assertEqualsCanonicalizing(['dapur-griya', 'pizza-sore'], $owner->businesses()->pluck('slug')->all());
        $this->assertSame($other->id, $real->refresh()->owner_id);
        $token = 'csrf-demo-juri';
        $this->withSession(['_token' => $token])->post('/masuk/demo', ['_token' => $token])->assertNotFound();
        $this->withSession(['_token' => $token])->post('/masuk', [
            '_token' => $token, 'email' => $owner->email, 'password' => 'sandi-demo-untuk-uji',
        ])->assertRedirect('/akun');
        $this->assertAuthenticatedAs($owner);
    }

    public function test_provisioning_preserves_existing_accounts_and_demo_ownership(): void
    {
        $this->seed(CatalogSeeder::class);
        $owner = User::factory()->create();
        $business = Business::where('slug', 'pizza-sore')->firstOrFail();
        $business->update(['owner_id' => $owner->id]);
        $password = $owner->password;

        foreach ([$owner->email, 'pengganti@nearasa.test'] as $email) {
            $this->artisan('nearasa:provision-demo-owner', ['email' => $email])
                ->expectsQuestion('Kata sandi akun demo (min. 12 karakter)', 'sandi-demo-untuk-uji')
                ->assertFailed();
        }

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($password, $owner->refresh()->password);
        $this->assertSame($owner->id, $business->refresh()->owner_id);
    }

    public function test_failed_avatar_upload_keeps_the_previous_photo(): void
    {
        $previous = '/media/'.str_repeat('a', 40).'.jpg';
        $user = User::factory()->create(['avatar' => $previous]);
        $photos = $this->mock(MerchantPhotos::class);
        $photos->shouldReceive('store')->once()->andThrow(new RuntimeException('Penyimpanan gagal.'));
        $photos->shouldNotReceive('delete');

        $this->actingAs($user)->post('/akun/foto', ['avatar' => UploadedFile::fake()->image('baru.jpg')])
            ->assertServerError();

        $this->assertSame($previous, $user->refresh()->avatar);
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
