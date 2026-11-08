<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\ClosedReport;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class MerchantWorkspaceTest extends CatalogTestCase
{
    private function owned(User $owner, string $name): Business
    {
        $business = $this->business($name);
        $business->update(['owner_id' => $owner->id]);

        return $business;
    }

    private function report(Business $business, bool $resolved = false): ClosedReport
    {
        return ClosedReport::create(['business_id' => $business->id, 'selling_post_id' => $business->sellingPosts()->firstOrFail()->id,
            'user_id' => User::factory()->create()->id, 'note' => 'Catatan pelanggan uji', 'resolved_at' => $resolved ? now() : null]);
    }

    public function test_new_workspace_entry_and_reports_require_login(): void
    {
        $this->get('/kelola-usaha/pengaturan')->assertRedirect('/masuk');
        $this->get('/kelola-usaha/laporan')->assertRedirect('/masuk');
    }

    public function test_navigation_contains_only_owned_businesses_and_operations_follow_the_chosen_business(): void
    {
        $owner = User::factory()->create();
        $first = $this->owned($owner, 'Alpha usaha');
        $second = $this->owned($owner, 'Beta usaha');
        $this->sellingPost($first, 112.731);
        $foreign = $this->owned(User::factory()->create(), 'Rahasia usaha');
        $this->report($first);
        $this->report($second);
        $this->report($foreign);
        $this->actingAs($owner)->get('/kelola-usaha')->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/Dashboard', false)->has('businesses', 2)->has('operations', 3)
            ->has('merchantNavigation.businesses', 2)->where('merchantNavigation.pending_reports', 2)
            ->where('merchantNavigation.manage_url', '/kelola-usaha/'.$first->slug));
        $this->get('/kelola-usaha/'.$second->slug.'?post='.$foreign->sellingPosts()->first()->id)->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/BusinessEdit', false)->where('business.id', $second->id)
            ->has('operations', 1)->where('operations.0.business_id', $second->id)
            ->has('merchantNavigation.businesses', 2))->assertSessionHas('merchant_business_id', $second->id);
        $this->get('/kelola-usaha/pengaturan')->assertRedirect('/kelola-usaha/'.$second->slug);
        $this->get('/kelola-usaha/'.$foreign->slug)->assertForbidden();
        $this->get('/kelola-usaha/pengaturan')->assertRedirect('/kelola-usaha/'.$second->slug);
    }

    public function test_stale_or_foreign_last_business_is_not_used_and_empty_accounts_have_a_real_empty_state(): void
    {
        $owner = User::factory()->create();
        $mine = $this->owned($owner, 'Milik pemilik');
        $foreign = $this->owned(User::factory()->create(), 'Milik orang lain');
        $this->actingAs($owner)->withSession(['merchant_business_id' => $foreign->id])->get('/kelola-usaha/pengaturan')->assertRedirect('/kelola-usaha/'.$mine->slug);
        $empty = User::factory()->create();
        $this->actingAs($empty)->get('/kelola-usaha/pengaturan')->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/BusinessEdit', false)->where('business', null)->has('operations', 0)
            ->has('merchantNavigation.businesses', 0)->where('merchantNavigation.manage_url', '/kelola-usaha/pengaturan'));
        $this->get('/kelola-usaha/laporan')->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/Reports', false)->where('counts.all', 0)->has('reports.data', 0));
    }

    public function test_report_filters_and_counts_include_more_than_fifty_owned_reports_without_exposing_other_owners(): void
    {
        $owner = User::factory()->create();
        $first = $this->owned($owner, 'Pertama');
        $second = $this->owned($owner, 'Kedua');
        $foreign = $this->owned(User::factory()->create(), 'Pribadi');
        for ($i = 0; $i < 51; $i++) {
            $this->report($first);
        }
        for ($i = 0; $i < 4; $i++) {
            $this->report($first, true);
        }
        $this->report($second);
        $this->report($foreign);
        $this->actingAs($owner)->get('/kelola-usaha/laporan')->assertInertia(fn (Assert $page) => $page
            ->where('counts', ['all' => 56, 'pending' => 52, 'resolved' => 4])
            ->where('merchantNavigation.pending_reports', 52)->where('reports.total', 56)
            ->where('reports.last_page', 4)->has('reports.data', 15)
            ->missing('reports.data.0.user_id')->missing('reports.data.0.email'));
        $this->get('/kelola-usaha/laporan?business='.$first->id.'&status=resolved')->assertInertia(fn (Assert $page) => $page
            ->where('counts', ['all' => 55, 'pending' => 51, 'resolved' => 4])
            ->where('filters', ['status' => 'resolved', 'business' => $first->id])
            ->has('reports.data', 4)->where('reports.data.0.business_id', $first->id));
        $this->get('/kelola-usaha/laporan?status=pending&page=4')->assertInertia(fn (Assert $page) => $page
            ->where('reports.total', 52)->has('reports.data', 7));
        $this->get('/kelola-usaha/laporan?business='.$foreign->id)->assertNotFound();
    }

    public function test_acknowledging_report_returns_to_the_filtered_list_and_leaves_the_post_schedule_unchanged(): void
    {
        $owner = User::factory()->create();
        $business = $this->owned($owner, 'Usaha laporan');
        $report = $this->report($business);
        $before = $business->sellingPosts()->first()->toArray();
        $url = '/kelola-usaha/laporan?business='.$business->id.'&status=pending';
        $this->actingAs($owner)->from($url)->post('/kelola-usaha/laporan/'.$report->id.'/selesai')->assertRedirect($url);
        $this->assertNotNull($report->fresh()->resolved_at);
        $this->assertSame($before, $business->sellingPosts()->first()->toArray());
        $this->get($url)->assertInertia(fn (Assert $page) => $page
            ->where('merchantNavigation.pending_reports', 0)->where('counts.resolved', 1)->has('reports.data', 0));
    }
}
