# Dokumentasi H29 - Perbaikan Tampilan Mobile Kelola Usaha, Kalender Kompak & Sembunyikan Footer Mobile

Dokumentasi ini mencatat perbaikan tampilan mode seluler/HP di halaman Kelola Usaha dan Dashboard Merchant berdasarkan 3 temuan visual: penghapusan footer di mode mobile, perataan tengah elemen header/kartu/tab, perbaikan thumbnail fallback usaha baru, serta penyesuaian ukuran kalender penjadwalan agar proporsional di layar kecil.

---

## 1. Perubahan yang Dilakukan

1. **Sembunyikan Footer di Mode Mobile ([Footer.tsx](file:///D:/NEARASA/resources/js/components/merchant/dashboard/Footer.tsx))**:
   - Menambahkan class `!hidden lg:!flex` pada `<footer className="site-footer ...">` untuk meng-override aturan `display: flex` bawaan `.site-footer` di layar kecil (`app.css`), sehingga footer hanya tampil pada desktop (`>= 1024px`) dan tidak menumpuk di atas navigasi melayang seluler.

2. **Perataan Tengah (Center) Kelola Usaha & Operasional ([BusinessEdit.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx) & [DailyOperations.tsx](file:///D:/NEARASA/resources/js/components/merchant/DailyOperations.tsx))**:
   - Meratakan tengah judul halaman **Kelola Usaha**, kartu konteks **Usaha yang Dikelola**, status aktif, tombol **Lihat Publik**, dan posisi dropdown usaha pada layar kecil (`items-center text-center sm:items-start sm:text-left`).
   - Mengubah pill tab navigasi (*Operasional*, *Menu & harga*, *Pos & jadwal*, *Profil usaha*, *Foto & kabar*) serta sub-tab di profil/media agar terpusat dan membungkus rapi (`justify-center flex-wrap`) pada mode seluler tanpa terpotong di tepi layar.
   - Meratakan tengah kartu **Lokasi jualan yang diatur** (`DailyOperations.tsx`) beserta dropdown pemilih pos dan alamat lokasi pada mode HP.

3. **Perbaikan Fallback Gambar Usaha Baru ([business-images.ts](file:///D:/NEARASA/resources/js/types/business-images.ts) & [MerchantRegisterController.php](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php))**:
   - Mengubah fallback default foto usaha dari path yang tidak ada (`/images/demo/resto-1.jpg`) menjadi `/images/demo/rice.jpg`, sekaligus melindungi usaha yang sudah tersimpan sebelumnya melalui pengecekan di `businessCover()`.

4. **Kalender Penjadwalan Kompak Mode Mobile ([PostScheduleCalendar.tsx](file:///D:/NEARASA/resources/js/components/merchant/calendar/PostScheduleCalendar.tsx))**:
   - Mengubah sel kalender menjadi kotak kompak (`aspect-square sm:aspect-auto sm:h-24 p-1 sm:p-2 rounded-xl sm:rounded-2xl`) pada layar `< 640px`.
   - Menyembunyikan teks panjang jam/pos & badge teks *Hari Ini* pada layar HP (digantikan indikator titik status berwarna di bawah angka tanggal) agar tidak lagi terpotong menjadi `0...`, `G...`, atau `H... IN...`.
   - Meratakan tengah header kalender, pengalih bulan, filter pos, serta pil legenda di layar seluler.

5. **Pembaruan Info Modul**:
   - Memperbarui [resources/js/components/merchant/calendar/info.md](file:///D:/NEARASA/resources/js/components/merchant/calendar/info.md).

---

## 2. File yang Terdampak

1. [`resources/js/components/merchant/dashboard/Footer.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/Footer.tsx)
2. [`resources/js/types/business-images.ts`](file:///D:/NEARASA/resources/js/types/business-images.ts)
3. [`app/Http/Controllers/MerchantRegisterController.php`](file:///D:/NEARASA/app/Http/Controllers/MerchantRegisterController.php)
4. [`resources/js/pages/Merchant/BusinessEdit.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx)
5. [`resources/js/components/merchant/DailyOperations.tsx`](file:///D:/NEARASA/resources/js/components/merchant/DailyOperations.tsx)
6. [`resources/js/components/merchant/calendar/PostScheduleCalendar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/calendar/PostScheduleCalendar.tsx)
7. [`resources/js/components/merchant/calendar/info.md`](file:///D:/NEARASA/resources/js/components/merchant/calendar/info.md)
8. [`dokumentasi/H29/info.md`](file:///D:/NEARASA/dokumentasi/H29/info.md)

---

## 3. Hasil Verifikasi

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (exit code 0).
- **PHPUnit Merchant Tests (`php artisan test --filter=Merchant`)**: 39 tests, 39 passed, 560 assertions.
