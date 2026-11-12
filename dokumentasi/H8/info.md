# Dokumentasi Eksekusi H8 - Compact Nav Switcher, Home Dock Button, Perataan Kolom Konten, 2-Color Typography & Eliminasi Space Footer

Dokumen ini mencatat eksekusi penyempurnaan UI Ruang Pemilik NEARASA berdasarkan arahan dan 4 screenshot feedback visual pengguna.

---

## 1. Rincian Perubahan yang Dikerjakan

1. **Pengecilan Pill Switcher Navbar (`TopNav.tsx`)**:
   - Memperkecil padding container dari `p-1.5` menjadi `p-1 gap-1`.
   - Mengubah ukuran tombol pill dari `px-5 py-2` menjadi `px-3.5 py-1.5 text-xs` yang jauh lebih ramping, proporsional, dan estetik.
   - Hover state disesuaikan agar pas dengan lengkungan pill (`hover:bg-[#fdeee9] hover:text-terracotta`).

2. **Pengubahan Tombol Bawah Dock Menjadi Tombol Home (`CurvedSidebar.tsx`)**:
   - Menghapus tombol Logout dari dock samping.
   - Menggantinya dengan **Tombol Beranda Publik** yang mengarah ke `/` dengan ikon `Home` (`<Home className="w-5 h-5" />`).

3. **Perataan Kolom Konten & Pembersihan Tombol Panah Back (`Dashboard.tsx`)**:
   - Menghapus tombol bulat panah kembali (`<ArrowLeft>`) yang tidak diperlukan.
   - Memindahkan bagian sapaan (`Halo, {firstName} 👋` dan deskripsi operasional) ke dalam container `<main>`, sehingga **lurus sempurna secara vertikal** dengan kartu Watchlist dan tabel ringkasan di bawahnya.
   - Sidebar dock `CurvedSidebar` sekarang sejajar langsung dengan seluruh kanvas konten utama di sebelah kanan.

4. **Standarisasi Typography Menjadi 2 Warna Saja (Brown & Putih)**:
   - Menghilangkan warna font abu-abu pudar (`text-clay-400` / `text-clay-500`) dan warna-warni yang membingungkan.
   - **Warna Font 1 (Brown)**: Menggunakan warna clay cokelat pekat (`text-clay-900`, `text-clay-800`, `text-clay-700`) untuk semua teks di atas latar belakang terang (judul, sapaan, subjudul, header tabel, isi tabel, status label, dan deskripsi).
   - **Warna Font 2 (Putih)**: Menggunakan warna putih murni (`text-white !text-white`) untuk teks di atas background gelap, oranye/terracotta, dan kartu kontras tinggi.
   - Menyelaraskan seluruh font dengan font asli NEARASA di awal (`style={{ fontFamily: 'var(--font-sans)' }}`).

5. **Peniadaan Space Kosong Menganga di Bawah Footer (`Footer.tsx`, `Dashboard.tsx`, `MerchantLayout.tsx`)**:
   - Menambahkan override `!mb-0 !pb-1 mt-auto` serta `style={{ marginBottom: 0, paddingBottom: 0 }}` pada `.site-footer`.
   - Mengurangi bottom-padding layout dari `lg:p-7` / `lg:p-8` menjadi `lg:pb-3` sehingga footer menempel rapi dan proporsional di dasar halaman tanpa ruang kosong berlebih.

---

## 2. Hasil Verifikasi
- `npm run typecheck` -> **Passed (0 error)**.
- PHPUnit Feature Tests -> **Passed (25 tests, 445 assertions)**.
- Semua file di-stage via `git add` sesuai SOP (tanpa commit, tanpa push, tanpa npm run build).
