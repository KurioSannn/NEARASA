# Dokumentasi H33 (TECH 3) - Kompatibilitas Query PostgreSQL, Startup Render & Panduan Deploy Supabase

Dokumentasi ini mencatat penyelesaian **TECH 3** untuk memastikan query dan startup container Docker berjalan mulus di **Render** dengan database **Supabase PostgreSQL**, sekaligus menjadi panduan lengkap pengisian variabel lingkungan dan inisialisasi database pertama kali.

---

## 1. Perubahan yang Dilakukan

1. **Kompatibilitas Case-Insensitive Region di PostgreSQL ([`RankingCalculator.php`](file:///D:/NEARASA/app/Services/Awards/RankingCalculator.php))**:
   - Mengganti `$q->where('address', 'like', "%{$region}%")` menjadi `$q->whereRaw('LOWER(address) LIKE ?', ['%'.mb_strtolower($region).'%'])` agar pencarian wilayah (*Sidoarjo* / *Surabaya*) tetap *case-insensitive* pada PostgreSQL Supabase maupun SQLite lokal.

2. **Otomasi Migrasi & Cache Produksi saat Container Start ([`Dockerfile`](file:///D:/NEARASA/Dockerfile))**:
   - Memperbarui perintah `CMD` menjadi:
     - Menyesuaikan port Apache ke `$PORT` Render.
     - Menjalankan `php artisan storage:link --force`.
     - Menjalankan `php artisan migrate --force` setiap container start sehingga skema tabel di Supabase selalu terjamin mutakhir.
     - Menjalankan `php artisan config:cache`, `php artisan route:cache`, dan `php artisan view:cache` sebelum menyalakan `apache2-foreground`.

---

## 2. Panduan Lengkap Setup Supabase & Render

### A. Mengambil Connection String dari Supabase (Wajib Pooler IPv4)
1. Buka proyek Supabase kamu $\rightarrow$ klik tombol **Connect** di bagian atas.
2. Pilih tab **Connection String** $\rightarrow$ Type **URI**.
3. Pada dropdown **Method**, pilih **Transaction pooler** (port `6543`) atau **Session pooler** (port `5432`) — *hindari Direct connection karena hanya IPv6 dan tidak didukung Render Free*.
4. Ganti `[YOUR-PASSWORD]` dengan password database proyek Supabase kamu.

### B. Daftar Environment Variables di Render (Web Service)
Tambahkan variabel berikut di menu **Environment** Render:
- `APP_NAME=NEARASA`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY=` *(buat sekali via `php artisan key:generate --show`)*
- `APP_URL=https://nama-service.onrender.com`
- `ASSET_URL=https://nama-service.onrender.com`
- `DB_CONNECTION=pgsql`
- `DB_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
- `DB_SSLMODE=require`
- `DB_EMULATE_PREPARES=true`
- `SESSION_DRIVER=database`
- `SESSION_SECURE_COOKIE=true`
- `CACHE_STORE=database`
- `QUEUE_CONNECTION=database`
- `NEARASA_DEMO_AUTH=false`
- `GEMINI_API_KEY=` *(opsional untuk pencarian AI Gemini; jika kosong otomatis memakai fallback katalog matematis)*
- `GEMINI_MODEL=gemini-3.5-flash-lite`

### C. Pengisian Data Awal (Sekali Saja ke Supabase)
Setelah `DB_URL` dipasang di `.env` sementara (lokal, jangan di-commit) atau lewat Shell Render:
```sh
php artisan migrate --force
php artisan db:seed --force
php artisan nearasa:provision-demo-owner demo-owner@example.test
```
Perintah `db:seed` akan mengisi seluruh 30 usaha demo & hasil scraping peta Sidoarjo–Surabaya, menu, jadwal, 78+ ulasan, kabar usaha, interaksi, dan data peringkat Awards.

---

## 3. File yang Terdampak

1. [`app/Services/Awards/RankingCalculator.php`](file:///D:/NEARASA/app/Services/Awards/RankingCalculator.php)
2. [`Dockerfile`](file:///D:/NEARASA/Dockerfile)
3. [`dokumentasi/H33/info.md`](file:///D:/NEARASA/dokumentasi/H33/info.md)

---

## 4. Hasil Verifikasi

- **PHP Syntax Lint (`php -l`)**: Lulus tanpa error pada `app/Services/Awards/RankingCalculator.php`.
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (exit code 0).
- **Frontend Node Tests (`node --test tests/Frontend/*.test.mjs`)**: 13 tests, 13 passed.
- **PHPUnit Full Suite (`php artisan test`)**: 126 tests, 126 passed, 1631 assertions (135458 ms).
