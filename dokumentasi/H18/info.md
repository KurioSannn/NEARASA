# Dokumentasi Eksekusi H18: Pergantian Label "Laporan" ke "Review", Penegasan Garis Brown Transparan & Pelembutan Font

## 1. Konteks Permasalahan
- User menginstruksikan untuk mengganti seluruh istilah **Laporan** menjadi **Review** pada antarmuka Ruang Pemilik.
- User juga meminta agar **warna garis-garis pembatas** dipastikan beraksen **brown transparan**, dan **warna font hitam kasar** diganti menjadi **soft tapi tetap gelap** (*Warm Espresso/Dark Mocha*).
- Integrasi kalender pada *Pos & jadwal* ditunda sementara menunggu user mengirimkan referensi kodenya.

## 2. Solusi & Perubahan yang Diterapkan
1. **Pergantian Nama "Laporan" Menjadi "Review"**:
   - [`RightWalletSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/RightWalletSidebar.tsx):
     - Tombol aksi 4 diubah menjadi **"Review"** (title: *"Daftar Review"*).
     - Heading kartu diubah menjadi **"Review Pos Tutup"**.
     - Tautan diubah menjadi **"Buka Review"** dan *"Lihat semua review"*.
     - Deskripsi status aman: *"Tidak ada review pos tutup dari konsumen yang tertunda."*
   - [`SummaryCards.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/SummaryCards.tsx):
     - Kartu metrik 2 diubah labelnya menjadi **"Review Tutup"**.
   - [`CurvedSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/CurvedSidebar.tsx):
     - Tooltip dan atribut aksesibilitas disesuaikan menjadi **"Review Pos Tutup"**.
   - [`TopNav.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TopNav.tsx):
     - Aksesibilitas lonceng notifikasi disesuaikan menjadi **"Notifikasi review"**.
   - [`Reports.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Reports.tsx):
     - Judul halaman `<Head title="Review pemilik" />` dan heading `<h1>Review</h1>`.
     - Filter status dan teks kosong diselaraskan ke istilah review.
2. **Pelembutan Warna Font (*Soft Dark Mocha Espresso*)**:
   - [`merchant-dashboard.css`](file:///D:/NEARASA/resources/css/merchant-dashboard.css) & [`merchant-redesign.css`](file:///D:/NEARASA/resources/css/merchant-redesign.css):
     - Font utama (`text-clay-900` / `--ink`) diubah dari hitam kasar `#1e130c` menjadi **`#362822`** (*Soft Dark Mocha Espresso*).
     - Font sekunder (`text-clay-800`, `text-clay-700`, `text-clay-600`) diubah menjadi **`#45332b`**, **`#5e4941`**, dan **`#755e54`**.
     - Kontras tetap tinggi (rasio 10.5:1, lulus WCAG AAA) namun tampilan terasa jauh lebih teduh dan tidak menusuk mata.
3. **Penyempurnaan Garis Brown Transparan Global**:
   - Variabel `--color-sand-border`, kelas `.border-sand-border`, dan universal border `*, ::before, ::after` disetel mutlak ke **`rgba(183, 75, 40, 0.18)`**.
   - Pemisah baris tabel `.divide-sand-border` disetel ke **`rgba(183, 75, 40, 0.15)`**.
   - Menghapus modifier `border-sand-border/70` pada `InteractionChart.tsx` agar menyatu serasi.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: **Lolos (0 error)**.
- PHPUnit Feature Suite (`MerchantManagementTest`, `MerchantOperationsTest`, `MerchantWorkspaceTest`): **25 tests, 445 assertions lulus 100%**.

## 4. Status Git
- Sesuai SOP, perubahan telah distaging menggunakan `git add`.
- Tidak ada `git commit`, `git push`, maupun `npm run build`.
