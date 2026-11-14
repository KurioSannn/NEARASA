<?php

namespace Database\Seeders;

use App\Models\Business;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScrapedMapCatalogSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $places = require __DIR__.'/data/scraped_places.php';

            foreach ($places as $index => [$slug, $name, $kind, $photo, $businessCategory, $description, $menus, $posts]) {
                $business = Business::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'kind' => $kind,
                        'business_category' => $businessCategory,
                        'description' => $description,
                        'photo' => "/images/demo/{$photo}.jpg",
                        'status' => 'published',
                        'is_demo' => true,
                        'whatsapp' => null,
                    ]
                );

                $business->menuItems()->delete();
                $business->sellingPosts()->delete();

                foreach ($menus as [$menuName, $group, $category, $price, $menuPhoto]) {
                    $business->menuItems()->create([
                        'name' => $menuName,
                        'group' => $group,
                        'category' => $category,
                        'price' => $price,
                        'photo' => "/images/demo/{$menuPhoto}.jpg",
                    ]);
                }

                $services = $kind === 'rombong'
                    ? ['takeaway', 'pickup']
                    : ['dine_in', 'takeaway', 'pickup'];
                $facilities = $kind === 'ruko'
                    ? ['motorcycle_parking', 'car_parking', 'wifi', 'toilet']
                    : ['motorcycle_parking', 'outdoor_seating'];
                $payments = $index % 2 === 0
                    ? ['cash', 'qris']
                    : ['cash', 'qris', 'debit_card'];

                foreach ($posts as [$postName, $address, $landmark, $latitude, $longitude, $opens, $closes]) {
                    $post = $business->sellingPosts()->create([
                        'name' => $postName,
                        'address' => $address,
                        'landmark' => $landmark,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'service_area' => str_contains($address, 'Surabaya') ? 'Surabaya' : 'Sidoarjo',
                        'service_options' => $services,
                        'facilities' => $facilities,
                        'payment_methods' => $payments,
                    ]);

                    foreach (range(1, 7) as $day) {
                        $post->weeklySchedules()->create([
                            'weekday' => $day,
                            'opens_at' => $opens,
                            'closes_at' => $closes,
                        ]);
                    }
                }
            }
        });
    }
}
