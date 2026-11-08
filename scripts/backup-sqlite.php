<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

$root = dirname(__DIR__);
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! app()->environment('local') || config('database.default') !== 'sqlite') {
    throw new RuntimeException('Snapshot ini hanya untuk database SQLite lokal.');
}
$folder = $root.'/storage/backups';
if (in_array('--verify-latest', $argv, true)) {
    $files = glob($folder.'/before-post-flow-*.sqlite');
    rsort($files);
    if (! $files) {
        throw new RuntimeException('Snapshot sebelum perubahan tidak ditemukan.');
    }
    $snapshot = new PDO('sqlite:'.$files[0]);
    $snapshot->exec('PRAGMA query_only = ON');
    $current = DB::connection()->getPdo();
    foreach (['users', 'businesses', 'menu_items', 'selling_posts', 'weekly_schedules', 'schedule_exceptions'] as $table) {
        $columns = array_column($snapshot->query('PRAGMA table_info("'.$table.'")')->fetchAll(PDO::FETCH_ASSOC), 'name');
        $fields = implode(', ', array_map(fn ($name) => '"'.$name.'"', $columns));
        $query = 'SELECT '.$fields.' FROM "'.$table.'" ORDER BY id';
        $before = $snapshot->query($query)->fetchAll(PDO::FETCH_ASSOC);
        $after = $current->query($query)->fetchAll(PDO::FETCH_ASSOC);
        if ($before !== $after) {
            throw new RuntimeException('Data lama berbeda pada tabel '.$table.'. Periksa sebelum menyatakan tidak ada perubahan isian.');
        }
    }
    echo "Data akun, usaha, menu, pos dan jadwal lama sama dengan snapshot sebelum migration.\n";
    exit;
}
if (! is_dir($folder)) {
    mkdir($folder, 0700, true);
}
$target = $folder.'/before-post-flow-'.date('Ymd-His').'-'.bin2hex(random_bytes(3)).'.sqlite';
$pdo = DB::connection()->getPdo();
$statement = $pdo->prepare('VACUUM INTO ?');
$statement->execute([$target]);
echo 'Snapshot SQLite konsisten tersimpan: '.basename($target).PHP_EOL;
