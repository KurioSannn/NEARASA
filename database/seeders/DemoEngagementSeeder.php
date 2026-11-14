<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\ClosedReport;
use App\Models\InteractionEvent;
use App\Models\PostReview;
use App\Models\User;
use App\Services\InteractionTracker;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoEngagementSeeder extends Seeder
{
    public function run(): void
    {
        $now = CarbonImmutable::now('Asia/Jakarta');

        $reviewTemplates = [
            ['rating' => 5, 'comment' => 'Porsinya pas, bumbu meresap, dan pelayanan cepat. Jam buka di aplikasi juga sesuai saat datang langsung.'],
            ['rating' => 5, 'comment' => 'Menu andalannya selalu konsisten enaknya. Harga ramah di kantong dan tempatnya bersih.'],
            ['rating' => 4, 'comment' => 'Rasanya mantap dan hangat saat disajikan. Kalau sore agak ramai, jadi lebih enak pesan lewat daftar menu dulu.'],
            ['rating' => 5, 'comment' => 'Sudah beberapa kali mampir, cocok untuk makan bareng teman atau keluarga di akhir pekan.'],
        ];

        $reviewerSpecs = [
            ['email' => 'rina.kartika@nearasa.test', 'name' => 'Rina Kartika', 'public_name' => 'Rina K.'],
            ['email' => 'dimas.pratama@nearasa.test', 'name' => 'Dimas Pratama', 'public_name' => 'Dimas P.'],
            ['email' => 'sari.wulandari@nearasa.test', 'name' => 'Sari Wulandari', 'public_name' => 'Sari W.'],
            ['email' => 'bagus.saputra@nearasa.test', 'name' => 'Bagus Saputra', 'public_name' => 'Bagus S.'],
        ];

        DB::transaction(function () use ($now, $reviewTemplates, $reviewerSpecs) {
            $reviewers = collect($reviewerSpecs)->map(function (array $spec) {
                $user = User::firstOrNew(['email' => $spec['email']]);
                if (! $user->exists) {
                    $user->forceFill([
                        'name' => $spec['name'],
                        'public_name' => $spec['public_name'],
                        'password' => Str::random(48),
                        'is_demo' => true,
                    ])->save();
                } elseif (! $user->public_name) {
                    $user->forceFill(['public_name' => $spec['public_name']])->save();
                }

                return $user;
            })->values();

            $businesses = Business::query()
                ->with(['sellingPosts', 'menuItems'])
                ->where('status', 'published')
                ->orderBy('id')
                ->get();

            $interactionRows = [];

            foreach ($businesses as $bIndex => $business) {
                $firstPost = $business->sellingPosts->first();
                if (! $firstPost) {
                    continue;
                }

                // 1. Seed 2-3 reviews per primary selling post
                $reviewCount = $bIndex % 2 === 0 ? 3 : 2;
                for ($r = 0; $r < $reviewCount; $r++) {
                    $reviewer = $reviewers[($bIndex + $r) % $reviewers->count()];
                    $tpl = $reviewTemplates[($bIndex + $r) % count($reviewTemplates)];

                    PostReview::updateOrCreate(
                        [
                            'selling_post_id' => $firstPost->id,
                            'user_id' => $reviewer->id,
                        ],
                        [
                            'business_id' => $business->id,
                            'rating' => $tpl['rating'],
                            'comment' => $tpl['comment'],
                        ]
                    );
                }

                // 2. Seed published business update
                $menuName = $business->menuItems->first()?->name ?? 'menu pilihan';
                $business->updates()->updateOrCreate(
                    ['title' => "Sajian Segar {$business->name} Hari Ini"],
                    [
                        'type' => 'update',
                        'body' => "Stok {$menuName} dan menu favorit lainnya disiapkan segar setiap hari sesuai jam operasional pos. Silakan cek ketersediaan menu sebelum berkunjung.",
                        'photo' => $business->photo,
                        'starts_on' => $now->subDays(3)->format('Y-m-d'),
                        'ends_on' => $now->addDays(14)->format('Y-m-d'),
                        'is_published' => true,
                    ]
                );

                // 3. Seed gallery photos if business has none yet
                $business->galleryPhotos()->updateOrCreate(
                    ['photo' => $business->photo, 'kind' => 'exterior'],
                    ['caption' => "Area penyajian {$business->name}"]
                );

                $altPhoto = $business->menuItems->first()?->photo;
                if ($altPhoto && $altPhoto !== $business->photo) {
                    $business->galleryPhotos()->updateOrCreate(
                        ['photo' => $altPhoto, 'kind' => 'food'],
                        ['caption' => "Sajian favorit {$menuName}"]
                    );
                }

                // 4. Seed 7-day interaction events across all posts for realistic charts & trending
                foreach ($business->sellingPosts as $pIndex => $post) {
                    $isPrimaryOwnerDemo = in_array($business->slug, ['dapur-griya', 'pizza-sore'], true);
                    $scale = $isPrimaryOwnerDemo ? 3 : (($bIndex % 3) + 1);

                    $counts = [
                        'profile_view' => 4 * $scale + ($pIndex * 2),
                        'menu_open' => 3 * $scale,
                        'map_click' => 2 * $scale,
                        'whatsapp_click' => 1 * $scale,
                    ];

                    foreach ($counts as $type => $total) {
                        if (! in_array($type, InteractionTracker::TYPES, true)) {
                            continue;
                        }

                        for ($i = 0; $i < $total; $i++) {
                            $daysAgo = $i % 6;
                            $timestamp = $now->subDays($daysAgo)->setTime(9 + ($i % 10), ($i * 7) % 55);
                            $dedupKey = hash('sha256', "demo-engagement|{$post->id}|{$type}|{$i}");
                            $fingerprint = hash('sha256', "demo-fp|{$post->id}|{$type}|{$i}");

                            $interactionRows[] = [
                                'business_id' => $business->id,
                                'selling_post_id' => $post->id,
                                'user_id' => $reviewers[$i % $reviewers->count()]->id,
                                'type' => $type,
                                'fingerprint' => $fingerprint,
                                'dedup_key' => $dedupKey,
                                'created_at' => $timestamp->setTimezone('UTC')->toDateTimeString(),
                                'updated_at' => $timestamp->setTimezone('UTC')->toDateTimeString(),
                            ];
                        }
                    }
                }
            }

            foreach (array_chunk($interactionRows, 250) as $chunk) {
                InteractionEvent::insertOrIgnore($chunk);
            }

            // 5. Seed 1 resolved closed-report sample for Dapur Griya so Reports page is populated cleanly
            $dapur = $businesses->firstWhere('slug', 'dapur-griya');
            $dapurPost = $dapur?->sellingPosts->first();
            $reporter = $reviewers->first();
            if ($dapur && $dapurPost && $reporter) {
                ClosedReport::firstOrCreate(
                    [
                        'business_id' => $dapur->id,
                        'selling_post_id' => $dapurPost->id,
                        'user_id' => $reporter->id,
                    ],
                    [
                        'note' => 'Sempat tutup lebih awal karena stok nasi ayam habis menjelang siang.',
                        'resolved_at' => $now->subDay()->setTimezone('UTC'),
                    ]
                );
            }
        });
    }
}
