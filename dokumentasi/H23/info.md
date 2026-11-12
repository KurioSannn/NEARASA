# Dokumentasi H23 - Penyelarasan Dropdown, Hover, Background, dan Scrollbar Modal Dashboard Merchant

Dokumentasi ini mencatat penyelesaian perbaikan mendalam untuk seluruh modal dan elemen interaktif di Dashboard Merchant (`/kelola-usaha/`), mengatasi warna hover biru default OS Windows, scrollbar yang menyembul di sudut modal, belang warna footer modal, dan standardisasi tema terakota NEARASA.

---

## 1. Masalah yang Diselesaikan

1. **Hilangnya Hover Biru Native OS pada Filter Review Usaha**:
   - Filter "Semua usaha" di [Reports.tsx](file:///D:/NEARASA/resources/js/pages/Merchant/Reports.tsx) sebelumnya menggunakan elemen native HTML `<select>`, yang memicu menu combobox Windows dengan sorotan biru native (`#0078d7`).
   - Diganti dengan custom popover dropdown berikon `<Store />`, checkmark aktif, backdrop penutup di luar area, dan hover warm terakota (`hover:bg-[#fdeee9]`, `hover:text-[#b74b28]`).

2. **Perbaikan Panah Scrollbar Menusuk Sudut Lengkung Modal (Border Radius 28px)**:
   - Sebelumnya pada beberapa browser, User-Agent stylesheet memunculkan scrollbar native langsung pada root container `<dialog>` sehingga panah scrollbar menyembul di sudut kanan atas header modal (tampak pada modal "Tambah menu").
   - Diterapkan `overflow: hidden !important;` pada `dialog.dialog` dan `.dialog-content`, serta penekanan khusus `::-webkit-scrollbar { display: none !important; width: 0 !important; }`.
   - Scrollbar ramping 6px (`#decbc0` thumb, `#b74b28` hover) diisolasi 100% hanya di dalam `.dialog-body`.

3. **Penyelarasan Warna Asli Modal (Menghilangkan Footer Belang Kuning/Krem)**:
   - `.dialog .profile-save-area`, `.dialog .profile-step-footer`, dan `.dialog-footer` di [merchant-profile.css](file:///D:/NEARASA/resources/css/merchant-profile.css), [app.css](file:///D:/NEARASA/resources/css/app.css), dan [merchant-dashboard.css](file:///D:/NEARASA/resources/css/merchant-dashboard.css) sebelumnya memiliki `background: var(--paper)` (`#fff8f0` krem kekuningan).
   - Diubah menjadi `background: #fffdfa !important;` (atau `transparent`), menyatu sempurna dengan warna asli kanvas modal tanpa ada garis pita belang.

4. **Standardisasi State Hover Tombol Sekunder & Kontrol Modal**:
   - Tombol `.profile-secondary` (seperti tombol "Batal", "Kembali", dan "Lanjut mengedit") serta `.owner-button-secondary` sebelumnya memiliki efek hover default abu-abu kusam (`var(--soft)`).
   - Distandarisasi dengan hover khas NEARASA:
     - `background: #fdeee9 !important;`
     - `color: #b74b28 !important;`
     - `border-color: rgba(183, 75, 40, 0.35) !important;`
   - Tombol tahapan wizard `.profile-editor-steps > button:hover:not([aria-current])` juga diselaraskan dengan hover terakota senada.

---

## 2. File yang Dimodifikasi

1. [`resources/js/pages/Merchant/Reports.tsx`](file:///D:/NEARASA/resources/js/pages/Merchant/Reports.tsx):
   - Mengganti native `<select>` dengan custom popover dropdown usaha.
2. [`resources/css/merchant-dashboard.css`](file:///D:/NEARASA/resources/css/merchant-dashboard.css):
   - Menambahkan aturan supresi scrollbar pada root dialog & `.dialog-content`.
   - Menetapkan `background: #fffdfa !important;` untuk semua varian footer modal (`.dialog-footer`, `.profile-save-area`, `.profile-step-footer`, `.owner-editor-footer`).
   - Menambahkan gaya hover terakota untuk `.profile-secondary`, `.owner-button-secondary`, dan `.profile-editor-steps > button`.
3. [`resources/css/merchant-profile.css`](file:///D:/NEARASA/resources/css/merchant-profile.css):
   - Memperbarui `.profile-secondary:hover` ke warm terakota.
   - Mengubah background footer `.dialog .profile-save-area, .dialog .profile-step-footer` menjadi `#fffdfa` menyatu.
4. [`resources/css/merchant-redesign.css`](file:///D:/NEARASA/resources/css/merchant-redesign.css):
   - Memperbarui `.owner-button-secondary:hover` ke warm terakota.
5. [`resources/css/app.css`](file:///D:/NEARASA/resources/css/app.css):
   - Memastikan `overflow: hidden !important;` pada `.dialog` dan `.dialog-content`.
   - Mengubah background `.dialog-footer` dari `var(--paper)` ke `#fffdfa`.

---

## 3. Hasil Pengujian & Verifikasi

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (0 error).
- **Frontend Hours & Status Test (`npm run test:profile`)**: 3/3 tes lulus (100%).
- **PHPUnit Feature Tests**: 25 tests, 445 assertions lulus (100%).
