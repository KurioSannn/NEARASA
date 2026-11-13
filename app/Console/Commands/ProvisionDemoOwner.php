<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Models\User;
use Database\Seeders\DemoAccountSeeder;
use DomainException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProvisionDemoOwner extends Command
{
    protected $signature = 'nearasa:provision-demo-owner {email}';

    protected $description = 'Siapkan akun pemilik untuk katalog demo NEARASA';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $password = $this->secret('Kata sandi akun demo (min. 12 karakter)', false);
        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            ['email' => ['required', 'email', 'max:254'], 'password' => ['required', 'string', 'min:12']],
        );
        if ($validator->fails() || strlen($password) > 72) {
            $this->error('Gunakan email yang valid dan kata sandi minimal 12 karakter, maksimal 72 byte.');

            return self::FAILURE;
        }

        try {
            DB::transaction(function () use ($email, $password) {
                $businesses = Business::whereIn('slug', DemoAccountSeeder::BUSINESS_SLUGS)
                    ->where('is_demo', true)->lockForUpdate()->get(['id', 'owner_id']);
                $owner = User::where('email', $email)->lockForUpdate()->first() ?? new User(['email' => $email]);

                if ($owner->exists && (! $owner->is_demo || $owner->businesses()->where('is_demo', false)->exists())) {
                    throw new DomainException('Email tersebut terhubung dengan akun atau usaha non-demo.');
                }
                if ($businesses->count() !== count(DemoAccountSeeder::BUSINESS_SLUGS)) {
                    throw new DomainException('Siapkan katalog Dapur Griya dan Pizza Sore pada database demo baru.');
                }
                if ($businesses->contains(fn (Business $business) => $business->owner_id !== null && $business->owner_id !== $owner->id)) {
                    throw new DomainException('Usaha demo sudah terhubung dengan akun lain.');
                }

                if (! $owner->exists) {
                    $owner->forceFill(['name' => 'Pemilik Demo NEARASA', 'public_name' => 'Pemilik Demo', 'is_demo' => true]);
                }
                $owner->password = $password;
                $owner->save();

                Business::whereKey($businesses->modelKeys())->whereNull('owner_id')->update(['owner_id' => $owner->id]);
            });
        } catch (DomainException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Akun demo siap digunakan lewat halaman Masuk.');

        return self::SUCCESS;
    }
}
