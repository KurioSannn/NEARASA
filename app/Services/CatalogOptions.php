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
        ]];
    }
}
