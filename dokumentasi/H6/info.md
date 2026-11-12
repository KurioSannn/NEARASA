# Dokumentasi Eksekusi H6 - Polish Sidebar, Navbar Logo, Kontras Kartu & Chart Legend

Dokumen ini mencatat eksekusi penyempurnaan menyeluruh pada antarmuka Ruang Pemilik (Dashboard & Kelola Usaha) berdasarkan feedback visual pengguna.

---

## 1. Rincian Perubahan yang Dikerjakan

1. **Penghapusan Sidebar dari Kelola Usaha (`MerchantLayout.tsx`)**:
   - Menghapus komponen `CurvedSidebar` dari `MerchantLayout.tsx` sehingga halaman Kelola Usaha (`BusinessEdit.tsx`) memiliki kanvas bersih, lapang, dan *full-width* (`max-w-[1600px] mx-auto`).
2. **Koreksi Dimensi Sidebar Dashboard (`Dashboard.tsx` & `CurvedSidebar.tsx`)**:
   - Memperbaiki pembungkus flexbox di `Dashboard.tsx` dengan menambahkan `items-start`.
   - Mengatur `CurvedSidebar.tsx` menjadi `h-fit self-start gap-5` sehingga dock ikon tidak lagi melar memanjang ke bawah dengan ruang putih kosong yang masif.
3. **Efek Animasi Hover Interaktif**:
   - Menambahkan transisi halus (`transition-all duration-200 ease-out`) dengan perubahan background `hover:bg-terracotta-50 hover:text-terracotta` serta efek `hover:scale-105` pada tombol navbar (`TopNav.tsx`) dan ikon dock (`CurvedSidebar.tsx`).
4. **Pembaruan Logo Resmi Publik (`TopNav.tsx`)**:
   - Mengganti SVG generik dengan logo resmi `/images/logo/nearasa-logo-colored.png` persis seperti di header publik NEARASA, dilengkapi badge "Ruang Pemilik" yang elegan.
5. **Pembersihan Subtitle Tabel (`TodayPostsTable.tsx`)**:
   - Menghapus teks *"Status dan jadwal operasional seluruh pos aktif · WIB"* di bagian header ringkasan pos harian.
6. **Penataan Ulang Legend Chart (`InteractionChart.tsx`)**:
   - Menempatkan label kategori (`Profil`, `Menu`, `Peta`, `WhatsApp`) di bawah garis pemisah horizontal (`border-t border-sand-border`), sehingga bar chart berdiri bebas di area kanvas atas.
7. **Kontras Teks Putih pada Kartu Cokelat (`BusinessWatchlist.tsx`)**:
   - Memastikan teks nama usaha (`Dapur Griya`), jenis usaha, dan status pada kartu gelap (indeks 0) berwarna putih bersih (`!text-white` dan `!text-white/80`) sehingga terbaca jelas dan berdaya kontras tinggi.

---

## 2. Hasil Verifikasi
- `npm run typecheck` -> **Passed** (0 error).
- PHPUnit Feature Tests -> **Passed** (25 tests, 445 assertions).
- Seluruh file di-*stage* via `git add` tanpa melakukan commit atau push.
