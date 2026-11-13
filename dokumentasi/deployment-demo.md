# Menyiapkan demo online NEARASA

Gunakan satu versi aplikasi untuk deployment, rekaman, dan localhost. Siapkan database demo terpisah dengan katalog fiktif agar percobaan juri tidak memengaruhi data lain.

## Lingkungan Render

| Pengaturan | Nilai atau sumber |
| --- | --- |
| Runtime | Web Service Docker dengan PHP 8.4.1+, ekstensi `pdo_pgsql`, dan document root `public/`. Ikuti panduan Laravel Render untuk web server dan runtime container. |
| Aplikasi | `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` dan `ASSET_URL` memakai URL HTTPS layanan. |
| Rahasia | Simpan `APP_KEY` yang dibuat dengan `php artisan key:generate --show` dan `DB_URL` PostgreSQL di pengaturan lingkungan host. |
| Sesi dan database | `DB_CONNECTION=pgsql`, `SESSION_DRIVER=database`, `SESSION_SECURE_COOKIE=true`. Gunakan database demo yang bisa diakses runtime. |
| Akun demo | `NEARASA_DEMO_AUTH=false`. Gunakan perintah provisioning dan login email biasa. |
| Unggahan | Berkas foto tersimpan di disk `public` Laravel. Pilih penyimpanan persisten bila ingin hasil unggahan bertahan ketika layanan direstart atau di-deploy ulang. |

Render mendukung PostgreSQL terpisah. Web Service gratis memiliki filesystem sementara dan akses shell terbatas. Jalankan langkah administrasi dari lingkungan admin yang memiliki ekstensi PostgreSQL dan akses ke database demo, misalnya mesin pengembang melalui koneksi yang diizinkan atau shell layanan yang mendukungnya. [Panduan Laravel di Render](https://render.com/docs/deploy-php-laravel-docker) · [Batas paket gratis](https://render.com/docs/free)

## Build dan inisialisasi

Jalankan dari checkout versi demo. Build container memerlukan konfigurasi web server sesuai layanan.

```sh
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
```

Pada **database demo baru**, isi katalog sekali. Seeder katalog membuat ulang menu dan pos jika dijalankan kembali. Seeder Awards opsional untuk contoh peringkat.

```sh
php artisan db:seed --class=CatalogSeeder --force
php artisan db:seed --class=AwardsDemoSeeder --force
php artisan nearasa:provision-demo-owner demo-owner@example.test
```

Ganti email contoh dengan email khusus demo. Perintah meminta kata sandi melalui prompt tersembunyi dan hanya menautkan dua usaha contoh, Dapur Griya dan Pizza Sore. Jalankan perintah yang sama untuk mengganti sandi akun demo yang sama. Bagikan informasi login melalui jalur penilaian yang dapat diakses juri.

## Cek dari browser lain

1. Buka URL HTTPS tanpa sesi tim. Periksa Beranda, Jelajah, profil usaha, Peta, dan Awards jika sudah diisi data demo.
2. Login lewat **Masuk** dengan akun demo. Periksa akses ke **Kelola usaha** serta foto dan peta yang dipakai dalam skenario.
3. Tandai satu menu habis di Dapur Griya. Buka profil publik pos yang sama di sesi lain, cek hasilnya, lalu pulihkan kondisi menu untuk demo berikutnya.
4. Catat URL, hash commit yang berjalan, hasil uji, dan siapa yang bisa menangani akses jika terjadi gangguan selama penilaian.
