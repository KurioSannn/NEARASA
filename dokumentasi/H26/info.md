# Dokumentasi H26 - Fitur Formulir Pendaftaran Toko / UMKM Baru & Otomatisasi Dashboard

Dokumentasi ini mencatat pembuatan alur lengkap pendaftaran usaha kuliner baru (toko/UMKM) di NEARASA, mulai dari titik masuk di Akun, formulir onboarding, penyimpanan transaksional, hingga sinkronisasi otomatis ke Dashboard Merchant.

---

## 1. Alur Fitur yang Diterapkan

1. **Akses Pendaftaran Toko / UMKM**:
   - **Halaman Akun ([Account.tsx](file:///D:/NEARASA/resources/js/pages/Account.tsx))**:
     - Untuk pengguna biasa yang belum memiliki usaha (`ownedCount === 0`), ditampilkan badge *Pendaftaran UMKM* dengan tombol Call-to-Action utama: **"Daftarkan Usaha Kuliner"** mengarah ke `/kelola-usaha/daftar`.
     - Untuk pemilik yang sudah memiliki usaha, disediakan tautan sekunder **"+ Tambah Usaha Lain"**.
   - **Dashboard Merchant ([Dashboard.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx))**:
     - Ditambahkan tombol aksi **"+ Tambah Usaha"** di bagian atas dasbor.
     - Ketika akun baru belum memiliki usaha, ditampilkan banner onboarding: *"Belum ada usaha kuliner yang terhubung"* dengan tombol **"Daftarkan Usaha Pertama"**.
   - **Halaman Kelola Usaha ([BusinessEdit.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx))**:
     - Mengganti teks placeholder *"Pendaftaran belum tersedia"* dengan tombol interaktif **"Daftarkan Usaha Sekarang"**.

2. **Formulir Pendaftaran ([RegisterBusiness.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/RegisterBusiness.tsx))**:
   - Dibangun dengan tema hangat terakota NEARASA dan layout responsif:
     - **Profil Usaha**: Nama usaha kuliner, bentuk tempat jualan (warung/ruko/gerobak/food truck), kategori utama (dengan tombol pilihan cepat), nomor WhatsApp toko, cerita/deskripsi usaha, dan upload foto sampul.
     - **Pos Penjualan Pertama**: Nama gerai (default "Gerai Utama"), alamat lengkap, patokan lokasi, serta pemilihan titik koordinat area (Gedangan Sidoarjo, Krian Sidoarjo, Rungkut Surabaya, Gunung Anyar Surabaya).
     - **Jam Operasional**: Jam buka dan jam tutup rutin awal (WIB).

3. **Pemrosesan Backend Transaksional ([MerchantRegisterController.php](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php))**:
   - `GET /kelola-usaha/daftar`: Menampilkan halaman formulir pendaftaran.
   - `POST /kelola-usaha/daftar`:
     - Memvalidasi seluruh masukan pengguna.
     - Menghasilkan slug unik (`Str::slug`).
     - Menyimpan data `Business` dengan status `published`, `owner_id = Auth::id()`, dan `is_demo = false`.
     - Otomatis membuat `SellingPost` pertama dengan koordinat dan jadwal operasional 7 hari (`weeklySchedules`).
     - Mengatur session bisnis aktif dan mengarahkan langsung ke `/kelola-usaha` (Dashboard).
     - Dashboard langsung otomatis ter-update menampilkan usaha baru tersebut.

---

## 2. File yang Dibuat & Dimodifikasi

1. [`app/Http/Controllers/MerchantRegisterController.php`](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php): Controller pendaftaran toko baru.
2. [`resources/js/pages/Merchant/RegisterBusiness.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/RegisterBusiness.tsx): Halaman UI formulir pendaftaran UMKM.
3. [`routes/web.php`](file:///D:/NEARASA/routes/web.php): Mendaftarkan rute `GET` dan `POST` `/kelola-usaha/daftar`.
4. [`resources/js/pages/Account.tsx`](file:///D:/NEARASA/resources/js/pages/Account.tsx): Tombol CTA pendaftaran di kartu kelola usaha.
5. [`resources/js/pages/Merchant/Dashboard.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx): Banner onboarding dan tombol tambah usaha.
6. [`resources/js/pages/Merchant/BusinessEdit.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx): Tombol pendaftaran saat belum ada usaha terhubung.
7. [`tests/Feature/MerchantRegisterTest.php`](file:///D:/NEARASA/tests/Feature/MerchantRegisterTest.php): Unit & feature test untuk alur pendaftaran.
8. [`dokumentasi/H26/info.md`](file:///D:/NEARASA/dokumentasi/H26/info.md): Catatan dokumentasi ini.

---

## 3. Hasil Pengujian

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (0 error).
- **PHPUnit Feature Tests**:
  - `MerchantRegisterTest`: 3 tests, 10 assertions (100% pass).
  - Seluruh merchant & account tests: 34 tests, 520 assertions (100% pass).
