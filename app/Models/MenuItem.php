<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuItem extends Model
{
    protected $fillable = ['name', 'group', 'category', 'price', 'photo', 'sold_out', 'description'];

    protected function casts(): array
    {
        return ['price' => 'integer', 'sold_out' => 'boolean'];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function availabilityOverrides(): BelongsToMany
    {
        return $this->belongsToMany(SellingPost::class, 'menu_item_post_availability', 'menu_item_id', 'selling_post_id')->withPivot('sold_out')->withTimestamps();
    }

    public function soldOutAt(int $postId): bool
    {
        $override = $this->availabilityOverrides->firstWhere('id', $postId);

        return $override ? (bool) $override->pivot->sold_out : (bool) $this->sold_out;
    }
}
