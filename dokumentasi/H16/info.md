# Dokumentasi Eksekusi H16: Penghapusan TopNav Menyeluruh & Pewarnaan Garis Brown Transparan

## 1. Konteks Permasalahan
- User menginstruksikan untuk **menghapus bilah navigasi atas (TopNav)** secara menyeluruh dari halaman Dashboard maupun layout Ruang Pemilik.
- User juga meminta agar **warna seluruh garis pembatas (border lines, table dividers, card boundaries, footer line)** dijadikan warna **brown yang agak transparan**.

## 2. Solusi & Perubahan yang Diterapkan
1. **Penghapusan TopNav Menyeluruh**:
   - [`Dashboard.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx):
     - Menghapus komponen `<TopNav />` dan impor terkait.
     - Menyesuaikan padding atas kontainer menjadi `pt-6 sm:pt-8 pb-6` sehingga tampilan memiliki margin atas yang rapi.
     - Memindahkan input pencarian pos/usaha ke samping tombol `+ Kelola usaha` di baris sapaan (*hero controls*).
   - [`MerchantLayout.tsx`](file:///D:/NEARASA/resources/js/layouts/MerchantLayout.tsx):
     - Menghapus komponen `<TopNav />` dan impor terkait.
     - Menyesuaikan padding atas kontainer menjadi `pt-6 sm:pt-8 pb-6`.
   - [`CurvedSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx):
     - Menambahkan ikon logo NEARASA di puncak dock sidebar sebagai identitas brand.
     - Menyesuaikan posisi sticky dock menjadi `sticky top-6 lg:top-8 z-20` agar mengambang tepat di area atas layar saat pengguna scroll ke bawah.
2. **Pewarnaan Garis Menjadi Brown Transparan**:
   - [`merchant-dashboard.css`](file:///D:/NEARASA/resources/css/merchant-dashboard.css):
     - Mengubah `--color-sand-border` dan kelas `.border-sand-border` menjadi `rgba(183, 75, 40, 0.15)` (*warm semi-transparent terracotta brown*).
     - Menyetel pemisah baris tabel `.divide-sand-border` menjadi `rgba(183, 75, 40, 0.12)`.
   - [`merchant-redesign.css`](file:///D:/NEARASA/resources/css/merchant-redesign.css):
     - Mengubah `--line` menjadi `rgba(183, 75, 40, 0.15)`.
   - Seluruh kartu, pembatas tabel, garis putus-putus grafik interaksi, dan garis footer kini tampil konsisten dengan garis brown transparan yang halus dan mewah.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
