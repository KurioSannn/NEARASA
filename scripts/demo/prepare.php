<?php

// Create a separate empty workspace. Existing shared sessions are preserved.
$root = dirname(__DIR__, 2);
$parent = $root.'/storage/shared-demo';
if (is_file($parent.'/active.json')) {
    echo "Lingkungan uji bersama sudah ada; data dipertahankan.\n";
    exit;
}
$storage = $parent.'/run-'.date('Ymd-His').'-'.bin2hex(random_bytes(3));
foreach (['framework/cache/data', 'framework/sessions', 'framework/views', 'logs', 'app/public', 'app/private'] as $folder) {
    if (! is_dir($storage.'/'.$folder)) {
        mkdir($storage.'/'.$folder, 0700, true);
    }
}
$database = $storage.'/database.sqlite';
touch($database);
file_put_contents($parent.'/active.json', json_encode(['storage' => $storage, 'database' => $database,
    'key' => 'base64:'.base64_encode(random_bytes(32))], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo "Lingkungan, database dan sesi uji bersama terpisah disiapkan.\n";
