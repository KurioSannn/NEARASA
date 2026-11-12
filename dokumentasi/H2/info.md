# H2 - Dokumentasi Eksekusi TECH 2: Full Remake Dashboard Pemilik

## 1. Konteks & Tujuan
Melakukan perombakan menyeluruh (*full overhaul / remake*) pada Dashboard Pemilik (`/kelola-usaha`) mengadopsi struktur estetika visual referensi:
- Kanvas utama membulat `rounded-[36px]` dengan bayangan `shadow-2xl` berlatar hangat `bg-sand-surface` (#fff8f6) di atas latar lembut `#f5ede4`.
- Brand logo badge heksagonal dengan SVG path beraksen `#ffdbd0` dan terakota Nusantara.
- Navigasi pill melayang (*pill switcher*) untuk navigasi Dashboard, Kelola Usaha, Laporan, dan Katalog Publik.
- Dock navigasi vertikal melengkung compact `w-16 rounded-3xl` berlatar putih dengan shadow lembut.
- Layout 3-kolom modern:
  - Watchlist Usaha Kuliner (4 kolom) & Grafik Interaksi Pilar (8 kolom) dengan garis putus-putus (*dashed grid*) dan highlight pilar tertinggi.
  - 4 Kartu Metrik Operasional (Usaha Terkelola gradasi terakota, Laporan Pos amber, Pos Jualan warm sand, dan Pos Buka hijau emerald).
  - Tabel Pos Jualan Hari Ini berdesain transaksi modern dengan avatar cover usaha, status buka/tutup, jam WIB, dan tombol aksi "Kelola".
  - Sidebar Kanan (`w-80` / `w-96`): Stacked gradient card (`fintech-card-gradient`), 4 tombol aksi cepat melingkar, progress bar kesiapan operasional, dan highlight laporan tutup pelanggan.
- Tanpa data dummy atau AI slop: semua komponen 100% tersambung ke data riil model NEARASA (`businesses`, `operations`, `statistics`, `reports`, `auth.user`).

## 2. File yang Dibuat & Diperbarui
- [`resources/js/pages/Merchant/Dashboard.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx): Shell utama dashboard modern tanpa terikat wrapper layout lama.
- [`resources/js/components/merchant/dashboard/TopNav.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx): Bar navigasi atas mandiri dengan badge logo heksagonal, pill navigation, pencarian terintegrasi, dan pill profil pemilik.
- [`resources/js/components/merchant/dashboard/CurvedSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx): Dock icon vertikal compact `w-16 rounded-3xl`.
- [`resources/js/components/merchant/dashboard/BusinessWatchlist.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/BusinessWatchlist.tsx): Kartu daftar usaha kuliner milik user dengan cover foto dan rincian pos.
- [`resources/js/components/merchant/dashboard/InteractionChart.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx): Grafik batang pilar interaktif dengan tooltip angka riil dan highlight pilar tertinggi.
- [`resources/js/components/merchant/dashboard/SummaryCards.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/SummaryCards.tsx): 4 kartu ringkasan metrik operasional.
- [`resources/js/components/merchant/dashboard/TodayPostsTable.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TodayPostsTable.tsx): Tabel status pos jualan hari ini berformat modern.
- [`resources/js/components/merchant/dashboard/RightWalletSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/RightWalletSidebar.tsx): Sidebar kanan dengan stacked gradient card dan aksi cepat.
- [`resources/css/merchant-dashboard.css`](file:///D:/NEARASA/resources/css/merchant-dashboard.css): Definisi tema warna terakota, clay, sand, gradient, dan shadow.
- [`resources/js/components/merchant/dashboard/info.md`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/info.md): Dokumentasi modul komponen dashboard.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: Passed (0 errors).
- `npm run test:discovery`: Passed (4 tests).
- `npm run test:consumer`: Passed (5 tests).
- `php vendor/phpunit/phpunit/phpunit`: Passed (25 tests, 394 assertions).
- `git add`: File-file perubahan telah di-staging sesuai aturan AGENTS.md (tanpa commit, tanpa push, tanpa `npm run build`).
