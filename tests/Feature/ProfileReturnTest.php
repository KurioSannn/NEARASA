<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class ProfileReturnTest extends CatalogTestCase
{
    public function test_login_from_a_profile_keeps_its_selected_post_and_map_filters(): void
    {
        $business = $this->business('Kembali');
        $post = $business->sellingPosts()->first();
        $user = User::factory()->create(['password' => 'local-test-password']);
        $back = '/peta?'.http_build_query(['q' => 'ayam', 'max_price' => '20000', 'radius' => '5', 'business' => $business->slug, 'post' => (string) $post->id]);
        $return = '/usaha/'.$business->slug.'?'.http_build_query(['post' => $post->id, 'from' => $back]);
        $this->get('/masuk?'.http_build_query(['from' => $return]))->assertOk();
        $this->post('/masuk', ['email' => $user->email, 'password' => 'local-test-password'])->assertRedirect($return);
        $this->get($return)->assertInertia(fn (Assert $page) => $page->where('selectedPostId', $post->id)->where('backUrl', $back));
    }

    public function test_login_return_stays_internal_and_nested_external_back_url_is_rejected(): void
    {
        $business = $this->business('Aman');
        $post = $business->sellingPosts()->first();
        $user = User::factory()->create(['password' => 'local-test-password']);
        $this->get('/masuk?'.http_build_query(['from' => 'https://outside.example']))->assertOk();
        $this->post('/masuk', ['email' => $user->email, 'password' => 'local-test-password'])->assertRedirect('/akun');
        $return = '/usaha/'.$business->slug.'?'.http_build_query(['post' => $post->id, 'from' => 'https://outside.example']);
        $this->get('/masuk?'.http_build_query(['from' => $return]))->assertRedirect($return);
        $this->get($return)->assertInertia(fn (Assert $page) => $page->where('backUrl', '/jelajah'));
    }
}
