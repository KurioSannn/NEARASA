# Dokumentasi H24 - Perapian Grafik Interaksi Dashboard Merchant (InteractionChart)

Dokumentasi ini mencatat perbaikan visual dan struktural pada kartu grafik **"Interaksi di NEARASA"** di Dashboard Merchant (`/kelola-usaha/`).

---

## 1. Masalah yang Diperbaiki

1. **Gumpalan/Pill Melayang Saat Nilai 0**:
   - Sebelumnya, baris kode grafik memaksakan tinggi bar minimal 26px meskipun nilai interaksi adalah 0 (`count === 0 ? 26 : ...`). Hal ini menghasilkan 4 kapsul lonjong merah muda tebal yang melayang dan tampak rusak/canggung di atas garis 0.
   - **Solusi**: Jika `count === 0`, tinggi bar kini hanya berupa tick tumpuan tipis 3px (`h-[3px]`, `rounded-full`, `bg-sand-border/80`). Jika `count > 0`, bar tumbuh ke atas secara proporsional dengan puncak melengkung `rounded-t-2xl` dan gradasi hangat terakota NEARASA.

2. **Presisi Penempatan Baseline 0**:
   - Menggunakan kontainer grid tetap setinggi 150px dengan garis baseline padat (`border-solid`) di posisi paling bawah (`bottom: 0`).
   - Kontainer bar diletakkan langsung di atas baseline dengan `items-end`, sehingga seluruh bar menempel tepat di garis 0 secara matematis tanpa pergeseran vertikal.

3. **Status Kosong (Empty State) yang Jelas & Rapi**:
   - Ketika total interaksi 7 hari bernilai 0 (`isEmpty`), grafik menampilkan badge penjelas di bagian tengah:
     `"Belum ada aktivitas dalam 7 hari terakhir"`.

4. **Keterbacaan Label dan Angka Kategori**:
   - Di bawah setiap kategori (Profil, Menu, Peta, WhatsApp), ditambahkan angka interaksi (`0` atau jumlah nilai) langsung di bawah label, sehingga pemilik usaha dapat langsung melihat statistik tanpa harus melakukan hover mouse.

---

## 2. File yang Dimodifikasi

- [`resources/js/components/merchant/dashboard/InteractionChart.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/InteractionChart.tsx):
  - Memperbaiki perhitungan tinggi bar saat 0 vs > 0.
  - Merapikan struktur grid dan penempatan absolut bar.
  - Menambahkan empty state banner elegan saat 0 interaksi.
  - Menampilkan angka di bawah label kategori.

---

## 3. Hasil Pengujian

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (0 error).
- **Node Profile Tests (`npm run test:profile`)**: 3/3 tes lulus (100%).
