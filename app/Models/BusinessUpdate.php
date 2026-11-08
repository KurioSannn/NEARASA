<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessUpdate extends Model
{
    protected $fillable = ['type', 'title', 'body', 'photo', 'starts_on', 'ends_on', 'cta_label', 'cta_url', 'is_published'];

    protected function casts(): array
    {
        return ['starts_on' => 'date:Y-m-d', 'ends_on' => 'date:Y-m-d', 'is_published' => 'boolean'];
    }
}
