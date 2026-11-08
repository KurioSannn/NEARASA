<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class MerchantManagementTest extends CatalogTestCase
{
    private function ownedBusiness(string $name = 'Usaha pemilik'): Business
    {
        $owner = User::factory()->create();
        $business = $this->business($name);
        $business->update(['owner_id' => $owner->id]);
        $this->actingAs($owner);

        return $business;
    }

    private function menuData(array $changes = []): array
    {
        return [...['name' => 'Pizza keju', 'group' => 'Makanan', 'category' => 'Pizza', 'price' => 35000, 'sold_out' => false], ...$changes];
    }

    private function postData(array $changes = []): array
    {
        return [...['name' => 'Pos sekolah', 'address' => 'Gedangan, Sidoarjo', 'landmark' => 'Depan SD', 'latitude' => -7.387, 'longitude' => 112.734,
            'schedules' => [['weekday' => 1, 'opens_at' => '08:00', 'closes_at' => '13:00'], ['weekday' => 2, 'opens_at' => '18:00', 'closes_at' => '01:00']], 'closed_dates' => ['2026-10-27']], ...$changes];
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('foto.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9BkAAAAASUVORK5CYII='));
    }

    public function test_owner_can_replace_profile_photo_and_edit_contact_without_changing_ownership(): void
    {
        Storage::fake('public');
        $business = $this->ownedBusiness();
        $url = '/kelola-usaha/'.$business->slug;
        $data = ['name' => 'Usaha baru', 'kind' => 'rombong', 'description' => 'Menu pagi dan sore', 'whatsapp' => '081234567890', 'photo' => $this->image(), 'owner_id' => 999, 'status' => 'draft'];
        $this->from($url)->patch($url, $data)->assertRedirect($url);
        $business->refresh();
        $this->assertSame('6281234567890', $business->whatsapp);
        $this->assertStringStartsWith('/media/', $business->photo);
        $this->assertSame('published', $business->status);
        $this->assertSame(auth()->id(), $business->owner_id);
        $oldPhoto = $business->photo;
        Storage::disk('public')->assertExists('merchant/'.basename($oldPhoto));
        $this->get($oldPhoto)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->patch($url, [...$data, 'photo' => $this->image()])->assertRedirect();
        Storage::disk('public')->assertMissing('merchant/'.basename($oldPhoto));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.photo', $business->fresh()->photo)->where('business.name', 'Usaha baru'));
    }

    public function test_bad_photo_and_contact_do_not_partially_update_the_profile(): void
    {
        $business = $this->ownedBusiness();
        $this->patch('/kelola-usaha/'.$business->slug, ['name' => 'Jangan disimpan', 'kind' => 'ruko', 'description' => 'Baru', 'photo' => UploadedFile::fake()->create('code.svg', 1, 'image/svg+xml'), 'whatsapp' => 'bukan nomor'])->assertSessionHasErrors(['photo', 'whatsapp']);
        $this->assertSame('Usaha pemilik', $business->fresh()->name);
    }

    public function test_owner_can_create_edit_and_remove_menu_including_photo_and_availability(): void
    {
        Storage::fake('public');
        $business = $this->ownedBusiness();
        $base = '/kelola-usaha/'.$business->slug.'/menu';
        $this->post($base, $this->menuData(['photo' => $this->image()]))->assertRedirect();
        $menu = $business->menuItems()->where('name', 'Pizza keju')->firstOrFail();
        Storage::disk('public')->assertExists('merchant/'.basename($menu->photo));
        $oldPhoto = $menu->photo;
        $this->patch($base.'/'.$menu->id, $this->menuData(['name' => 'Pizza spesial', 'price' => 42000, 'sold_out' => true, 'remove_photo' => true, 'business_id' => 999]))->assertRedirect();
        $menu->refresh();
        $this->assertSame(42000, $menu->price);
        $this->assertTrue($menu->sold_out);
        $this->assertNull($menu->photo);
        $this->assertSame($business->id, $menu->business_id);
        Storage::disk('public')->assertMissing('merchant/'.basename($oldPhoto));
        $this->delete($base.'/'.$menu->id)->assertRedirect();
        $this->assertDatabaseMissing('menu_items', ['id' => $menu->id]);
        $this->assertSame(1, $business->menuItems()->count());
        $this->delete($base.'/'.$business->menuItems()->first()->id)->assertSessionHasErrors('menu');
        $this->assertSame(1, $business->menuItems()->count());
    }

    public function test_invalid_menu_is_rejected_without_changing_existing_price(): void
    {
        $business = $this->ownedBusiness();
        $menu = $business->menuItems()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/menu/'.$menu->id, $this->menuData(['price' => -1, 'category' => 'Kategori palsu', 'group' => 'Lain']))->assertSessionHasErrors(['price', 'category', 'group']);
        $this->assertSame(20000, $menu->fresh()->price);
    }

    public function test_owner_can_create_and_update_post_coordinates_weekly_hours_and_closures(): void
    {
        $business = $this->ownedBusiness();
        $base = '/kelola-usaha/'.$business->slug.'/pos';
        $this->post($base, $this->postData())->assertRedirect();
        $post = $business->sellingPosts()->where('name', 'Pos sekolah')->firstOrFail();
        $this->assertSame(2, $post->weeklySchedules()->count());
        $this->assertDatabaseHas('schedule_exceptions', ['selling_post_id' => $post->id, 'date' => '2026-10-27']);
        $this->patch($base.'/'.$post->id, $this->postData(['name' => 'Pos sore', 'latitude' => -7.340, 'longitude' => 112.787, 'schedules' => [['weekday' => 3, 'opens_at' => '17:00', 'closes_at' => '02:00']], 'closed_dates' => []]))->assertRedirect();
        $this->assertSame(-7.340, $post->fresh()->latitude);
        $this->assertSame(1, $post->weeklySchedules()->count());
        $this->assertSame('02:00', $post->weeklySchedules()->first()->closes_at);
        $this->assertSame(0, $post->scheduleExceptions()->count());
        $this->get('/kelola-usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.posts.1.latitude', -7.340)->has('business.posts.1.closed_dates', 0));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.posts.1.name', 'Pos sore'));
        $this->delete($base.'/'.$post->id)->assertRedirect();
        $this->assertDatabaseMissing('weekly_schedules', ['selling_post_id' => $post->id]);
        $this->delete($base.'/'.$business->sellingPosts()->first()->id)->assertSessionHasErrors('post');
        $this->assertSame(1, $business->sellingPosts()->count());
    }

    public function test_invalid_post_update_keeps_all_existing_schedules_and_dates(): void
    {
        $business = $this->ownedBusiness();
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['latitude' => '', 'longitude' => 190, 'schedules' => [['weekday' => 1, 'opens_at' => '12:00', 'closes_at' => '12:00']], 'closed_dates' => ['not-a-date']]))->assertSessionHasErrors(['latitude', 'longitude', 'schedules.0.closes_at', 'closed_dates.0']);
        $this->assertSame('Pos', $post->fresh()->name);
        $this->assertSame('08:00', $post->weeklySchedules()->first()->opens_at);
        $this->assertSame(0, $post->scheduleExceptions()->count());
    }

    public function test_duplicate_schedule_slots_are_rejected_instead_of_a_database_error(): void
    {
        $business = $this->ownedBusiness();
        $slot = ['weekday' => 1, 'opens_at' => '08:00', 'closes_at' => '12:00'];
        $this->post('/kelola-usaha/'.$business->slug.'/pos', $this->postData(['schedules' => [$slot, $slot]]))->assertSessionHasErrors('schedules.1.opens_at');
        $this->assertSame(1, $business->sellingPosts()->count());
    }

    public function test_guest_and_other_owners_cannot_mutate_menus_or_posts_even_with_an_owned_parent_url(): void
    {
        $mine = $this->ownedBusiness();
        $theirs = $this->business('Usaha lain');
        $theirs->update(['owner_id' => User::factory()->create()->id]);
        $menu = $theirs->menuItems()->first();
        $post = $theirs->sellingPosts()->first();
        foreach ([$mine, $theirs] as $parent) {
            $base = '/kelola-usaha/'.$parent->slug;
            $this->patch($base.'/menu/'.$menu->id, $this->menuData())->assertForbidden();
            $this->delete($base.'/menu/'.$menu->id)->assertForbidden();
            $this->patch($base.'/pos/'.$post->id, $this->postData())->assertForbidden();
            $this->delete($base.'/pos/'.$post->id)->assertForbidden();
        }
        $this->post('/kelola-usaha/'.$theirs->slug.'/menu', $this->menuData())->assertForbidden();
        $this->post('/kelola-usaha/'.$theirs->slug.'/pos', $this->postData())->assertForbidden();
        auth()->logout();
        $this->post('/kelola-usaha/'.$mine->slug.'/menu', $this->menuData())->assertRedirect('/masuk');
    }
}
