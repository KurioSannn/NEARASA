<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SellingPost extends Model
{
    protected $attributes = ['operating_status' => 'operating'];

    protected $fillable = ['name', 'address', 'landmark', 'latitude', 'longitude', 'service_options', 'facilities', 'payment_methods', 'service_area', 'operating_status', 'closure_note', 'today_opens_at', 'today_closes_at', 'hours_updated_at'];

    protected function casts(): array
    {
        return ['latitude' => 'double', 'longitude' => 'double', 'service_options' => 'array', 'facilities' => 'array', 'payment_methods' => 'array', 'today_opens_at' => 'immutable_datetime', 'today_closes_at' => 'immutable_datetime', 'hours_updated_at' => 'immutable_datetime'];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function weeklySchedules(): HasMany
    {
        return $this->hasMany(WeeklySchedule::class)->orderBy('weekday')->orderBy('opens_at');
    }

    public function scheduleExceptions(): HasMany
    {
        return $this->hasMany(ScheduleException::class);
    }

    public function menuAvailability(): BelongsToMany
    {
        return $this->belongsToMany(MenuItem::class, 'menu_item_post_availability', 'selling_post_id', 'menu_item_id')->withPivot('sold_out')->withTimestamps();
    }
}
