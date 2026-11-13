<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoAccountSeeder extends Seeder
{
    public const BUSINESS_SLUGS = ['dapur-griya', 'pizza-sore'];

    public function run(): void
    {
        if (! app()->environment('local')) {
            return;
        }
        $owner = User::firstOrNew(['email' => 'pemilik@nearasa.test']);
        if ($owner->exists && ! $owner->is_demo) {
            return;
        }
        if (! $owner->exists) {
            $owner->forceFill(['name' => 'Raka Pradana', 'password' => Str::random(48), 'is_demo' => true])->save();
        }
        Business::whereIn('slug', self::BUSINESS_SLUGS)->where('is_demo', true)->whereNull('owner_id')->update(['owner_id' => $owner->id]);
    }
}
