<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklySchedule extends Model
{
    public $timestamps = false;

    protected $fillable = ['weekday', 'opens_at', 'closes_at', 'all_day'];

    protected function casts(): array
    {
        return ['weekday' => 'integer', 'all_day' => 'boolean'];
    }
}
