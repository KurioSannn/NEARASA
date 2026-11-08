<?php

use App\Models\Business;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

$root = dirname(__DIR__, 2);
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$base = realpath($root.'/storage/shared-demo');
$actual = realpath(config('database.connections.sqlite.database'));
if (! app()->environment('demo') || ! $base || ! $actual || ! str_starts_with(str_replace('\\', '/', $actual), str_replace('\\', '/', $base).'/')) {
    throw new RuntimeException('Seeder ini hanya boleh dipakai pada database uji bersama yang terpisah.');
}
$credentials = $base.'/accounts.json';
if (is_file($credentials)) {
    echo "Akun uji bersama dipertahankan.\n";
    exit;
}
$accounts = [];
foreach ([['Pemilik Satu', 'pemilik1@nearasa.test', ['pizza-sore']], ['Pemilik Dua', 'pemilik2@nearasa.test', ['dapur-griya']], ['Pencari Rasa', 'konsumen@nearasa.test', []]] as [$name, $email, $slugs]) {
    $password = 'Rasa-'.bin2hex(random_bytes(6));
    $user = User::firstOrNew(['email' => $email]);
    $user->forceFill(['name' => $name, 'public_name' => $name, 'password' => $password, 'is_demo' => true])->save();
    if ($slugs) {
        Business::where('is_demo', true)->whereIn('slug', $slugs)->whereNull('owner_id')->update(['owner_id' => $user->id]);
    }
    $accounts[] = ['role' => $slugs ? 'Pemilik' : 'Konsumen', 'email' => $email, 'password' => $password];
}
file_put_contents($credentials, json_encode($accounts, JSON_PRETTY_PRINT));
$notes = "# Akses uji NEARASA\n\nLingkungan ini memakai data contoh terpisah. Link sementara dicatat di url.txt saat tunnel aktif.\n\n";
foreach ($accounts as $account) {
    $notes .= '## '.$account['role'].' — '.$account['email']."\n\nKata sandi: `".$account['password']."`\n\n";
}
$notes .= "Setiap pemilik mempunyai ruang usaha berbeda. Konsumen juga dapat menjelajah tanpa masuk; login diperlukan untuk ulasan dan Riwayat.\n\nLink berhenti ketika laptop, server atau tunnel dimatikan. Menjalankan tunnel lagi dapat menghasilkan alamat berbeda. Gunakan scripts/demo/stop.ps1 untuk menghentikannya.\n";
file_put_contents($base.'/access.md', $notes);
echo "Tiga akun uji disiapkan; detail tersimpan secara lokal pada storage/shared-demo/access.md.\n";
