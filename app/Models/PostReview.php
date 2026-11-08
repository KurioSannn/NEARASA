<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostReview extends Model
{
    protected $fillable = ['business_id', 'selling_post_id', 'user_id', 'rating', 'comment', 'photo'];

    protected function casts(): array
    {
        return ['rating' => 'integer'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
