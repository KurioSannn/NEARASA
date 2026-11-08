<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClosedReport extends Model
{
    protected $fillable = ['business_id', 'selling_post_id', 'user_id', 'note', 'resolved_at'];

    protected function casts(): array
    {
        return ['resolved_at' => 'immutable_datetime'];
    }
}
