<?php

namespace App\Data;

final readonly class CatalogFilters
{
    public function __construct(public string $q = '', public ?string $group = null, public ?string $category = null, public ?int $maxPrice = null, public float|string $radius = 5.0) {}

    public static function from(array $input): self
    {
        return new self(trim($input['q'] ?? ''), ($input['group'] ?? '') ?: null, ($input['category'] ?? '') ?: null,
            isset($input['max_price']) && $input['max_price'] !== '' ? (int) $input['max_price'] : null,
            ($input['radius'] ?? 5) === 'unlimited' ? 'unlimited' : (float) ($input['radius'] ?? 5));
    }

    public function toArray(): array
    {
        return ['q' => $this->q, 'group' => $this->group, 'category' => $this->category, 'max_price' => $this->maxPrice, 'radius' => $this->radius];
    }
}
