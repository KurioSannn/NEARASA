# Dokumentasi Eksekusi H4 - Remake UI Kelola Usaha (Ruang Pemilik)

Dokumen ini mencatat detail eksekusi transformasi antarmuka halaman **Kelola Usaha** (`/kelola-usaha/{business:slug}`) agar selaras secara visual dengan tema artisanal warm terracotta, clay, dan sand palette yang telah diterapkan pada Dashboard NEARASA, dengan tetap mempertahankan 100% alur kerja (workflow), logika state, fungsionalitas form, dan dirty tracking tanpa mengubah perilaku bisnis.

---

## 1. Analisis & Kebutuhan (Audit Singkat)
- **Kondisi Sebelum**:
  - Halaman `Kelola usaha` masih menggunakan tema lawas berbasis warna biru dingin (`#3154d9`, `#f4f7fc`, `#e8efff`, `#dbe4ff`) pada sidebar layout, navigasi breadcrumb, avatar, work tabs, tombol simpan/aksi, dan status switch.
- **Instruksi Pengguna**:
  - *"sekarang lanjut kelola usaha dulu alurnya tetap samakan gw cuman remake ui nya doang"* -> dilanjutkan dengan *"gas"*.
- **Tujuan**:
  - Merevisi visual token global workspace pemilik (`resources/css/merchant-redesign.css`) dan shell navigasi (`resources/js/layouts/MerchantLayout.tsx`) menjadi palet terracotta (`#b74b28`, `#963412`), soft sand (`#fbf6f0`, `#fbf1ea`), dan warm border (`#eedfd4`).
  - Menjaga keutuhan seluruh state operasional (ketersediaan menu, switch stock, ubah jam hari ini, tab menu & harga, pos & jadwal, profil, foto & kabar) tanpa hardcoding atau perubahan alur bisnis.

---

## 2. File yang Dikerjakan

### A. `resources/css/merchant-redesign.css`
1. **Design Tokens Overhaul**:
   - `--paper`: Diubah dari `#f4f7fc` ke `#fbf6f0`.
   - `--ink`: Diubah dari `#18213a` ke `#1e130c`.
   - `--muted`: Diubah dari `#5e6b83` ke `#786b62`.
   - `--accent`: Diubah dari `#3154d9` (biru) ke `#b74b28` (terracotta).
   - `--accent-dark`: Diubah dari `#2544bb` ke `#963412`.
   - `--tint`: Diubah dari `#b9dad7` ke `#ffdcd2`.
   - `--line`: Diubah dari `#e0e7f1` ke `#eedfd4`.
   - `--soft`: Diubah dari `#edf2fc` ke `#fbf1ea`.
2. **Komponen UI yang Diperbarui**:
   - `.merchant-sidebar` & `.merchant-topbar`: Background putih hangat dengan backdrop blur (`rgba(255, 255, 255, 0.9)`), border sand `#eedfd4`.
   - Sidebar Selected Item: Background `#fdeee9`, teks terracotta `#b74b28`, dan bar aksen terracotta `#b74b28`.
   - Avatar Pengguna: Background `#ffdcd2` dengan inisial terracotta `#b74b28`.
   - Tombol Utama (`.owner-button`, `.daily-action`): Background terracotta dengan hover `#963412`, sudut `rounded-[12px]`, dan bayangan hangat.
   - Usaha Selector (`.owner-business-picker`): Border sand `#eedfd4`, radius `14px`, dropdown elegan.
   - Tombol Tautan Publik (`.owner-business-context > .owner-text-link`): Didesain sebagai pill button hangat dengan background `#fbf1ea`, teks `#b74b28`, dan ikon mata.
   - Work Tabs (`.owner-work-tabs`): Underline border sand dengan tab aktif berwarna terracotta dan indikator bar bawah `#b74b28`.
   - Switch Ketersediaan (`.owner-switch-track`): Switch aktif berwarna terracotta `#b74b28` dan switch mati berwarna sand-clay `#d4c5bb`.
   - Form Inputs (`.text-input`, `.profile-textarea`): Border sand `#eedfd4`, radius `10-12px`, dan focus ring terracotta `rgba(183, 75, 40, 0.12)`.
   - Subnav Tabs (`.owner-subnav`): Tombol tab sekunder dengan status aktif `#fdeee9` dan border `#ffdcd2`.

### B. `resources/js/layouts/MerchantLayout.tsx`
1. **Brand Lockup Konsisten**:
   - Mengganti teks wordmark sederhana dengan badge ikon heksagonal SVG terracotta (`#b74b28`) berpadu teks "NEARASA" dan subjudul "Ruang Pemilik" yang persis dengan navbar dashboard.
2. **Pill Tautan Publik & Profil Dropdown**:
   - Merapikan visual link "Lihat NEARASA" dan menu dropdown akun agar seirama dengan tema baru.

---

## 3. Hasil Verifikasi & Quality Check
1. **TypeScript Typecheck**:
   - `npm run typecheck` -> **Passed** (0 errors).
2. **PHPUnit Feature Tests**:
   - `MerchantManagementTest.php`
   - `MerchantOperationsTest.php`
   - `MerchantWorkspaceTest.php`
   - **Passed**: 25 tests, 445 assertions, 0 failures.
3. **Penyelarasan Desain**:
   - Warna biru di halaman `Kelola usaha` telah sepenuhnya digantikan oleh warm terracotta & sand palette.
   - Seluruh alur (toggle ketersediaan pos, ubah jam buka hari ini, tab perpindahan, dialog peringatan draf belum disimpan) berjalan normal dan responsif.
