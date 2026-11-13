# Dokumentasi H25 - Revert Grafik Interaksi (Hapus Garis Bawah), Pembersihan Akun Demo di Login, dan Seeder Akun Testing

Dokumentasi ini mencatat pengerjaan:
1. Revert tampilan grafik interaksi di dashboard merchant ke bentuk pilar pill original, dengan menghilangkan garis horizontal di angka 0.
2. Penghapusan kartu akun demo pada halaman login.
3. Pembuatan seeder akun biasa untuk pengujian onboarding / menjadi mitra UMKM, serta standarisasi password akun pemilik.

---

## 1. Rincian Perubahan

### A. Revert Tampilan Grafik Interaksi ([InteractionChart.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx))
- Mengembalikan bentuk pilar kapsul pill original (`rounded-full`, tinggi proporsional, tanpa label angka ganda).
- Menghilangkan garis horizontal solid paling bawah pada nilai `0` (`border-transparent` dan `borderColor: 'transparent'`), sehingga tidak ada lagi garis yang memotong atau menusuk keempat pilar pill di bagian bawah grafik.

### B. Pembersihan Kartu Akun Demo pada Layar Login ([Login.tsx](file:///D:/NEARASA/resources/js/pages/Auth/Login.tsx) & [AuthController.php](file:///D:/NEARASA/app/Http/Controllers/AuthController.php))
- Membuang kartu demo (`consumer-demo-card`) dan tombol *"Coba Akun Mitra UMKM"* dari antarmuka login.
- Membersihkan state `demoPending` serta prop `demoEnabled` di view login dan controller.
- Halaman login kini menjadi form autentikasi bersih murni: Input Email, Input Kata Sandi, dan Tombol Masuk Akun.

### C. Seeder Akun Pengguna Biasa ([UserAccountSeeder.php](file:///D:/NEARASA/database/seeders/UserAccountSeeder.php) & [DatabaseSeeder.php](file:///D:/NEARASA/database/seeders/DatabaseSeeder.php))
- **Akun Pengguna Biasa (Konsumen Non-Pemilik)**:
  - **Email**: `user@nearasa.test`
  - **Kata Sandi**: `password`
  - **Nama**: Pengguna Biasa
  - **Status**: `is_demo: false`
  - **Usaha**: 0 (belum terhubung usaha manapun, siap digunakan untuk pengujian flow mendaftar atau menjadi UMKM).
- **Akun Pemilik Usaha Eksisting**:
  - **Email**: `pemilik@nearasa.test`
  - **Kata Sandi**: `password`
  - Memiliki 2 usaha terdaftar (Dapur Griya & Pizza Sore).

---

## 2. File yang Dimodifikasi & Dibuat

1. [`resources/js/components/merchant/dashboard/InteractionChart.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx)
2. [`resources/js/pages/Auth/Login.tsx`](file:///D:/NEARASA/resources/js/pages/Auth/Login.tsx)
3. [`app/Http/Controllers/AuthController.php`](file:///D:/NEARASA/app/Http/Controllers/AuthController.php)
4. [`database/seeders/UserAccountSeeder.php`](file:///D:/NEARASA/database/seeders/UserAccountSeeder.php)
5. [`database/seeders/DatabaseSeeder.php`](file:///D:/NEARASA/database/seeders/DatabaseSeeder.php)
6. [`dokumentasi/H25/info.md`](file:///D:/NEARASA/dokumentasi/H25/info.md)

---

## 3. Hasil Pengujian & Verifikasi

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (0 error).
- **Node Profile Tests (`npm run test:profile`)**: 3/3 tes lulus (100%).
- **PHPUnit Feature Tests (`AccountMerchantTest`, `MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`)**: Seluruh tes lulus (100%).
