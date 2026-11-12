# components/merchant/dashboard

Modul komponen antarmuka Dashboard Pemilik (`pages/Merchant/Dashboard.tsx`, rute `/kelola-usaha`), didesain ulang penuh (remake) mengadopsi estetika terakota modern, layout 3-kolom melengkung (`rounded-[36px]`), dan data riil tanpa mock/dummy hardcode.

## Daftar Komponen:
| File | Deskripsi & Fungsi |
| :--- | :--- |
| `TopNav.tsx` | Bar navigasi atas dengan badge logo heksagonal (`fill="#ffdbd0"`), pill navigation switcher, pencarian interaktif `⌘K`, notifikasi laporan, dan pill profil pemilik. |
| `CurvedSidebar.tsx` | Dock ikon vertikal melengkung `w-16 rounded-3xl` dengan tautan cepat ke Beranda, Interaksi, Dashboard, Kelola Usaha, Laporan, Pengaturan, dan Keluar. |
| `BusinessWatchlist.tsx` | Kartu daftar usaha kuliner milik pemilik (kolom 4) dengan foto cover, jenis usaha, jumlah menu, dan pos aktif. |
| `InteractionChart.tsx` | Grafik batang pilar interaktif (kolom 8) dengan garis grid putus-putus (*dashed lines*), tooltip angka riil, dan highlight terakota pada pilar tertinggi. |
| `SummaryCards.tsx` | 4 kartu ringkasan metrik operasional (Usaha Terkelola, Laporan Tutup, Pos Jualan, dan Pos Buka Saat Ini). |
| `TodayPostsTable.tsx` | Tabel riwayat pos jualan hari ini dengan status operasional, jam WIB, dan tombol aksi kelola pos. |
| `RightWalletSidebar.tsx` | Sidebar kanan (`w-80` / `w-96`) dengan stacked gradient card (`fintech-card-gradient`), 4 tombol aksi cepat melingkar, progress bar kesiapan pos, dan highlight laporan tutup. |

Gaya CSS terisolasi di `resources/css/merchant-dashboard.css`.
