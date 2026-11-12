# Dokumentasi Eksekusi H19: Penyempurnaan Warna Garis, Softening Font Gelap, & Integrasi Kalender Penjadwalan

Dokumentasi ini mencatat hasil pengerjaan refaktor visual dan fungsional pada Ruang Pemilik NEARASA:
1. Perbaikan warna garis horizontal dan pembatas agar tidak pernah mewarisi `currentColor` hitam.
2. Pelembutan warna teks gelap (*soft dark mocha espresso*) agar nyaman di mata dan tidak hitam kasar.
3. Integrasi komponen kalender interaktif Google Calendar-style ([PostScheduleCalendar.tsx](file:///D:/NEARASA/resources/js/components/merchant/calendar/PostScheduleCalendar.tsx)) ke dalam halaman kelola pos usaha ([PostsSection.tsx](file:///D:/NEARASA/resources/js/components/merchant/PostsSection.tsx)).

---

## 1. Perubahan Teknis & File yang Dimodifikasi

### A. Registrasi `@theme` Tailwind v4 & Import CSS Utama
- **File**: `resources/css/app.css`
- **Perubahan**:
  - Mengimpor `./merchant-dashboard.css` di dalam `app.css`.
  - Mendaftarkan seluruh token theme warna:
    - `--color-sand-border: rgba(183, 75, 40, 0.18)`
    - Palet terracotta (`50` hingga `900`)
    - Palet clay yang sudah dilembutkan:
      - `--color-clay-900: #4a3831` (Soft Mocha Espresso)
      - `--color-clay-800: #5f4940` (Deep Cocoa)
      - `--color-clay-700: #786057`
      - `--color-clay-600: #917970`
      - `--color-clay-500: #a89289`

### B. Penguatan Aturan CSS & Softening Hex Font
- **File**: `resources/css/merchant-dashboard.css`
- **Perubahan**:
  - Memperbarui class `.text-clay-900`, `.text-clay-800`, `.text-clay-700`, dan `.text-clay-600` dengan nilai warna soft dark espresso.
  - Memperkuat selector `.border-sand-border`, `.border-t.border-sand-border`, `.border-b.border-sand-border`, dan `tbody.divide-sand-border > tr + tr` dengan warna `rgba(183, 75, 40, 0.18) !important`.

### C. Garis Pemisah & Metrik Interaksi
- **File**: `resources/js/components/merchant/dashboard/InteractionChart.tsx`
- **Perubahan**:
  - Menambahkan inline fallback `style={{ borderColor: 'rgba(183, 75, 40, 0.18)' }}` pada garis grid horizontal chart dan garis pembatas summary baris bawah di bawah metrik *Profil*, *Menu*, *Peta*, *WhatsApp*.
  - Menghilangkan kemungkinan garis hitam pekat akibat pewarisan `currentColor`.

### D. Tabel Ringkasan Pos Jualan Hari Ini
- **File**: `resources/js/components/merchant/dashboard/TodayPostsTable.tsx`
- **Perubahan**:
  - Menambahkan border style eksplisit pada `thead tr` dan `tbody tr` agar pembatas tabel konsisten bernuansa cokelat transparan hangat.
  - Teks nama pos, judul tabel, alamat, dan jam buka kini menggunakan warna mocha lembut `#4a3831` dan `#5f4940`.

### E. Integrasi Kalender Penjadwalan Pos & Tanggal Khusus
- **File**: `resources/js/components/merchant/PostsSection.tsx`
- **Folder Komponen Baru**: `resources/js/components/merchant/calendar/`
- **Perubahan**:
  - Mengimpor `PostScheduleCalendar` dan merendernya di bawah daftar pos pada tab *Pos & jadwal* (`/kelola-usaha/{slug}?tab=posts`).
  - Pemilik toko kini dapat:
    - Melihat jadwal pos dalam format kalender bulanan 7 hari (Sen-Min).
    - Memilih tanggal untuk membuka dialog Google Calendar-style.
    - Mengatur tanggal khusus pos: Buka Jam Khusus (`opens_at` & `closes_at`) atau Tutup / Libur Sementara.
    - Mengirim perubahan via `router.patch` langsung ke endpoint `/kelola-usaha/{slug}/pos/{id}` dengan menjaga scroll posisi.

---

## 2. Hasil Verifikasi
1. **TypeScript Typecheck (`tsc --noEmit`)**:
   - Status: **PASSED (Exit code 0)**, 0 errors.
2. **PHPUnit Feature Tests**:
   - Status: Berjalan normal tanpa regresi pada `MerchantManagementTest`, `MerchantOperationsTest`, dan `MerchantWorkspaceTest`.

---

## 3. Kepatuhan Aturan Repositori (AGENTS.md)
- Perubahan dilakukan setelah perintah tegas **"GAS"** dari user.
- **TIDAK** menjalankan `git commit` maupun `git push`.
- **TIDAK** menjalankan `npm run build`.
- File perubahan dimasukkan ke Git Staging (`git add`).
