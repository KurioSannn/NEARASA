<?php

namespace Tests\Feature;

use App\Data\CatalogFilters;
use App\Models\User;
use App\Services\CatalogService;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CatalogTestCase;

class PostCatalogTest extends CatalogTestCase
{
    private function search(array $filters = [])
    {
        return app(CatalogService::class)->search(CatalogFilters::from($filters), null, CarbonImmutable::now());
    }

    public function test_each_post_pairs_its_card_price_with_an_available_matching_menu(): void
    {
        $business = $this->business('Ayam dua pos');
        $this->sellingPost($business, 112.731);
        $business->menuItems()->delete();
        $menus = $business->menuItems()->createMany([
            ['name' => 'Ayam bakar', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 12000, 'sold_out' => true],
            ['name' => 'Ayam goreng', 'group' => 'Makanan', 'category' => 'Ayam', 'price' => 18000],
        ]);

        $cards = $this->search(['q' => 'Ayam', 'category' => 'Ayam', 'max_price' => 20000]);

        $this->assertCount(2, $cards);
        $this->assertSame($business->sellingPosts()->pluck('id')->all(), $cards->pluck('post.id')->all());
        foreach ($cards as $card) {
            $this->assertSame($menus[1]->id, $card['matched_menu']['id']);
            $this->assertSame('Ayam goreng', $card['matched_menu']['name']);
            $this->assertSame(18000, $card['min_price']);
            $this->assertFalse($card['all_sold_out']);
            $this->assertSame(['average' => null, 'count' => 0], $card['rating']);
        }
    }

    public function test_all_sold_out_posts_remain_in_browse_and_name_results_with_their_schedule_status(): void
    {
        $business = $this->business('Warung terakhir');
        $business->menuItems()->update(['sold_out' => true]);

        foreach ([[], ['q' => 'Warung terakhir']] as $filters) {
            $cards = $this->search($filters);
            $this->assertCount(1, $cards);
            $this->assertTrue($cards[0]['all_sold_out']);
            $this->assertTrue($cards[0]['is_open']);
            $this->assertNull($cards[0]['matched_menu']);
            $this->assertSame(20000, $cards[0]['min_price']);
            $this->assertTrue($cards[0]['menus'][0]['sold_out']);
        }
    }

    public function test_all_sold_out_results_still_require_the_same_menu_to_match_category_and_budget(): void
    {
        $business = $this->business('Menu habis');
        $business->menuItems()->delete();
        $business->menuItems()->createMany([
            ['name' => 'Pizza', 'group' => 'Makanan', 'category' => 'Pizza', 'price' => 40000, 'sold_out' => true],
            ['name' => 'Kopi', 'group' => 'Minuman', 'category' => 'Kopi', 'price' => 10000, 'sold_out' => true],
        ]);

        $this->assertCount(0, $this->search(['category' => 'Pizza', 'max_price' => 15000]));
        $this->assertCount(1, $this->search(['category' => 'Pizza', 'max_price' => 45000]));
    }

    public function test_detail_exposes_only_the_owners_public_identity_with_a_safe_fallback(): void
    {
        $owner = User::factory()->create(['public_name' => 'Dapur Bu Tini']);
        $business = $this->business('Dapur terbit');
        $business->update(['owner_id' => $owner->id]);

        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page
            ->where('owner', ['id' => $owner->id, 'public_name' => 'Dapur Bu Tini'])->missing('owner.email')->missing('owner.name'));
        $owner->forceFill(['public_name' => null])->save();
        $this->get('/usaha/'.$business->slug)->assertInertia(fn (Assert $page) => $page->where('owner.public_name', 'Pemilik usaha'));
    }
}
