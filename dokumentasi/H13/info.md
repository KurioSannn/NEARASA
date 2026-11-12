# Dokumentasi Eksekusi H13: Tema Scrollbar Terpadu & Standarisasi Animasi Hover Button

## 1. Konteks Permasalahan
- Scrollbar antarmuka Ruang Pemilik (`/kelola-usaha` dan `/kelola-usaha/{slug}`) masih menggunakan scrollbar bawaan sistem operasi (Windows default) yang berwarna abu-abu kaku dan tidak selaras dengan tema hangat NEARASA.
- Tombol-tombol aksi dan tautan interaktif belum semuanya memiliki efek perubahan warna (*mouse hover color transition*) yang konsisten seperti acuan 4 tombol aksi cepat (*Kelola*, *Pos Baru*, *Laporan*, *Akun*).

## 2. Solusi & Perubahan yang Diterapkan
1. **Scrollbar Bertema Hangat NEARASA (`resources/css/merchant-dashboard.css`)**:
   - Menerapkan styling scrollbar pada level `html`, `body`, dan seluruh kontainer scroll:
     - Standar CSS: `scrollbar-width: thin` dan `scrollbar-color: #d8c4b8 #fff8f6`.
     - WebKit/Chromium: Track `#fff8f6` (menyatu dengan latar `sand-surface`), thumb rounded `#d8c4b8` dengan border 2px `#fff8f6`.
     - Hover state: Thumb bertransisi ke warna `#b74b28` (*terracotta*).
2. **Standarisasi Hover Color Transition Tombol**:
   - [`TopNav.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx):
     - Lonceng notifikasi: `hover:bg-[#fdeee9] hover:border-terracotta-200 hover:text-terracotta transition-colors duration-150`.
     - Pil akun pengguna: `hover:bg-[#fdeee9] hover:border-terracotta-200 transition-colors duration-150`.
     - Dropdown menu item: `hover:bg-[#fdeee9] hover:text-terracotta transition-colors duration-150`.
     - Tombol keluar: `hover:bg-red-50 hover:text-red-700 transition-colors duration-150`.
   - [`BusinessWatchlist.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/BusinessWatchlist.tsx):
     - Tombol bulat panah kanan atas: `hover:bg-[#fdeee9] hover:border-terracotta-200 hover:text-terracotta transition-colors duration-150`.
   - [`InteractionChart.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx):
     - Tombol *"Cara hitung"*: Ditransformasi menjadi pil elegan dengan `bg-clay-50 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 hover:text-terracotta transition-colors duration-150`.
   - [`TodayPostsTable.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TodayPostsTable.tsx):
     - Tautan header *"Atur Pos & Jadwal"*: Diberikan background pil dengan `bg-terracotta-50/60 hover:bg-[#fdeee9] border border-terracotta-200/60 hover:border-terracotta-200 transition-colors duration-150`.
     - Tombol aksi baris *"Kelola"*: `transition-colors duration-150` murni perubahan warna tanpa zoom/scale.
     - Tombol kosong *"Tambah Pos Jualan"*: `transition-colors duration-150`.
   - [`RightWalletSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/RightWalletSidebar.tsx):
     - Tombol panah atas *Kartu Pemilik* & *Perhatian Pos*: `hover:bg-[#fdeee9] hover:border-terracotta-200 hover:text-terracotta transition-colors duration-150`.
     - Tautan *"Buka Laporan"*: `hover:text-terracotta-700 transition-colors`.
   - [`BusinessEdit.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx):
     - Tombol *"Lihat Publik"*: `transition-colors duration-150 shadow-xs`.
   - [`DailyOperations.tsx`](file:///D:/NEARASA/resources/js/components/merchant/DailyOperations.tsx):
     - Tombol *"Kembali ke jadwal rutin"*: `bg-terracotta-50/70 hover:bg-[#fdeee9] hover:border-terracotta-200 transition-colors duration-150`.
     - Tautan *"Atur jadwal rutin di Pos & Jadwal →"*: `hover:text-terracotta hover:bg-[#fdeee9] hover:border-terracotta-200 transition-colors duration-150`.
     - Tombol *"Batal"* & *"Simpan Jam"*: `transition-colors duration-150`.
   - [`merchant-redesign.css`](file:///D:/NEARASA/resources/css/merchant-redesign.css):
     - Menghapus efek `translateY(-1px)` pada `.owner-button:hover` sehingga murni perubahan warna (*no zoom/scale*).

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
