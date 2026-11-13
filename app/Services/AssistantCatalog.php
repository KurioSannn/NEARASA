<?php

namespace App\Services;

use App\Data\CatalogFilters;
use App\Data\SearchLocation;
use App\Models\InteractionEvent;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AssistantCatalog
{
    private const BUDGET = '/\b(?:(?:di\s+bawah|maks(?:imal)?|budget|anggaran|sampai|hingga|rp\.?)\s*(?:rp\.?\s*)?(?<marked>\d+(?:\.\d{3})*(?:,\d+)?)\s*(?<unit>ribu|rb|k)?|(?<amount>\d+(?:\.\d{3})*(?:,\d+)?)\s*(?<suffix>ribu|rb|k))\b/u';

    private const FILLER = [
        'ada', 'aja', 'aku', 'atau', 'bersahabat', 'bisa', 'cari', 'carikan', 'coba', 'dan', 'deh', 'dengan',
        'favorit', 'gerai', 'hari', 'harga', 'hemat', 'ini', 'ingin', 'jelajah', 'jelajahi', 'kantong', 'kasih',
        'kuliner', 'lagi', 'makan', 'makanan', 'mantap', 'mau', 'menu', 'murah', 'pilihan', 'pingin',
        'rekomendasi', 'rekomendasikan', 'rombong', 'saya', 'seluruh', 'tampilkan', 'tempat', 'tolong', 'warung', 'yang',
    ];

    public function __construct(private CatalogService $catalog) {}

    public function recommend(string $prompt, ?SearchLocation $location): array
    {
        $query = preg_replace('/\s+/u', ' ', mb_strtolower(trim($prompt)));
        $budget = $this->budget($query);
        $query = preg_replace(self::BUDGET, ' ', $query);
        $nearby = (bool) preg_match('/\b(terdekat|dekat|sekitar)\b/u', $query);
        $popular = (bool) preg_match('/\b(terpopuler|populer)\b/u', $query);
        $night = (bool) preg_match('/\b(buka malam(?: ini)?|malam ini|larut malam)\b/u', $query);
        $openOnly = $night || (bool) preg_match('/\bbuka\b/u', $query);
        $query = preg_replace('/\b(buka malam(?: ini)?|malam ini|larut malam|(?:sedang |masih )?buka(?: sekarang)?|terdekat|(?:dekat|sekitar)(?: sini)?|(?:paling )?(?:terpopuler|populer))\b/u', ' ', $query);
        [$query, $area, $location] = $this->area($query, $location);
        $terms = array_values(array_diff(preg_split('/[^\p{L}\p{N}]+/u', $query, -1, PREG_SPLIT_NO_EMPTY), self::FILLER));

        $now = CarbonImmutable::now('Asia/Jakarta');
        $at = $night ? $now->setTime(19, 0) : $now;
        $filters = new CatalogFilters(maxPrice: $budget, radius: $nearby ? 5.0 : 'unlimited');
        $cards = $this->catalog->search($filters, $location, $at)
            ->filter(fn (array $card) => (! $openOnly || $card['is_open'])
                && (! $area || str_contains(mb_strtolower($card['post']['address']), $area)))
            ->map(function (array $card) use ($terms) {
                $menu = collect($card['menus'])->first(fn (array $menu) => ! $menu['sold_out'] && $this->matches($terms, $card, $menu));

                return $menu ? [...$card, 'matched_menu' => $menu] : null;
            })
            ->filter();

        $context = $night ? ' Jadwal dicek untuk pukul 19.00 WIB.' : '';
        if ($budget !== null) {
            $context .= ' Batas harga Rp'.number_format($budget, 0, ',', '.').'.';
        }
        if ($popular) {
            $context .= ' Popularitas memakai kunjungan profil 7 hari terakhir.';
        }
        if ($nearby && ! $location) {
            $context .= ' Pilih lokasi di Jelajah untuk mengurutkan berdasarkan jarak.';
        }
        if ($cards->isEmpty()) {
            return ['reply' => 'Belum ada menu tersedia yang cocok. Coba kata kunci atau anggaran lain.'.$context, 'places' => []];
        }

        $views = InteractionEvent::query()
            ->whereIn('selling_post_id', $cards->pluck('post.id'))
            ->where('type', 'profile_view')
            ->whereBetween('created_at', [$now->utc()->subDays(7), $now->utc()])
            ->selectRaw('selling_post_id, COUNT(*) as total')
            ->groupBy('selling_post_id')
            ->pluck('total', 'selling_post_id');
        $places = $this->rank($cards, $views, $nearby && $location !== null, $popular);

        return ['reply' => 'Ini pilihan dari katalog NEARASA yang cocok dengan pencarianmu.'.$context, 'places' => $places];
    }

    private function budget(string $query): ?int
    {
        if (preg_match(self::BUDGET, $query, $match, PREG_UNMATCHED_AS_NULL)) {
            $unit = $match['unit'] ?? $match['suffix'];
            $amount = (float) str_replace(',', '.', str_replace('.', '', $match['marked'] ?? $match['amount']));

            return (int) min(10_000_000, $amount * ($unit ? 1000 : 1));
        }

        return preg_match('/\b(hemat|murah)\b/u', $query) ? 20_000 : null;
    }

    private function area(string $query, ?SearchLocation $location): array
    {
        foreach (CatalogOptions::all()['areas'] as $option) {
            $district = mb_strtolower(strtok($option['label'], ','));
            $label = mb_strtolower($option['label']);
            $pattern = '/\b(?:di\s+)?(?:'.preg_quote($label, '/').'|'.preg_quote(str_replace(',', '', $label), '/').'|'.preg_quote($district, '/').')\b/u';
            if (preg_match($pattern, $query)) {
                return [preg_replace($pattern, ' ', $query), $district, SearchLocation::fromSession($option)];
            }
        }

        if (preg_match('/\b(?:di\s+)?(sidoarjo|surabaya)\b/u', $query, $match)) {
            return [str_replace($match[0], ' ', $query), $match[1], null];
        }

        if (preg_match('/\bdi\s+([\p{L}\p{N}][\p{L}\p{N}\s-]*)/u', $query, $match, PREG_OFFSET_CAPTURE)) {
            $area = trim($match[1][0]);

            return [substr_replace($query, ' ', $match[0][1], strlen($match[0][0])), $area, null];
        }

        return [$query, null, $location];
    }

    private function matches(array $terms, array $card, array $menu): bool
    {
        $text = mb_strtolower(implode(' ', [$card['name'], $menu['name'], $menu['description'], $menu['category'], $menu['group']]));
        foreach ($terms as $term) {
            if ($term === 'pedas' && preg_match('/\b(pedas|sambal|balado|cabai)\b/u', $text)) {
                continue;
            }
            if (! str_contains($text, $term)) {
                return false;
            }
        }

        return true;
    }

    private function rank(Collection $cards, Collection $views, bool $nearest, bool $popular): array
    {
        return $cards->map(function (array $card) use ($views, $popular) {
            $rating = $card['rating'];
            $count = $rating['count'];
            $ratingScore = (($rating['average'] ?? 0) * $count + 3.5 * 5) / ($count + 5) / 5;
            $viewScore = min(1, log1p((int) $views->get($card['post']['id'], 0)) / log1p(100));
            $distance = $card['distance'];
            $proximity = $distance === null ? 0 : 1 / (1 + $distance);
            $score = $popular ? 0.25 * $ratingScore + 0.65 * $viewScore + 0.10 * $proximity
                : 0.45 * $ratingScore + 0.20 * $viewScore + 0.35 * $proximity;

            return [...$card, 'score' => $score];
        })->sort(fn (array $a, array $b) => ($nearest ? $a['distance'] <=> $b['distance'] : 0)
            ?: ($b['score'] <=> $a['score'])
            ?: ((int) $b['is_open'] <=> (int) $a['is_open'])
            ?: ($a['matched_menu']['price'] <=> $b['matched_menu']['price'])
            ?: ($a['post']['id'] <=> $b['post']['id']))
            ->unique('id')->take(3)->values()->map(fn (array $card) => [
                ...collect($card)->only(['slug', 'name', 'photo', 'is_demo', 'distance'])->all(),
                'post_id' => $card['post']['id'],
                'post_name' => $card['post']['name'],
                'menu' => $card['matched_menu']['name'],
                'price' => $card['matched_menu']['price'],
            ])->all();
    }
}
