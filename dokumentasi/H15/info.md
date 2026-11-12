# Dokumentasi Eksekusi H15: Penyesuaian Tombol Icon Brown Terracotta & Teks Brown Gelap

## 1. Konteks Permasalahan
- User memberikan klarifikasi bahwa yang diinginkan menjadi warna brown adalah **kotak tombol icon** di dalam kartu aksi cepat (*Kelola*, *Pos Baru*, *Laporan*, *Akun*), bukan kartu pembungkus luarnya.
- Kartu pembungkus luar tetap berlatar beige/sand lembut (`bg-clay-100`), tombol icon di dalamnya menjadi **Brown Terracotta** dengan icon **Putih**, serta teks label menggunakan warna **Font Brown Gelap** (`text-clay-900`) yang bertransisi ke terracotta saat di-hover.

## 2. Solusi & Perubahan yang Diterapkan
1. **`resources/js/components/merchant/dashboard/RightWalletSidebar.tsx`**:
   - Kartu luar dikembalikan ke latar beige hangat (`bg-clay-100` / `#f5ede4`) dengan border `border-sand-border`, dan efek hover `hover:bg-[#fdeee9] hover:border-terracotta-200`.
   - Kotak tombol icon (yang sebelumnya putih) diubah menjadi **Brown Terracotta** (`bg-terracotta` / `#b74b28`) dengan icon berwarna **Putih Bersih** (`text-white`).
   - Saat disentuh mouse (*hover*), kotak tombol icon bertransisi warna ke terracotta yang lebih pekat (`group-hover:bg-terracotta-600` / `#963412`).
   - Teks label ("Kelola", "Pos Baru", "Laporan", "Akun") menggunakan font **Brown Gelap** (`text-clay-900`), dan bertransisi ke terracotta (`group-hover:text-terracotta`).
   - Indikator badge laporan tertunda menggunakan warna kuning keemasan (`bg-amber-300 ring-1 ring-white`) yang kontras di sudut tombol icon laporan.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
