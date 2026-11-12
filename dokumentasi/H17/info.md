# Dokumentasi Eksekusi H17: Penghapusan Pill Navigasi Tengah Saja & Restorasi Header Utama

## 1. Konteks Permasalahan
- Klarifikasi dari user: Yang dimaksud dengan "hapus navbar atas" adalah **hanya pil menu navigasi tengah** (`<nav>` pill switcher: *Dashboard, Kelola Usaha, Laporan, Lihat NEARASA*) karena navigasi sudah ditangani oleh dock sidebar kiri (`CurvedSidebar`).
- Header atas (Logo resmi NEARASA, kolom pencarian "Cari usaha, pos...", lonceng notifikasi, dan pil profil pemilik) **tetap dipertahankan**.

## 2. Solusi & Perubahan yang Diterapkan
1. **`resources/js/components/merchant/dashboard/TopNav.tsx`**:
   - Menghapus elemen `<nav aria-label="Main Navigation">` (pil switcher tautan halaman) dari bagian tengah header.
   - Mempertahankan Logo NEARASA di sisi kiri, serta area utilitas (pencarian, lonceng notifikasi, dan akun pemilik dengan dropdown) di sisi kanan.
2. **`resources/js/components/merchant/dashboard/CurvedSidebar.tsx`**:
   - Mengembalikan dock sidebar kiri sebagai satu-satunya pusat navigasi vertikal murni (*Dashboard*, *Kelola Usaha*, *Laporan*, *Pengaturan Akun*, *Beranda*).
   - Menghapus ikon logo redundan di puncak sidebar dock dan menyetel sticky offset ke `sticky top-20 z-20` di bawah header sticky.
3. **`resources/js/pages/Merchant/Dashboard.tsx` & `resources/js/layouts/MerchantLayout.tsx`**:
   - Mengembalikan pemanggilan `<TopNav />` di posisi paling atas layout (`pt-0 pb-6`).
   - Membersihkan duplikasi pencarian di baris sapaan dashboard.
4. **Pewarnaan Garis Brown Transparan**:
   - Tetap aktif dan terjaga dengan nilai `rgba(183, 75, 40, 0.15)` pada seluruh garis pembatas kartu, tabel, dan pemisah layout.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
