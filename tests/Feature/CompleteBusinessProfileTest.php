<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use App\Services\OpeningHours;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class CompleteBusinessProfileTest extends CatalogTestCase
{
    private function owned(): Business
    {
        $user = User::factory()->create();
        $business = $this->business('Profil lengkap');
        $business->update(['owner_id' => $user->id]);
        $this->actingAs($user);

        return $business;
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('foto.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9BkAAAAASUVORK5CYII='));
    }

    private function postData(array $changes = []): array
    {
        return [...['name' => 'Pos pagi', 'address' => 'Gedangan, Sidoarjo', 'latitude' => -7.387, 'longitude' => 112.734,
            'schedules' => [['weekday' => 1, 'opens_at' => '08:00', 'closes_at' => '17:00', 'all_day' => false]], 'special_hours' => [],
            'operating_status' => 'operating', 'service_options' => ['dine_in', 'takeaway'], 'facilities' => ['wifi', 'motorcycle_parking'], 'payment_methods' => ['cash', 'qris'], 'service_area' => 'Gedangan'], ...$changes];
    }

    private function updateData(array $changes = []): array
    {
        return [...['type' => 'update', 'title' => 'Menu baru hari ini', 'body' => 'Tersedia menu sarapan.', 'is_published' => true, 'starts_on' => '2026-10-26', 'ends_on' => '2026-10-30', 'cta_label' => 'Lihat menu', 'cta_url' => 'https://example.com/menu'], ...$changes];
    }

    public function test_about_contact_and_links_round_trip_to_customer_profile_with_partial_saves(): void
    {
        $business = $this->owned();
        $base = '/kelola-usaha/'.$business->slug;
        $this->patch($base, ['section' => 'about', 'name' => 'Warung lengkap', 'kind' => 'ruko', 'description' => 'Sarapan dan makan siang', 'business_category' => 'Kedai sarapan', 'additional_categories' => ['Warung makan', 'Katering'], 'opened_on' => '2020-02-14'])->assertRedirect();
        $this->patch($base, ['section' => 'contact', 'phone' => '0311234567', 'whatsapp' => '081234567890', 'contact_email' => 'usaha@example.com', 'website' => 'https://example.com', 'social_links' => ['instagram' => 'https://www.instagram.com/contoh'], 'action_links' => ['gofood' => 'https://gofood.co.id/contoh', 'reservation' => 'https://example.com/reservasi']])->assertRedirect();
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.name', 'Warung lengkap')->where('business.business_category', 'Kedai sarapan')->where('business.additional_categories.1', 'Katering')->where('business.opened_on', '2020-02-14')->where('business.whatsapp', '6281234567890')->where('business.phone', '0311234567')->where('business.social_links.instagram', 'https://www.instagram.com/contoh')->where('business.action_links.gofood', 'https://gofood.co.id/contoh')->where('business.contact_email', 'usaha@example.com'));
        $this->assertSame('published', $business->fresh()->status);
    }

    public function test_merchant_edit_receives_the_menu_choices_and_map_areas_needed_by_forms(): void
    {
        $business = $this->owned();
        $this->get('/kelola-usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('options.groups.0', 'Makanan')->where('options.categories.1', 'Pizza')->where('options.areas.0.label', 'Gedangan, Sidoarjo'));
    }

    public function test_associative_lists_are_rejected_instead_of_breaking_customer_and_owner_forms(): void
    {
        $business = $this->owned();
        $this->patch('/kelola-usaha/'.$business->slug, ['section' => 'about', 'name' => 'Nama baru', 'description' => 'Cerita baru', 'kind' => 'ruko', 'additional_categories' => ['label' => 'Kafe']])->assertSessionHasErrors('additional_categories');
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['facilities' => ['first' => 'wifi'], 'service_options' => ['first' => 'dine_in'], 'payment_methods' => ['first' => 'qris']]))->assertSessionHasErrors(['facilities', 'service_options', 'payment_methods']);
        $this->assertSame('Pos', $post->fresh()->name);
    }

    public function test_duplicate_24_hour_slots_are_checked_after_canonicalizing_their_opening_time(): void
    {
        $business = $this->owned();
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['schedules' => [
            ['weekday' => 1, 'opens_at' => '08:00', 'closes_at' => '12:00', 'all_day' => true],
            ['weekday' => 1, 'opens_at' => '16:00', 'closes_at' => '23:00', 'all_day' => true],
        ]]))->assertSessionHasErrors('schedules.1.opens_at');
        $this->assertSame(1, $post->weeklySchedules()->count());
        $this->assertSame('08:00', $post->weeklySchedules()->first()->opens_at);
    }

    public function test_contact_rejects_unsafe_links_without_losing_previous_values(): void
    {
        $business = $this->owned();
        $this->patch('/kelola-usaha/'.$business->slug, ['section' => 'contact', 'website' => 'javascript:alert(1)', 'social_links' => ['instagram' => 'file:///etc/passwd'], 'action_links' => ['ordering' => 'data:text/html,test']])->assertSessionHasErrors(['website', 'social_links.instagram', 'action_links.ordering']);
        $this->assertNull($business->fresh()->website);
    }

    public function test_logo_and_pdf_can_be_replaced_and_removed_without_removing_cover(): void
    {
        Storage::fake('public');
        $business = $this->owned();
        $url = '/kelola-usaha/'.$business->slug;
        $this->patch($url, ['section' => 'media', 'logo' => $this->image(), 'menu_pdf' => UploadedFile::fake()->createWithContent('menu.pdf', "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF")])->assertRedirect();
        $business->refresh();
        $this->assertStringStartsWith('/media/', $business->logo);
        $this->assertStringEndsWith('.pdf', $business->menu_pdf);
        $this->get($business->menu_pdf)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff')->assertHeader('Content-Disposition', 'attachment; filename='.basename($business->menu_pdf));
        $logo = $business->logo;
        $pdf = $business->menu_pdf;
        $this->patch($url, ['section' => 'media', 'remove_logo' => true, 'remove_menu_pdf' => true])->assertRedirect();
        $this->assertNull($business->fresh()->logo);
        $this->assertSame('/images/demo/rice.jpg', $business->fresh()->photo);
        Storage::disk('public')->assertMissing('merchant/'.basename($logo));
        Storage::disk('public')->assertMissing('merchant/'.basename($pdf));
    }

    public function test_gallery_upload_caption_edit_and_delete_are_visible_publicly(): void
    {
        Storage::fake('public');
        $business = $this->owned();
        $base = '/kelola-usaha/'.$business->slug.'/foto';
        $this->post($base, ['photo' => $this->image(), 'caption' => 'Tampak depan', 'kind' => 'storefront'])->assertRedirect();
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->has('business.gallery', 1)->where('business.gallery.0.caption', 'Tampak depan'));
        $photo = $business->galleryPhotos()->firstOrFail();
        $this->patch($base.'/'.$photo->id, ['caption' => 'Pintu masuk utama', 'kind' => 'atmosphere'])->assertRedirect();
        $this->assertSame('Pintu masuk utama', $photo->fresh()->caption);
        $url = $photo->photo;
        $this->delete($base.'/'.$photo->id)->assertRedirect();
        $this->assertDatabaseMissing('business_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing('merchant/'.basename($url));
    }

    public function test_menu_description_and_post_specific_attributes_reach_the_public_page(): void
    {
        $business = $this->owned();
        $menu = $business->menuItems()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/menu/'.$menu->id, ['name' => 'Nasi ayam', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 25000, 'sold_out' => false, 'description' => 'Ayam panggang, nasi, dan sambal.'])->assertRedirect();
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData())->assertRedirect();
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.menus.0.description', 'Ayam panggang, nasi, dan sambal.')->where('business.posts.0.service_options.0', 'dine_in')->where('business.posts.0.facilities.1', 'motorcycle_parking')->where('business.posts.0.payment_methods.1', 'qris')->where('business.posts.0.service_area', 'Gedangan'));
    }

    public function test_24_hour_schedule_and_special_hours_override_the_weekly_schedule(): void
    {
        $business = $this->owned();
        $post = $business->sellingPosts()->first();
        $url = '/kelola-usaha/'.$business->slug.'/pos/'.$post->id;
        $this->patch($url, $this->postData(['schedules' => [['weekday' => 1, 'opens_at' => '00:00', 'closes_at' => '00:00', 'all_day' => true]], 'special_hours' => [['date' => '2026-10-26', 'is_closed' => false, 'all_day' => false, 'opens_at' => '15:00', 'closes_at' => '20:00']]]))->assertRedirect();
        $hours = app(OpeningHours::class);
        $this->assertFalse($hours->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-26 12:00', 'Asia/Jakarta')));
        $this->assertTrue($hours->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-26 16:00', 'Asia/Jakarta')));
        $this->assertFalse($hours->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-26 20:00', 'Asia/Jakarta')));
        $this->patch($url, $this->postData(['schedules' => [['weekday' => 1, 'opens_at' => '00:00', 'closes_at' => '00:00', 'all_day' => true]]]))->assertRedirect();
        $this->assertTrue($hours->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-26 23:59', 'Asia/Jakarta')));
        $this->patch($url, $this->postData(['operating_status' => 'temporarily_closed', 'closure_note' => 'Renovasi']))->assertRedirect();
        $this->assertFalse($hours->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-26 12:00', 'Asia/Jakarta')));
    }

    public function test_special_overnight_hours_do_not_spill_into_an_explicit_closed_day(): void
    {
        $business = $this->owned();
        $post = $business->sellingPosts()->first();
        $special = [['date' => '2026-10-27', 'is_closed' => false, 'all_day' => false, 'opens_at' => '20:00', 'closes_at' => '02:00']];
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['special_hours' => $special]))->assertRedirect();
        $this->assertTrue(app(OpeningHours::class)->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-28 01:00', 'Asia/Jakarta')));
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['special_hours' => [...$special, ['date' => '2026-10-28', 'is_closed' => true, 'all_day' => false, 'opens_at' => null, 'closes_at' => null]]]))->assertRedirect();
        $this->assertFalse(app(OpeningHours::class)->isOpen($post->fresh(), CarbonImmutable::parse('2026-10-28 01:00', 'Asia/Jakarta')));
    }

    public function test_bad_attribute_or_special_hours_are_rejected_atomically(): void
    {
        $business = $this->owned();
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['facilities' => ['unverified_claim'], 'special_hours' => [['date' => '2026-10-26', 'is_closed' => false, 'all_day' => false, 'opens_at' => '15:00', 'closes_at' => '15:00']]]))->assertSessionHasErrors(['facilities.0', 'special_hours.0.closes_at']);
        $this->assertSame('Pos', $post->fresh()->name);
        $this->assertSame('08:00', $post->weeklySchedules()->first()->opens_at);
    }

    public function test_permanently_closed_posts_are_not_recommended_in_food_search(): void
    {
        $business = $this->owned();
        $post = $business->sellingPosts()->first();
        $this->patch('/kelola-usaha/'.$business->slug.'/pos/'.$post->id, $this->postData(['operating_status' => 'permanently_closed']))->assertRedirect();
        $this->get('/jelajah')->assertInertia(fn (Assert $page) => $page->has('businesses', 0));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('business.posts.0.operating_status', 'permanently_closed'));
    }

    public function test_news_drafts_future_and_expired_items_are_not_exposed_to_consumers(): void
    {
        $business = $this->owned();
        $base = '/kelola-usaha/'.$business->slug.'/kabar';
        foreach ([$this->updateData(), $this->updateData(['title' => 'Draf', 'is_published' => false]), $this->updateData(['title' => 'Belum mulai', 'starts_on' => '2026-11-01', 'ends_on' => '2026-11-05']), $this->updateData(['title' => 'Sudah berakhir', 'starts_on' => '2026-10-20', 'ends_on' => '2026-10-25'])] as $data) {
            $this->post($base, $data)->assertRedirect();
        }
        $this->get('/kelola-usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->has('business.updates', 4));
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->has('business.updates', 1)->where('business.updates.0.title', 'Menu baru hari ini'));
        $update = $business->updates()->where('title', 'Draf')->firstOrFail();
        $this->patch($base.'/'.$update->id, $this->updateData(['title' => 'Kabar baru terbit']))->assertRedirect();
        $this->assertTrue($update->fresh()->is_published);
        $this->delete($base.'/'.$update->id)->assertRedirect();
        $this->assertDatabaseMissing('business_updates', ['id' => $update->id]);
    }

    public function test_news_invalid_dates_and_action_link_are_validation_errors(): void
    {
        $business = $this->owned();
        $this->post('/kelola-usaha/'.$business->slug.'/kabar', $this->updateData(['ends_on' => '2026-10-20', 'cta_url' => 'javascript:alert(1)']))->assertSessionHasErrors(['ends_on', 'cta_url']);
    }

    public function test_gallery_and_news_cannot_be_changed_using_another_business_parent(): void
    {
        Storage::fake('public');
        $business = $this->owned();
        $base = '/kelola-usaha/'.$business->slug;
        $this->post($base.'/foto', ['photo' => $this->image(), 'kind' => 'food'])->assertRedirect();
        $this->post($base.'/kabar', $this->updateData())->assertRedirect();
        $photo = $business->galleryPhotos()->firstOrFail();
        $update = $business->updates()->firstOrFail();
        $foreign = $this->business('Usaha lain');
        $foreign->update(['owner_id' => User::factory()->create()->id]);
        $this->post('/kelola-usaha/'.$foreign->slug.'/foto', ['photo' => $this->image(), 'kind' => 'food'])->assertForbidden();
        $this->delete('/kelola-usaha/'.$foreign->slug.'/foto/'.$photo->id)->assertForbidden();
        $this->patch('/kelola-usaha/'.$foreign->slug.'/kabar/'.$update->id, $this->updateData())->assertForbidden();
        $this->actingAs(User::factory()->create());
        $this->delete($base.'/foto/'.$photo->id)->assertForbidden();
        $this->delete($base.'/kabar/'.$update->id)->assertForbidden();
    }
}
