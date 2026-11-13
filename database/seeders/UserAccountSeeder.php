<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserAccountSeeder extends Seeder
{
    /**
     * Seed testing accounts for NEARASA.
     * 1. Regular consumer account for testing onboarding / becoming an UMKM.
     * 2. Ensure merchant owner account has a standard password for manual login.
     */
    public function run(): void
    {
        // 1. Regular Consumer Account (non-merchant, 0 businesses owned)
        User::updateOrCreate(
            ['email' => 'user@nearasa.test'],
            [
                'name' => 'Pengguna Biasa',
                'public_name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'is_demo' => false,
            ]
        );

        // 2. Merchant Owner Account (owns Dapur Griya & Pizza Sore)
        // Ensure standard known password ('password') for manual email/password login
        $owner = User::where('email', 'pemilik@nearasa.test')->first();
        if ($owner) {
            $owner->update(['password' => Hash::make('password')]);
        }
    }
}
