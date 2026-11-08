<?php

namespace App\Data;

final readonly class SearchLocation
{
    public function __construct(public float $latitude, public float $longitude, public string $label) {}

    public static function fromSession(?array $location): ?self
    {
        return $location ? new self((float) $location['latitude'], (float) $location['longitude'], $location['label']) : null;
    }
}
