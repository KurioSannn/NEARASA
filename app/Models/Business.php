<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = ['owner_id', 'slug', 'name', 'description', 'kind', 'photo', 'whatsapp', 'status', 'is_demo', 'business_category', 'additional_categories', 'opened_on', 'phone', 'contact_email', 'website', 'social_links', 'action_links', 'logo', 'menu_pdf'];

    protected function casts(): array
    {
        return ['is_demo' => 'boolean', 'additional_categories' => 'array', 'opened_on' => 'date:Y-m-d', 'social_links' => 'array', 'action_links' => 'array'];
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function sellingPosts(): HasMany
    {
        return $this->hasMany(SellingPost::class);
    }

    public function galleryPhotos(): HasMany
    {
        return $this->hasMany(BusinessPhoto::class)->orderBy('id');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(BusinessUpdate::class)->orderByDesc('id');
    }
}
