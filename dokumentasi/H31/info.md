# Dokumentasi H31 (TECH 1) - Kesiapan Deployment Render & Supabase PostgreSQL

Dokumentasi ini mencatat pengerjaan **TECH 1** untuk menyiapkan konfigurasi produksi **NEARASA** agar siap di-deploy ke **Render (Docker)** dan terhubung ke database **Supabase PostgreSQL (IPv4 Pooler)**.

---

## 1. Perubahan yang Dilakukan

1. **Dukungan Supabase Pooler di [`config/database.php`](file:///D:/NEARASA/config/database.php)**:
   - Menambahkan opsi `PDO::ATTR_EMULATE_PREPARES => true` pada koneksi `pgsql` ketika `DB_EMULATE_PREPARES=true` diaktifkan (dibutuhkan untuk Supabase Transaction Pooler / PgBouncer port `6543`).
   - Mempertahankan dukungan `DB_URL` dan `DB_SSLMODE` (`require` pada production).

2. **Kepercayaan Proxy & Skema HTTPS Production ([`bootstrap/app.php`](file:///D:/NEARASA/bootstrap/app.php) & [`app/Providers/AppServiceProvider.php`](file:///D:/NEARASA/app/Providers/AppServiceProvider.php))**:
   - Mengatur `$middleware->trustProxies(at: env('APP_ENV') === 'production' ? '*' : ['127.0.0.1', '::1'])` agar load balancer Render dikenali dengan benar pada production tanpa mengubah perilaku lokal/testing.
   - Menambahkan `URL::forceScheme('https')` pada `AppServiceProvider::boot()` ketika `$this->app->environment('production')` aktif, guna mencegah Mixed Content aset dan error `419 Page Expired` (CSRF) saat login.

3. **Panduan Variabel Supabase di [`.env.example`](file:///D:/NEARASA/.env.example)**:
   - Menambahkan contoh konfigurasi koneksi `pgsql`, `DB_URL` (Supabase Pooler IPv4), `DB_SSLMODE=require`, dan `DB_EMULATE_PREPARES=true`.

4. **Konfigurasi Container Render ([`Dockerfile`](file:///D:/NEARASA/Dockerfile) & [`.dockerignore`](file:///D:/NEARASA/.dockerignore))**:
   - Membuat `Dockerfile` multi-stage:
     - Stage 1 (`node:22-alpine`): build aset frontend Vite.
     - Stage 2 (`php:8.4-apache`): install ekstensi `pdo_pgsql`, `pgsql`, `gd`, `zip`, `intl`, `bcmath`, `opcache`, setup Apache `DocumentRoot` ke `public/`, menjalankan `composer install --no-dev`, dan menyiapkan `CMD` yang menyesuaikan port dinamis Render (`${PORT:-8080}`) serta `php artisan storage:link --force`.

---

## 2. File yang Terdampak

1. [`config/database.php`](file:///D:/NEARASA/config/database.php)
2. [`bootstrap/app.php`](file:///D:/NEARASA/bootstrap/app.php)
3. [`app/Providers/AppServiceProvider.php`](file:///D:/NEARASA/app/Providers/AppServiceProvider.php)
4. [`.env.example`](file:///D:/NEARASA/.env.example)
5. [`Dockerfile`](file:///D:/NEARASA/Dockerfile)
6. [`.dockerignore`](file:///D:/NEARASA/.dockerignore)
7. [`dokumentasi/H31/info.md`](file:///D:/NEARASA/dokumentasi/H31/info.md)

---

## 3. Hasil Verifikasi

- **PHP Syntax Lint (`php -l`)**: Lulus tanpa error pada `config/database.php`, `bootstrap/app.php`, dan `app/Providers/AppServiceProvider.php`.
- **PHPUnit (`php artisan test --filter=AccountMerchantTest`)**: 13 tests, 13 passed, 99 assertions (18914 ms).
