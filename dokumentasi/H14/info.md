# Dokumentasi Eksekusi H14: Transformasi Tombol Aksi Cepat ke Warna Brown Terracotta & Teks Putih

## 1. Konteks Permasalahan
- User meminta 4 tombol aksi cepat pada *Kartu Pemilik* (*Kelola*, *Pos Baru*, *Laporan*, *Akun*) diubah menjadi warna **Brown**, dan menanyakan warna teks yang sesuai.
- Sesuai prinsip desain NEARASA: aturan 2 warna font (1 font brown & 1 font putih). Pada latar tombol berwarna Brown Terracotta (`bg-terracotta`), teks dan icon wajib berwarna **Putih Bersih** (`text-white`) agar memberikan kontras tajam, jelas terbaca, dan elegan.

## 2. Solusi & Perubahan yang Diterapkan
1. **`resources/js/components/merchant/dashboard/RightWalletSidebar.tsx`**:
   - Mengubah latar 4 tombol aksi cepat menjadi **Brown Terracotta** (`bg-terracotta` / `#b74b28`).
   - Kotak icon di dalam tombol diubah menjadi latar putih (`bg-white`) dengan icon berwarna terracotta (`text-terracotta`), memberikan kontras visual yang kuat dan rapi.
   - Mengubah teks label ("Kelola", "Pos Baru", "Laporan", "Akun") menjadi **Putih Bersih** (`text-white font-bold`).
   - Efek hover kursor diselaraskan bertransisi warna ke brown yang lebih pekat (`hover:bg-terracotta-600` / `#963412`) tanpa efek zoom atau scale.
   - Badge notifikasi laporan tertunda diperjelas dengan badge kuning keemasan (`bg-amber-400 ring-1 ring-white`) di atas kotak icon.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
