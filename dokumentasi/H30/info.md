# Dokumentasi H30 - Halaman Setelan Terpadu Mitra & Akun (`/kelola-usaha/setelan`)

Dokumentasi ini mencatat pembuatan halaman **Setelan** terpadu untuk area Merchant (`MerchantLayout`) yang menggabungkan pengaturan toko (profil & kontak usaha aktif beserta pemilih usaha) dan pengaturan akun pemilik (profil publik, foto akun, kata sandi, daftar usaha terhubung, serta tombol keluar) agar pengguna merchant tetap berada di dalam tata letak dashboard mitra.

---

## 1. Perubahan yang Dilakukan

1. **Rute & Controller Setelan Merchant ([routes/web.php](file:///D:/NEARASA/routes/web.php) & [MerchantController.php](file:///D:/NEARASA/app/Http/Controllers/MerchantController.php))**:
   - Menambahkan rute `GET /kelola-usaha/setelan` dengan nama `merchant.settings` di dalam grup middleware `auth` sebelum rute dinamis `/kelola-usaha/{business:slug}` (sehingga tidak bentrok dengan parameter slug dan tetap menjaga kompatibilitas rute `/kelola-usaha/pengaturan`).
   - Menambahkan method `MerchantController::settings(Request $request)` yang merender halaman Inertia `'Merchant/Settings'` dengan props `business`, `businesses`, `publicName`, `publicProfileAvailable`, dan `merchantNavigation`.

2. **Halaman Setelan Terpadu ([Settings.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/Settings.tsx))**:
   - Dibungkus dengan `MerchantLayout` dan dilengkapi proteksi perubahan belum tersimpan (`Leaving` dialog) saat berpindah usaha atau keluar dari halaman.
   - Mendukung dua tab utama (dapat diinisialisasi melalui query `?tab=owner` atau default `store`):
     - **Tab Profil & Kontak Toko (`store`)**: Menampilkan pemilih usaha aktif (dropdown), status publik/nonaktif, tautan **Lihat Publik**, serta form `AboutSection` dan `ContactSection` untuk toko aktif.
     - **Tab Akun Pemilik & Keamanan (`owner`)**: Mengelola foto profil (`POST/DELETE /akun/foto`), nama & nama publik (`PATCH /akun/profil`), pembaruan kata sandi (`PUT /akun/sandi`), tombol keluar (`POST /keluar`), serta daftar usaha yang terhubung dengan akun.
   - Menggunakan `const { props: { auth }, url } = usePage<SharedProps>();` agar pembacaan query URL terketik valid oleh TypeScript.

3. **Pembaruan Tautan Navigasi Sidebar & TopNav ([CurvedSidebar.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx) & [TopNav.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx))**:
   - Memperbarui deteksi `activeNav` di `CurvedSidebar.tsx` agar rute `/kelola-usaha/setelan` menandai `'settings'` sebagai aktif.
   - Mengarahkan ikon gir Setelan pada sidebar desktop dan item ke-4 pill navigasi seluler (`Setelan`) menuju `/kelola-usaha/setelan`.
   - Mengarahkan tautan menu dropdown profil di `TopNav.tsx` dari `/akun` menjadi `/kelola-usaha/setelan` (*Setelan Mitra & Akun*).

---

## 2. File yang Terdampak

1. [`routes/web.php`](file:///D:/NEARASA/routes/web.php)
2. [`app/Http/Controllers/MerchantController.php`](file:///D:/NEARASA/app/Http/Controllers/MerchantController.php)
3. [`resources/js/components/merchant/dashboard/CurvedSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx)
4. [`resources/js/components/merchant/dashboard/TopNav.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx)
5. [`resources/js/pages/Merchant/Settings.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Settings.tsx)
6. [`dokumentasi/H30/info.md`](file:///D:/NEARASA/dokumentasi/H30/info.md)

---

## 3. Hasil Verifikasi

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (exit code 0).
- **PHPUnit Merchant Tests (`php artisan test --filter=Merchant`)**: 39 tests, 39 passed, 560 assertions (10750 ms).
