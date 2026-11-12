# Dokumentasi Eksekusi H21: Pembersihan Dropdown Biru OS & Perapian Modal + Scrollbar Kustom

Dokumentasi ini mencatat hasil pengerjaan refaktor UI/UX pada Ruang Pemilik NEARASA:
1. Menghilangkan seluruh sisa dropdown native browser yang ber-hover biru default OS (`#0078d7`), menggantinya dengan **Custom Dropdown Popover** bertema warm terracotta di:
   - Pemilihan "USAHA YANG DIKELOLA" ([BusinessEdit.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/BusinessEdit.tsx)).
   - Pemilihan "Lokasi jualan yang diatur" ([DailyOperations.tsx](file:///D:/NEARASA/resources/js/components/merchant/DailyOperations.tsx)).
   - Seluruh `SelectField` di dalam modal edit ([ProfileFields.tsx](file:///D:/NEARASA/resources/js/components/merchant/ProfileFields.tsx)).
2. Kustomisasi **Slim Terracotta Scrollbar** pada modal dialog (`.dialog`), backdrop blur espresso, perapian sticky header bergaris pembatas, dan footer modal.

---

## 1. Perubahan Teknis & File yang Dimodifikasi

### A. Kustomisasi Scrollbar Modal & Tampilan Dialog
- **File**: `resources/css/app.css` & `resources/css/merchant-dashboard.css`
- **Perubahan**:
  - Menerapkan custom scrollbar ramping 6px pada `.dialog`:
    - Thumb scrollbar berwarna krem lembut `#decbc0` dengan hover terracotta `#b74b28`.
    - Track scrollbar transparan tanpa kotak abu-abu kaku default OS.
  - Memperbarui sudut modal menjadi melengkung mewah `border-radius: 28px` dengan border `rgba(183, 75, 40, 0.22)` dan bayangan lembut `0 25px 70px -12px rgba(60, 25, 15, 0.25)`.
  - Backdrop blur modal ditingkatkan ke `background: rgba(32, 19, 13, 0.45); backdrop-filter: blur(8px)`.
  - Header modal (`.dialog-heading`) diberi sticky background blur dan garis pembatas bawah `border-b border-sand-border pb-3 mb-4`.
  - Footer modal (`.dialog-footer`, `.profile-save-area`) diberi garis pembatas atas `border-t border-sand-border pt-4 mt-4`.

### B. Custom Dropdown "USAHA YANG DIKELOLA" (Bebas dari Default OS Blue)
- **File**: `resources/js/pages/Merchant/BusinessEdit.tsx`
- **Perubahan**:
  - Mengganti native `<select id="owner-business-select">` dengan custom popover dropdown.
  - Trigger button `rounded-xl border border-sand-border hover:border-terracotta-300 hover:bg-[#fdeee9]` dengan panah chevron berotasi 180° saat terbuka.
  - Item menu dengan hover soft terracotta `hover:bg-[#fdeee9] hover:text-terracotta` dan centang `Check` terracotta pada usaha aktif.

### C. Custom Dropdown "Lokasi Jualan yang Diatur"
- **File**: `resources/js/components/merchant/DailyOperations.tsx`
- **Perubahan**:
  - Mengganti native `<select id="owner-post-select">` dengan custom popover dropdown seragam.
  - Menampilkan nama dan alamat pos dengan hover hangat dan centang pada pos yang sedang aktif.

### D. Custom Dropdown untuk Seluruh Form Modal (`SelectField`)
- **File**: `resources/js/components/merchant/ProfileFields.tsx`
- **Perubahan**:
  - Mentransformasi `SelectField` menjadi custom dropdown popover.
  - Menghilangkan warna biru default OS di seluruh pilihan form:
    - Status operasional pos (Beroperasi / Tutup sementara / Tutup permanen).
    - Pilihan hari jadwal rutin (Senin - Minggu).
    - Bentuk tempat jualan (Warung / Ruko / Rombong / Mobil / Lainnya).
    - Jenis foto galeri & jenis kabar usaha.
    - Jenis menu & kategori menu.

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
