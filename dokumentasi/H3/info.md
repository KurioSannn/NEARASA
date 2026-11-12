# H3 - Dokumentasi Eksekusi TECH 3: Layout Flush Browser & Kontras Visual

## 1. Konteks & Tujuan
Menghilangkan bingkai mengambang melayang (*floating card frame*) dengan `rounded-[36px]` dan `shadow-2xl` di luar, sehingga seluruh antarmuka Dashboard pemilik menempel alami pada jendela peramban (*flush to browser viewport*).

## 2. File yang Diperbarui
1. [`resources/js/pages/Merchant/Dashboard.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Dashboard.tsx)
   - Menghilangkan pembungkus ganda `bg-[#f5ede4] p-8 rounded-[36px] shadow-2xl`.
   - Mengganti menjadi kanvas penuh `min-h-screen bg-sand-surface text-clay-800` dengan container `max-w-[1600px] mx-auto` yang menempel di tepi atas layar tanpa border tebal luar.
2. [`resources/js/components/merchant/dashboard/SummaryCards.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/SummaryCards.tsx)
   - Memastikan kartu pertama ("Usaha Terkelola") menggunakan kelas `dash-summary-primary` dengan gradasi terakota pekat `#b74b28` ke `#963412` agar angka dan teks putih terlihat jelas dan kontras tinggi.
3. [`resources/js/components/merchant/dashboard/InteractionChart.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx)
   - Memperbaiki tinggi minimum pilar metrik saat data 0 (`26px`) dengan warna pilar lembut `bg-terracotta-200/50`, sehingga pilar tetap terlihat elegan dan berkarakter meski belum ada interaksi tercatat.
4. [`resources/css/merchant-dashboard.css`](file:///D:/NEARASA/resources/css/merchant-dashboard.css)
   - Menambahkan deklarasi `.dash-summary-primary` untuk memastikan gradasi aktif di peramban.

## 3. Hasil Pengujian & Verifikasi
- `npm run typecheck`: Passed (0 errors).
- `npm run test:discovery`: Passed (4 tests).
- `npm run test:consumer`: Passed (5 tests).
- `php vendor/phpunit/phpunit/phpunit`: Passed (8 tests, 189 assertions).
- `git add`: Seluruh perubahan di-staging tanpa commit dan tanpa push sesuai aturan AGENTS.md.
