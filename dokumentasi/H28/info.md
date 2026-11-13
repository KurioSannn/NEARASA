# Dokumentasi H28 - Remake Menu Navigasi Dashboard Mode Mobile (Floating Island Capsule Pill)

Dokumentasi ini mencatat pengerjaan remake navigasi mode seluler/HP pada area Dashboard & Kelola Usaha Merchant agar serasi dengan gaya **Floating Island Capsule Pill** pada menu utama konsumen (`MobilePillNav.tsx`), menggantikan bottom bar datar lama sekaligus menghadirkan navigasi seluler di halaman utama `/kelola-usaha` yang sebelumnya belum memilikinya.

---

## 1. Perubahan yang Dilakukan

1. **Floating Island Capsule Pill di [CurvedSidebar.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx)**:
   - Mempertahankan dock vertikal desktop (`hidden lg:flex`).
   - Menambahkan `<nav aria-label="Navigasi Bawah Seluler" data-purpose="merchant-mobile-pill-nav">` khusus layar `< 1024px` (`lg:hidden`) melayang di tengah bawah dengan jarak aman `env(safe-area-inset-bottom)`.
   - Menampilkan 5 navigasi utama: **Dashboard** (`/kelola-usaha`), **Kelola** (`merchantNavigation.manage_url`), **Review** (`/kelola-usaha/laporan` + dot notifikasi jika `pending_reports > 0`), **Akun** (`/akun`), dan **Publik** (`/`).
   - **Perilaku Visual**:
     - Tab **tidak aktif**: lingkaran krem hangat (`#f5ece3`) berisi ikon saja agar tetap ringkas pada layar sempit (`<= 370px`).
     - Tab **aktif**: kapsul terakota (`bg-terracotta`) yang melebar dengan bulatan ikon putih di kiri dan label teks putih tebal di sebelah kanan.

2. **Pembersihan Bottom Bar Lama di [MerchantLayout.tsx](file:///D:/NEARASA/resources/js/layouts/MerchantLayout.tsx)**:
   - Menghapus bar navigasi bawah kotak datar lama karena navigasi mobile kini terpusat di `CurvedSidebar`.
   - Menyesuaikan padding bawah halaman pada layar seluler (`pb-24 lg:pb-6`) dan lebar penuh konten (`w-full`) agar footer dan panel tidak tertutup floating pill nav.

3. **Penyesuaian Header & Ruang Aman di [Dashboard.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx) & [TopNav.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx)**:
   - Memberi ruang aman bawah `pb-24 lg:pb-6` serta `w-full` pada `main` di `Dashboard.tsx`.
   - Merapikan ukuran logo, tombol lonceng notifikasi, dan pil akun pada `TopNav.tsx` di layar sempit, serta menampilkan input pencarian responsif (`sm:hidden`) khusus di halaman Dashboard saat `onSearchChange` tersedia.

4. **Pembaruan Info Modul**:
   - Memperbarui [resources/js/components/merchant/dashboard/info.md](file:///D:/NEARASA/resources/js/components/merchant/dashboard/info.md).

---

## 2. File yang Terdampak

1. [`resources/js/components/merchant/dashboard/CurvedSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx)
2. [`resources/js/layouts/MerchantLayout.tsx`](file:///D:/NEARASA/resources/js/layouts/MerchantLayout.tsx)
3. [`resources/js/pages/Merchant/Dashboard.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx)
4. [`resources/js/components/merchant/dashboard/TopNav.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx)
5. [`resources/js/components/merchant/dashboard/info.md`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/info.md)
6. [`dokumentasi/H28/info.md`](file:///D:/NEARASA/dokumentasi/H28/info.md)

---

## 3. Hasil Pengujian

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (exit code 0).
- **PHPUnit Merchant Tests (`php artisan test --filter=Merchant`)**: 39 tests, 39 passed, 560 assertions.
