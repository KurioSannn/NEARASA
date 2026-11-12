# Dokumentasi Eksekusi H20: Custom Dropdown & Transformasi Seluruh Aksi Menjadi Modal Dialog

Dokumentasi ini mencatat hasil pengerjaan refaktor UI/UX pada Ruang Pemilik NEARASA:
1. Menghilangkan dropdown native browser dengan warna biru default OS (`#0078d7`), digantikan oleh **Custom Popover Dropdown** bertema hangat NEARASA.
2. Mengubah 5 aksi manajemen pos dan menu dari format **Inline Expander / Accordion** menjadi **Modal Dialog Melayang (Overlay Popup)** yang fokus, elegan, dan anti-*layout shift*.

---

## 1. Perubahan Teknis & File yang Dimodifikasi

### A. Custom Dropdown Popover (Bebas dari Default OS Blue)
- **File**: `resources/js/components/merchant/calendar/PostScheduleCalendar.tsx`
- **Perubahan**:
  - Mengganti elemen native HTML `<select id="calendar-modal-pos">` dengan custom select popover.
  - **Trigger Button**: Kotak `rounded-2xl` dengan icon `Store`, teks nama & alamat pos, dan icon `ChevronDown` yang berputar 180° mulus saat terbuka.
  - **Floating Menu**: Absolute popover `bg-white border border-sand-border rounded-2xl shadow-xl p-1.5 z-50`.
  - **Hover & Selection**:
    - Item non-aktif memiliki hover lembut `hover:bg-[#fdeee9] hover:text-terracotta transition-colors`.
    - Item aktif berlatar `bg-terracotta-50 text-terracotta font-extrabold border-terracotta-200` dengan icon `Check` terracotta.
    - Dilengkapi penutup otomatis saat mengklik di luar (*outside-click detection*).
  - Meningkatkan kartu pilihan status jadwal (Jadwal Rutin, Jam Khusus, Tutup Sementara) dengan border aktif terracotta/amber dan hover `hover:border-terracotta-200`.

### B. Transformasi Tambah & Edit Menu Menjadi Modal Dialog
- **File**: `resources/js/components/merchant/MenuSection.tsx`
- **Perubahan**:
  - Mengubah `MenuEditor` dari pembungkus `InlineEditor` menjadi `EditorDialog` ([ProfileDialogs.tsx](file:///D:/NEARASA/resources/js/components/merchant/ProfileDialogs.tsx)).
  - Modal overlay melayang di tengah layar dengan judul dinamis: *"Tambah menu"* atau *"Edit menu: {nama_menu}"*.
  - Menghilangkan pergeseran layout pada daftar menu: baris item menu kini tetap rapi dan tidak memanjang ke bawah saat diedit.

### C. Transformasi Tambah Pos, Edit Lokasi, Atur Jadwal, & Edit Layanan Menjadi Modal
- **File**:
  - `resources/js/components/merchant/PostEditor.tsx`
  - `resources/js/components/merchant/PostsSection.tsx`
- **Perubahan**:
  - Mengubah `PostEditor` menjadi `EditorDialog` dengan prop `wide={true}`.
  - Mode yang ditransformasikan:
    1. **Tambah pos jualan** (`new`): Wizard 3 tahap (Lokasi -> Jadwal -> Layanan) tampil terpusat dalam modal lebar.
    2. **Edit lokasi pos** (`location`): Input alamat, patokan, tombol GPS, dan peta Leaflet tampil di modal lebar yang nyaman dijelajahi.
    3. **Atur jadwal pos** (`hours`): Pengaturan status operasional dan daftar sesi jam buka/tutup per hari berada dalam modal dialog terfokus.
    4. **Edit layanan & fasilitas** (`services`): Checklist layanan, fasilitas, metode pembayaran, dan area layanan berada dalam modal terfokus.
  - Di `PostsSection.tsx`, pemanggilan modal dipusatkan di root komponen (`{editor && renderEditor()}`) sehingga kartu-kartu pos pada daftar utama tidak lagi membengkak atau bergeser secara inline.
  - Menambahkan aksi `Hapus` langsung pada kartu pos jika pemilik memiliki lebih dari satu pos.

---

## 2. Hasil Verifikasi
1. **TypeScript Typecheck (`tsc --noEmit`)**:
   - Status: **PASSED (Exit code 0)**, 0 errors.
2. **Frontend Test Suite (`npm run test:profile`)**:
   - Status: **PASSED (3/3 tests pass)**.
3. **PHPUnit Feature Tests**:
   - Status: **PASSED (25 tests, 445 assertions pass)**.

---

## 3. Kepatuhan Aturan Repositori (AGENTS.md)
- Perubahan dilakukan setelah perintah tegas **"GAS"** dari user.
- **TIDAK** menjalankan `git commit` maupun `git push`.
- **TIDAK** menjalankan `npm run build`.
- File perubahan dimasukkan ke Git Staging (`git add`).
