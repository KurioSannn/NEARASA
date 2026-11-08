<?php

namespace Database\Seeders;

use App\Models\Business;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            foreach (require __DIR__.'/data/catalog.php' as [$slug, $name, $kind, $photo, $description, $menus, $posts]) {
                $business = Business::updateOrCreate(['slug' => $slug], ['name' => $name, 'kind' => $kind, 'description' => $description, 'photo' => "/images/demo/$photo.jpg", 'status' => 'published', 'is_demo' => true, 'whatsapp' => null]);
                $business->menuItems()->delete();
                $business->sellingPosts()->delete();
                foreach ($menus as [$menuName, $group, $category, $price]) {
                    $business->menuItems()->create(['name' => $menuName, 'group' => $group, 'category' => $category, 'price' => $price, 'photo' => "/images/demo/$photo.jpg"]);
                }
                foreach ($posts as [$postName, $address, $landmark, $latitude, $longitude, $opens, $closes]) {
                    $post = $business->sellingPosts()->create(['name' => $postName, 'address' => $address, 'landmark' => $landmark, 'latitude' => $latitude, 'longitude' => $longitude]);
                    foreach (range(1, 7) as $day) {
                        $post->weeklySchedules()->create(['weekday' => $day, 'opens_at' => $opens, 'closes_at' => $closes]);
                    }
                }
            }
        });
    }
}
