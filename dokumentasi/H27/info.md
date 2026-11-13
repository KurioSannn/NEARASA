# Dokumentasi H27 - Penyempurnaan Formulir Pendaftaran Mitra Kuliner (2-Column Vertical Stepper)

Dokumentasi ini mencatat penyempurnaan tampilan dan implementasi formulir pendaftaran mitra kuliner (`/kelola-usaha/daftar`) sesuai acuan referensi desain 2-kolom editorial dengan vertical stepper, tema warna hangat terakota NEARASA, validasi interaktif bertahap, dan sinkronisasi otomatis ke dasbor merchant.

---

## 1. Rincian Implementasi & Fitur

1. **Struktur Layout 2-Kolom Terakota & Warm Cream**:
   - **Kolom Kiri (Stepper & Identitas Brand)**:
     - Header brand NEARASA dengan ikon gerai dan gradien terracotta (`#8D3215` ke `#B74B28`).
     - Judul: *"Daftar Mitra & Akun"*, subjudul: *"Buka pintu usaha kuliner Anda ke ribuan pelanggan lokal terdekat."*
     - **Vertical Stepper 4 Langkah**:
       1. *Informasi Pribadi & Pemilik* (NIK KTP, nama lengkap, alamat domisili, kontak & email).
       2. *Detail Usaha & Gerai* (nama usaha kuliner, bentuk tempat jualan, kategori utama & chips cepat, cerita usaha, pos penjualan utama, patokan, titik area cepat).
       3. *Jadwal & Operasional* (jam buka/tutup WIB, pemilihan hari buka Senin-Minggu, WhatsApp toko).
       4. *Ringkasan & Konfirmasi* (preview kartu data usaha, lokasi & jam, info pemilik, persetujuan syarat & ketentuan, tombol aktivasi langsung).
     - Bantuan & Navigasi Cepat kembali ke dasbor merchant.
   - **Kolom Kanan (Formulir Multi-Langkah Interaktif)**:
     - Desain input bernuansa modern rounded-xl, highlight border terracotta fokus, dan floating badge NIK 16 digit.
     - Validasi per-step di frontend (`first_name`, `name`, `description`, `address`) sebelum melangkah ke tahap berikutnya.
     - Pratinjau upload foto sampul gerai secara langsung (`FileReader` URL preview).

2. **Backend & Sinkronisasi Dasbor Otomatis ([MerchantRegisterController.php](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php))**:
   - Menerima payload lengkap termasuk data identitas pemilik (`owner_nik`, `first_name`, `last_name`, `owner_phone`, `owner_address`, dsb).
   - Menyimpan `Business` (`is_demo = false`, status `published`), `SellingPost`, dan jadwal mingguan 7 hari dalam satu transaksi database.
   - Mengatur session `merchant_business_id` ke id bisnis yang baru dibuat, lalu me-redirect langsung ke `/kelola-usaha`.
   - Dasbor langsung menampilkan gerai dan profil baru secara instan tanpa perlu aktivasi manual.

---

## 2. File Terkait

1. [`resources/js/pages/Merchant/RegisterBusiness.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/RegisterBusiness.tsx): Komponen halaman UI formulir pendaftaran 2-kolom dengan vertical stepper.
2. [`app/Http/Controllers/MerchantRegisterController.php`](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php): Controller penyimpanan data pendaftaran UMKM.
3. [`routes/web.php`](file:///D:/NEARASA/routes/web.php): Rute pendaftaran mitra (`merchant.register` & `merchant.register.store`).
4. [`tests/Feature/MerchantRegisterTest.php`](file:///D:/NEARASA/tests/Feature/MerchantRegisterTest.php): Pengujian fitur pendaftaran dan integrasi database.

---

## 3. Hasil Pengujian

- **TypeScript Typecheck (`npx tsc --noEmit`)**: 0 error (Lulus bersih).
- **PHPUnit Feature Tests**:
  - `MerchantRegisterTest`: 3 tests, 10 assertions (100% Passed).
  - Test Suite Keseluruhan: 113 tests, 1452 assertions (100% Passed).
