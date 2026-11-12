# H1 - Dokumentasi Eksekusi TECH 1: Optimasi Backend & Kontrak Data Dashboard

Folder `H1` mendokumentasikan pengerjaan Tahap 1 (TECH 1) pada bagian backend untuk dashboard pemilik (`/kelola-usaha`).

## 1. Konteks & Tujuan
Mengoptimasi pemuatan data pada `MerchantController::index` dan `InteractionTracker::statistics` agar payload dashboard efisien, tidak melakukan *overfetching* ratusan objek menu yang tidak dirender di halaman dashboard, serta mencegah eksekusi query kosong ke database.

## 2. File yang Terdampak
1. [`app/Http/Controllers/MerchantController.php`](file:///D:/NEARASA/app/Http/Controllers/MerchantController.php)
   - Method `index()`: Mengirim parameter `includeMenus: false` saat memanggil `$this->operations($businesses, includeMenus: false)`.
   - Method `operations()`: Ditambahkan parameter `bool $includeMenus = true`. Jika bernilai `false`, array `menus` dikembalikan kosong `[]`, sehingga mapping seluruh relasi `menuItems` dan `availabilityOverrides` ditiadakan untuk dashboard.
2. [`app/Services/InteractionTracker.php`](file:///D:/NEARASA/app/Services/InteractionTracker.php)
   - Method `statistics()`: Ditambahkan *early return* `if ($ids->isEmpty())` untuk mencegah eksekusi query ke `interaction_events` dan `selling_posts` saat akun pemilik belum memiliki usaha.

## 3. Hasil Pengujian & Verifikasi
- `php vendor/phpunit/phpunit/phpunit tests/Feature/MerchantWorkspaceTest.php`: Passed (5 tests, 129 assertions).
- `php vendor/phpunit/phpunit/phpunit tests/Feature/UiContextTest.php tests/Feature/CommunityFlowTest.php`: Passed (11 tests, 190 assertions).
- `php vendor/phpunit/phpunit/phpunit tests/Feature/MerchantOperationsTest.php tests/Feature/AccountMerchantTest.php`: Passed (21 tests, 292 assertions).
- `npm run typecheck`: Passed (0 errors).

Semua kontrak data tetap kompatibel 100% dengan frontend dan test suite tanpa memecah dependensi halaman edit (`Merchant/BusinessEdit`).
