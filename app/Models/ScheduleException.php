<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleException extends Model
{
    public $timestamps = false;

    protected $fillable = ['date', 'is_closed', 'all_day', 'opens_at', 'closes_at'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'is_closed' => 'boolean', 'all_day' => 'boolean'];
    }
}
