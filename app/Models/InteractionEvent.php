<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractionEvent extends Model
{
    protected $fillable = ['business_id', 'selling_post_id', 'user_id', 'type', 'fingerprint', 'dedup_key', 'created_at', 'updated_at'];
}
