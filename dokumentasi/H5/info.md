# Dokumentasi Eksekusi H5 - Unified Shell Navigasi & Redesign Modern Kelola Usaha

Dokumen ini mencatat detail eksekusi transformasi total antarmuka halaman **Kelola Usaha** (`/kelola-usaha/{business:slug}`) dan integrasi shell layout tunggal (**Unified Shell Layout**) untuk seluruh Ruang Pemilik NEARASA.

---

## 1. Analisis & Sasaran
- **Masalah Sebelumnya**:
  - Halaman `Kelola Usaha` masih dibungkus layout lama (`MerchantLayout`) dengan sidebar kaku 220px dan topbar breadcrumb klasik, sehingga berbeda total dan "lompat" saat berpindah dari `Dashboard`.
  - Struktur in-page `Kelola Usaha` masih menggunakan card datar lama dengan dropdown dan form yang renggang.
- **Sasaran**:
  - Menyatukan shell layout (`MerchantLayout.tsx`) agar identik dengan `Dashboard` menggunakan **TopNav** (top pill navigation switcher) dan **CurvedSidebar** (dock vertikal melengkung di kiri).
  - Menyinkronkan active state pada navbar dan sidebar agar dinamis mengikuti URL route saat ini (`/kelola-usaha`, `/kelola-usaha/{slug}`, `/kelola-usaha/laporan`).
  - Merombak visual in-page `BusinessEdit.tsx` dan `DailyOperations.tsx`:
    - Header judul halaman dengan tombol kembali ke dashboard.
    - Usaha context card modern dengan thumbnail foto cover, nama usaha, status pill (`Aktif Publik` / `Draf`), dropdown picker, dan action pill button *"Lihat Publik"*.
    - Pill tab switcher rounded-full (`Operasional`, `Menu & harga`, `Pos & jadwal`, `Profil usaha`, `Foto & kabar`) dengan indikator dot amber untuk draf belum disimpan.
    - Toolbar pos selector dengan ikon pin lokasi, alamat lengkap, dan status pill (`Buka` / `Tutup`).
    - Grid 2-kolom: Ketersediaan Menu (7 kolom) dengan toggle switch terracotta dan Jam Hari Ini (5 kolom) dengan kartu jam operasional besar serta tombol primary terracotta *"Ubah jam hari ini"*.
  - Menjaga 100% logika, props, callback `reportDirty`, dirty dialog, dan form submissions tanpa mengubah backend.

---

## 2. File yang Dikerjakan

1. **`resources/js/components/merchant/dashboard/TopNav.tsx`**:
   - Mendeteksi route aktif secara dinamis (`activeNav`) berdasarkan URL.
   - Mengaktifkan pill terracotta pada tab yang sedang dibuka (`Dashboard`, `Kelola Usaha`, `Laporan`).
2. **`resources/js/components/merchant/dashboard/CurvedSidebar.tsx`**:
   - Menghubungkan ikon dock vertikal kiri dengan route URL aktif (`LayoutGrid` untuk Dashboard, `Store` untuk Kelola Usaha, `ShieldCheck` untuk Laporan).
3. **`resources/js/layouts/MerchantLayout.tsx`**:
   - Menggantikan sidebar lebar 220px lama dengan `TopNav` di atas dan `CurvedSidebar` di kiri, serta menyediakan mobile bottom dock navigasi.
4. **`resources/js/pages/Merchant/BusinessEdit.tsx`**:
   - Memodernisasi tampilan Usaha Selector card, Pill Tab Switcher, dan subnav tab Profil/Media dengan estetika artisanal terracotta.
5. **`resources/js/components/merchant/DailyOperations.tsx`**:
   - Merombak card lokasi jualan pos, list ketersediaan menu dengan rounded switch terracotta, dan card jam buka operasional yang senada dengan Dashboard.

---

## 3. Hasil Pengujian & Verifikasi
- **TypeScript Typecheck**:
  - `npm run typecheck` -> **Passed** (0 errors).
- **Backend Feature Tests**:
  - `MerchantManagementTest.php`, `MerchantOperationsTest.php`, `MerchantWorkspaceTest.php` -> **Passed**.
