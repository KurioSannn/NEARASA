<?php

namespace App\Services;

class CatalogOptions
{
    public const GROUPS = ['Makanan', 'Jajanan', 'Minuman'];

    public const CATEGORIES = ['Ayam', 'Pizza', 'Bakar', 'Kopi', 'Segar', 'Burger', 'Mie', 'Roti'];

    public static function all(): array
    {
        return ['groups' => self::GROUPS, 'categories' => self::CATEGORIES, 'areas' => [
            ['label' => 'Gedangan, Sidoarjo', 'latitude' => -7.387, 'longitude' => 112.734],
            ['label' => 'Krian, Sidoarjo', 'latitude' => -7.410, 'longitude' => 112.583],
            ['label' => 'Rungkut, Surabaya', 'latitude' => -7.327, 'longitude' => 112.769],
            ['label' => 'Gunung Anyar, Surabaya', 'latitude' => -7.340, 'longitude' => 112.787],
            ['label' => 'Alun-Alun Sidoarjo', 'latitude' => -7.4460, 'longitude' => 112.7178],
            ['label' => 'Waru, Sidoarjo', 'latitude' => -7.3622, 'longitude' => 112.7291],
            ['label' => 'Taman Bungkul / Darmo, Surabaya', 'latitude' => -7.2916, 'longitude' => 112.7402],
            ['label' => 'Gubeng / Manyar, Surabaya', 'latitude' => -7.2792, 'longitude' => 112.7577],
        ]];
    }
}
