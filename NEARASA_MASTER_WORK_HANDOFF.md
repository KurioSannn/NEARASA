# NEARASA — MASTER WORK HANDOFF

> **Dokumen sumber konteks untuk room Work | Versi rancangan 1.0 | 12 November 2026 | Bahasa Indonesia**
>
> **Status:** Audit konsep selesai; **bukan** laporan bahwa fitur Awards sudah selesai diimplementasikan. Dokumen ini menjadi sumber spesifikasi dan keputusan yang telah dibahas di room Strategy/Research. Work harus memverifikasi kondisi repository terbaru sebelum mengubah kode.
>
> **PERINTAH AWAL UNTUK WORK:** Baca dokumen **secara utuh**, mulai dari Bagian 0 hingga 18; buat ringkasan keputusan, konflik dan rencana eksekusi; inspeksi repository `KurioSannn/NEARASA` (termasuk branch eksperimen) **secara read-only terlebih dahulu**. Jangan langsung menggabungkan branch, mengganti data demo utama, atau menerapkan usulan yang statusnya belum disetujui. Laksanakan implementasi setelah arahan eksplisit dari pengguna di room Work.

---

## 0. PANDUAN BACA CEPAT (ADHD-FRIENDLY)

### 0.1. Satu layar: apa yang sedang dibangun?

**NEARASA** adalah prototipe web penemuan kuliner lokal, khususnya Sidoarjo dan Surabaya, yang membantu konsumen menemukan makanan melalui **jarak, jam operasional, lokasi pos jualan, menu, dan harga**, sekaligus membantu pemilik UMKM mengelola informasi satu usaha dengan banyak pos. Tim: **Firzan Syaroni, Cleo Firman Ferdinand, dan Gani Abi Saputra Van Sigu** (sesuai README repository). Proyek untuk **LOGICODIX 2026, kategori Web App Development, subtema UMKM/pemberdayaan ekonomi**.

**Fitur baru yang dirancang:** **NEARASA Awards**, yaitu penghargaan berbasis sinyal minat digital dengan periode **mingguan, bulanan, tahunan**, per wilayah, transparan, berbasis **data simulasi**, serta memberi *badge*, riwayat prestasi, dan sorotan promosi bagi UMKM tanpa menutup kesempatan usaha kecil untuk ditemukan.

**Arsitektur yang DISEPAKATI pengguna:** Laravel + SQLite **lokal** untuk pengembangan/tes/perhitungan; hasil diekspor sebagai **JSON snapshots**, lalu ditampilkan oleh **frontend React statis/interaktif di Vercel**. **Tidak membutuhkan data real-time, penyimpanan online, cron, scheduler, atau database persistensi di Vercel untuk demo.** Seluruh data kompetisi diberi label **SIMULASI**. **Jangan mengklaim demo statis sebagai layanan backend sungguhan.**

**Batas ruang kerja:** room asal ini hanya untuk *ide, riset, spesifikasi*. Koding, testing, deployment, dan pull request dilaksanakan **di room Work lain** ketika pengguna memintanya. Dokumen ini adalah *handoff*, bukan izin untuk otomatis mengubah repository.

### 0.2. Legenda status keputusan (jangan disamakan)

- **[SETUJU]** — pilihan yang secara eksplisit sudah disepakati pengguna dalam diskusi.
- **[REKOMENDASI MVP]** — rekomendasi paling matang saat ini; jadikan *default planning*, tetapi mintakan persetujuan singkat sebelum mengunci perilaku produk/algoritma.
- **[PARAMETER UJI]** — angka dan metode untuk eksperimen yang **belum tervalidasi secara empiris**; jangan disebut standar penelitian.
- **[P1/P2]** — setelah inti P0, boleh dipotong jika waktu sempit.
- **[FAKTA REPO]** — dibuktikan dari kode/README GitHub pada saat audit; verifikasi ulang sebelum mengerjakan.
- **[BELUM TERPUTUSKAN]** — memerlukan pilihan produk atau verifikasi lapangan; **jangan diam-diam mengarang keputusan**.

### 0.3. Sepuluh aturan yang tidak boleh hilang

1. **Jangan merusak alur konsumen/pemilik NEARASA yang sudah ada.**
2. **Satu UMKM (`business_id`) = satu peserta**, walaupun mempunyai banyak `selling_posts`.
3. **Mingguan, bulanan, tahunan = periode dan hasil terpisah**; bulanan bukan penjumlahan juara mingguan.
4. **Data simulasi terpisah** dari interaksi pengguna aplikasi; tidak menyamar sebagai metrik real.
5. **Calon formula terakhir** adalah *Hybrid Volume + Smoothed Engagement Rate*, bukan formula awal 35/25/20/20.
6. **Kualitas informasi = syarat kelayakan**, bukan bukti produk terlezat atau transaksi berhasil.
7. **Discovery/hasil pencarian utama ≠ Awards**: pemenang tidak otomatis mengalahkan relevansi lokasi/harga/jam.
8. **Vercel statis bukan Laravel hosting**: Inertia memerlukan server Laravel; perlu frontend mandiri/entry point terpisah.
9. **Riwayat pemenang dan score snapshots bisa dijelaskan dan diaudit**, dengan `formula_version` serta tanda simulasi.
10. **Tidak ada klaim dampak nyata** (konversi menjadi transaksi, kenaikan omzet, anti-fraud produksi) tanpa validasi.

---

## 1. TUJUAN PRODUK, MASALAH, DAN CAKUPAN

### 1.1. Kondisi masalah dari README [FAKTA REPO]

- Sejumlah warung hasil pengamatan dan percakapan informal tim sulit ditemukan secara daring.
- Konsumen tidak selalu tahu **di mana penjual berjualan saat itu**, **kapan membuka pos**, serta **menu dan harga**.
- Pemilik dapat mempunyai beberapa pos rutin dengan informasi operasional berbeda, tetapi tetap satu profil usaha.
- Katalog awal berisi profil, menu, dan koordinat **fiktif/demonstratif**, bukan verifikasi daftar UMKM dunia nyata.

**Proposisi NEARASA yang sudah ada:** "Temukan kuliner lokal sesuai jarak, jam, dan anggaran"; tagline README: *Good food is closer than you think.*

### 1.2. Masalah tambahan yang dijawab Awards [HIPOTESIS PRODUK]

- UMKM yang sudah populer lebih mudah memperoleh eksposur daripada UMKM kecil atau baru.
- Pemilik membutuhkan **pengakuan dan bahan promosi** yang mudah digunakan, tanpa harus menguasai desain grafis atau periklanan.
- Pengguna butuh kanal menemukan pilihan kuliner lokal yang beragam, bukan hanya yang sudah terkenal.
- Awards **bukan** pengganti sistem pencarian relevansi, bukti kualitas rasa, sistem transaksi, atau sertifikasi resmi.

### 1.3. Outcome yang diharapkan dan batas klaim

1. **Outcome demo:** juri dapat melihat contoh proses event → validasi/deduplikasi → ranking → skor transparan → badge/spotlight → riwayat.
2. **Outcome nilai produk:** narasi mengapa fitur *berpotensi* membantu pemilik memperoleh perhatian, mengelola reputasi digital, dan berbagi materi promosi.
3. **Bukan klaim faktual:** tidak ada bukti Awards NEARASA telah meningkatkan omzet, jumlah pembelian, loyalitas pelanggan, kunjungan fisik, atau distribusi eksposur pada komunitas nyata.

### 1.4. Definisi keberhasilan P0

Dalam demo statis, juri bisa: **membuka Awards**, mengubah **wilayah dan periode**, melihat **leaderboard sesuai data**, membuka **alasan skor**, melihat **profil/badge dan riwayat pemenang**, serta melihat **spotlight**. Semua tetap berfungsi setelah refresh/deep link, dengan tanda simulasi yang jelas.

---

## 2. KEPUTUSAN YANG SUDAH DISEPAKATI VS REKOMENDASI

| Keputusan / batasan | Status | Catatan implementasi |
|---|---|---|
| Fokus utama room strategi pada ide dan finalisasi spesifikasi, bukan perubahan kode | [SETUJU] | Work berada di room lain. |
| Laravel + SQLite lokal untuk uji dan data demo | [SETUJU] | Tidak perlu migrasi wajib ke PostgreSQL. |
| Frontend demo statis/interaktif di Vercel (Konsep A) | [SETUJU] | Adaptasi dari Inertia diperlukan. |
| Tidak perlu real-time, cron, database online/persisten | [SETUJU] | Ranking didapat dari ekspor snapshot. |
| Data fiktif dan label simulasi eksplisit | [SETUJU] | Termasuk poster, badge, dan contoh tahunan. |
| Awards mingguan, bulanan, tahunan | [SETUJU] | Ketiganya harus dapat dipilih. |
| Satu usaha multi-pos dihitung sebagai satu peserta | [SETUJU/aturan desain konsisten] | Gunakan `business_id`, bukan `selling_post_id` sebagai peserta. |
| Formula hybrid 60% volume + 40% rasio disesuaikan | [REKOMENDASI MVP; PARAMETER UJI] | **Belum disetujui sebagai bobot baku ilmiah.** |
| Views dan minat unik sebagai metrik inti; favorit/review dikeluarkan dari formula utama v1 | [REKOMENDASI MVP] | Untuk menjaga data yang dapat diaudit; favorit tetap fitur lama. |
| Kualitas profil sebagai eligibility gate | [REKOMENDASI MVP] | Tidak sama dengan "kualitas rasa". |
| UMKM Paling Diminati sebagai kategori utama | [REKOMENDASI MVP] | Nama jujur sesuai sinyal digital. |
| Bintang Baru sebagai kategori terpisah | [P1] | Usulan usia profil ≤60 hari, perlu dikalibrasi. |
| Naik Daun, voting Pilihan Warga | [P2/FUTURE] | Hindari scope creep, voting perlu anti-fraud. |
| Pemenang boleh menang berulang | [REKOMENDASI MVP] | Distribusi eksposur dikelola via discovery terpisah. |
| Awards tidak otomatis memodifikasi algoritma pencarian | [REKOMENDASI MVP] | Spotlight khusus, bukan invisible search boost. |
| Minimal tiga peserta layak untuk menerbitkan penghargaan tiga besar | [REKOMENDASI MVP; kebijakan demo] | Jika kurang, tampilkan status tidak cukup peserta. |
| Formulasi tahunan 70% rata-rata + 30% median skor bulanan | [PARAMETER UJI] | Bukan keharusan ilmiah; khusus 12 bulan sebanding lebih aman untuk MVP. |
| Weekly, Monthly, Annual Badge, Spotlight, arsip | [REKOMENDASI MVP] | Konten demo tetap diberi label simulasi. |
| Winner's Kit poster, caption, QR, sertifikat | [P1/P2] | Jangan menghambat P0. |

**Penting:** persetujuan pengguna untuk melanjutkan pembahasan ("oke gas") **tidak** sama dengan persetujuan eksplisit atas setiap bobot/angka yang sebelumnya diperkenalkan asisten.

---

## 3. AUDIT REPOSITORY YANG SUDAH DILAKUKAN (READ-ONLY SEBAGAI SUMBER SPESIFIKASI)

### 3.1. Identitas dan stack [FAKTA REPO]

- Repository GitHub **privat**: `https://github.com/KurioSannn/NEARASA`; default branch `main`.
- README menyebut kategori LOGICODIX 2026 Web App Development dan anggota tim di Bagian 0.
- Backend: `laravel/framework` `^13.17`, PHP `^8.4.1`, SQLite, Laravel session/validation.
- Frontend: React `^19.3.1`, TypeScript `^7.0.2`, Inertia React `^3.9.1`, Vite `^8.0.0`, Tailwind 4, Leaflet 1.9.4, Lucide.
- `resources/js/app.tsx` menggunakan `createInertiaApp`; `vite.config.ts` menggunakan `laravel-vite-plugin`. **Build aset saat ini bukan otomatis aplikasi SPA mandiri.**
- Route konsumen utama: `/`, `/jelajah`, `/peta`, `/usaha/{business:slug}`; pemilik `/kelola-usaha` dan pengaturan/halaman turunan; interaksi POST `/interaksi`.
- README menyatakan fitur katalog, peta, profil, menu/harga, operasional per pos, ulasan, favorit, riwayat, laporan tutup, dan dashboard statistik.

### 3.2. Kode spesifik yang perlu diaudit Work [FAKTA REPO]

| Jalur yang TERAMATI | Fungsi / temuannya |
|---|---|
| `app/Services/InteractionTracker.php` | Mencatat `profile_view`, `menu_open`, `map_click`, `whatsapp_click`. Pemilik login tidak menghitung kunjungan usahanya sendiri. Fingerprint berbasis pengguna/session, **pos**, dan tipe; dedup sekitar 30 menit. |
| `app/Http/Controllers/BusinessController.php` | Mencatat `profile_view` ketika halaman detail dimuat (kecuali prefetch), untuk pos terpilih. |
| `app/Http/Controllers/CommunityController.php` | Memvalidasi `menu_open`, `map_click`, `whatsapp_click`; kontak WhatsApp hanya valid jika nomor tersedia. |
| `app/Http/Controllers/FavoriteController.php` | Favorit disimpan via pivot `business_user` (`syncWithoutDetaching`/`detach`); bukan log peristiwa favorit yang lengkap sepanjang waktu. |
| `database/migrations/2026_10_22_000500_community_and_interactions.php` | Membuat `interaction_events` dengan ID usaha, ID pos, tipe, fingerprint, dedup key, timestamp. |
| `database/migrations/2026_10_21_000200_add_account_features.php` | Membuat pivot `business_user` dengan timestamps. |
| `database/seeders/CatalogSeeder.php` | `updateOrCreate` usaha **tetapi menghapus dan membuat ulang** menu serta pos; karena relasi cascade, bisa menghapus histori yang terhubung ke ID pos lama. **Jangan jalankan ulang sembarangan setelah mengisi event Awards.** |
| `database/seeders/data/catalog.php` | Delapan UMKM demo, daftar nama/slugs di Bagian 10. |
| `database/seeders/DatabaseSeeder.php` | Memanggil `CatalogSeeder`; belum memanggil seeder Awards. |
| `tests/Feature/CommunityFlowTest.php` | Sudah menguji deduplikasi 30 menit, pengecualian pemilik, validasi interaksi. Tidak setara dengan pengujian ranking Awards. |
| `resources/js/pages/Merchant/Dashboard.tsx` | Menampilkan statistik interaksi yang ada; jangan diasumsikan sudah mendukung ranking Awards. |
| `routes/web.php` | Belum terdapat route Awards pada audit. |

**Risiko data penting:** `InteractionTracker` asli mencatat per **pos** dan 30 menit, sedangkan formula baru memerlukan **identitas pengunjung unik lintas pos selama satu periode**. Kedua konsep deduplikasi ini berbeda, sehingga **jangan mengganti statistik lama secara diam-diam**. Bangun sumber simulasi terpisah dan agregasi tingkat usaha untuk Awards.

**Risiko privacy:** session ID/akun nyata tidak boleh ikut diekspor dalam JSON publik. Dataset dummy boleh memakai `visitor_key` sintetik; output akhir hanya agregat.

### 3.3. Status branch eksperimen yang TERVERIFIKASI pada 12 November 2026

Branch `feat/awards-demo-ranking-v1` **pernah dibuat di percakapan lama** dan saat verifikasi read-only memuat:

- **ADA**: `tests/Feature/AwardsDemoRankingTest.php` — empat test awal untuk dedup lintas pos, batas mingguan WIB, ranking deterministik, dan seeder idempoten.
- **ADA**: `database/migrations/2026_11_12_000100_create_award_demo_events.php` — tabel sintetik `award_demo_events` dengan business, post, `visitor_key`, type, UTC timestamp.
- **TIDAK DITEMUKAN**: `app/Services/Awards/RankingCalculator.php`.
- **TIDAK DITEMUKAN pada audit**: `database/seeders/AwardsDemoSeeder.php` (perlu konfirmasi ulang saat Work membaca branch).
- Test yang ada **belum dijalankan**; tidak ada bukti test pass atau deploy berhasil.
- Test awal dari branch merefleksikan **formula/aturan diskusi lama**, misalnya penghitung favorit masuk metrik; harus **direvisi terlebih dahulu** untuk desain hybrid terbaru (jangan mengira pengujian itu spesifikasi final).
- **Branch `main` tidak dimodifikasi oleh eksperimen ini dalam diskusi sebelumnya**; Work tetap harus memverifikasi perbandingan terbaru.

**Perintah Work:** inspeksi `main` vs `feat/awards-demo-ranking-v1`, tunjukkan diff dan kesesuaian dengan rancangan terbaru; **jangan merge/PR otomatis**. Lanjutkan di branch implementasi yang disepakati setelah konfirmasi pengguna.

### 3.4. Rujukan repository (URL privat, Work perlu akses GitHub)

- README: `https://github.com/KurioSannn/NEARASA/blob/main/README.md`
- Katalog demo: `https://github.com/KurioSannn/NEARASA/blob/main/database/seeders/data/catalog.php`
- InteractionTracker: `https://github.com/KurioSannn/NEARASA/blob/main/app/Services/InteractionTracker.php`
- Tests: `https://github.com/KurioSannn/NEARASA/blob/main/tests/Feature/CommunityFlowTest.php`
- Branch eksperimen: `https://github.com/KurioSannn/NEARASA/tree/feat/awards-demo-ranking-v1`

---

## 4. ARSITEKTUR DEMO YANG DISEPAKATI

```text
        LAPIS PENGEMBANGAN LOKAL (PHP tersedia)
┌───────────────────────────────────────────────────────┐
│ Laravel 13 + SQLite                                    │
│ Katalog demo + Awards fixture sintetik terpisah       │
│     -> Ranking Calculator                             │
│     -> Unit/Feature Tests                             │
│     -> Deterministic JSON Snapshot Exporter            │
└───────────────────────────┬───────────────────────────┘
                            │ build-time export JSON
                            ▼
                  /public/demo/awards/*.json
                            │
                            ▼
          LAPIS DEMO ONLINE (TANPA BACKEND PHP)
┌───────────────────────────────────────────────────────┐
│ React / Vite static SPA / opsi static MPA pada Vercel │
│ Awards, periode, wilayah, profil, badge, riwayat       │
│ Optional client-side what-if lab                       │
│ Status jelas: "Simulasi — data bukan aktivitas nyata"  │
└───────────────────────────────────────────────────────┘
```

### 4.1. Konsekuensi Vercel

- Vercel menyediakan hosting frontend statis/Vite, tetapi runtime PHP **bukan runtime resmi bawaan** dan fungsi memiliki filesystem **read-only** dengan `/tmp` sementara. SQLite lokal **tidak menjadi sumber persisten online** bila mengikuti Konsep A.
- `React + Inertia` mengandalkan halaman/properti dari Laravel. Untuk Vercel statis harus ada **frontend standalone** dengan entry point/build/routing sendiri (atau konversi target yang sama secara eksplisit). **Jangan hanya mengganti `build` tanpa memeriksa navigasi.**
- Work harus menguji **refresh dan deep link**; Vite SPA di Vercel biasanya membutuhkan rewrite ke `index.html` (lihat docs resmi).
- Hindari fetch ke localhost dan URL Laravel `POST/DELETE/PATCH` pada demo statis. Fitur simulasi tidak menulis database atau menyamar sebagai autentikasi nyata.
- Jangan menghilangkan seluruh fitur inti NEARASA secara diam-diam. Work harus menyatakan **cakupan navigasi demo online**: minimum Home → Awards → Profil → kembali; bila halaman Jelajah/Peta/Dashboard disertakan, semua tautan harus berjalan atau diberi penanda mode pratinjau yang jujur.
- Leaflet tiles tergantung ketersediaan sumber tile; daftar lokasi tetap bisa menjadi fallback.

### 4.2. Non-goals MVP

Bukan server Laravel yang hidup di Vercel; bukan sistem voting riil; bukan pendaftaran akun/UMKM persisten; bukan order/payment; bukan proof-of-sales; bukan anti-fraud produksi; bukan program sponsor/hadiah uang; bukan editor poster canggih; bukan ML recommender; bukan pemrosesan lokasi pribadi pengunjung pada snapshot.

---

## 5. DESAIN KOMPETISI DAN DEFINISI KELAYAKAN

### 5.1. Unit kompetisi dan wilayah

- **Peserta = bisnis/UMKM (`business_id`)**. Semua pos miliknya menyumbang event ke satu identitas usaha setelah dedup; tidak ada satu penghargaan per pos.
- Leaderboard kompetisi **dipisah per Sidoarjo dan Surabaya**. Suatu usaha hanya punya **satu wilayah kompetisi utama** pada satu periode.
- Data katalog saat ini tidak memiliki field `competition_region` yang terverifikasi. Untuk demo: **gunakan mapping fixture eksplisit per slug** (lihat Bagian 10), jangan hanya mem-parsing alamat bebas secara rapuh.
- Jika di masa depan satu usaha punya pos di dua kota, penetapan wilayah harus melalui kebijakan/atribut terverifikasi; **tidak dihitung dua kali di dua kota tanpa aturan yang disetujui**.

### 5.2. Eligibility Gate — syarat awal, bukan skor popularitas [REKOMENDASI MVP]

Agar berhak ikut kompetisi kategori utama: (a) profil published, (b) minimal satu pos dengan lokasi & jam/keterangan operasional masuk akal, (c) minimal satu menu dengan harga, (d) nama dan deskripsi informatif, (e) data termasuk fixture demo atau sudah dinyatakan valid untuk kategori sesuai aturan, (f) tidak terkena sanksi atau penanda invalid pada dataset.

- **Penilaian rasa/layanan tidak diukur**, karena tidak ada transaksi dan verifikasi pengalaman kuliner.
- **Jangan otomatis mendiskualifikasi usaha karena tidak punya WhatsApp**; klik peta bisa menjadi sinyal minat.
- Kelayakan berdasarkan *profil valid* berbeda dengan **kelayakan menerbitkan juara berdasarkan jumlah sampel**.

### 5.3. Kelayakan menerbitkan pemenang [REKOMENDASI MVP]

- Daftar peserta yang memenuhi profil tetap boleh ditampilkan sebagai ranking sementara atau daftar peserta, dengan penjelasan bila data tidak cukup.
- **Usulan**: minimal **3 usaha** dengan metrik yang memenuhi aturan agar juara 1/2/3 **diterbitkan**. Jika peserta = 0, 1, atau 2 → tidak ada *official three-winner award*.
- **Ambang minimal V dan I belum disetujui**; untuk eksperimen, uji parameter (`min_views`, `min_intents`) dan perlihatkan sensitivitasnya. Jangan menyebut angka 10/20/3 sebagai standar jika tidak diuji.
- Data yang belum cukup bukan sama dengan performa buruk. UI menjelaskan `insufficient_data`.

### 5.4. Kategori

| Kategori | Level | Makna, unit, syarat |
|---|---|---|
| **UMKM Paling Diminati** | **P0** | Ketertarikan digital valid, bukan "terlezat/terbaik". Tersedia per wilayah, mingguan/bulanan/tahunan (tahunan sesuai aturan khusus). |
| **Bintang Baru NEARASA** | **P1** | Kesempatan khusus UMKM yang baru dipublikasikan; usia ≤60 hari **usulan**; membutuhkan fixture tanggal onboarding yang nyata di simulasi, bukan `created_at` hasil seeder yang menyesatkan. |
| **UMKM Naik Daun** | **P2** | Perubahan performa terhadap baseline periode sebelumnya, dengan kehati-hatian sampel kecil. |
| **Pilihan Warga** | **Future** | Voting warga setelah autentikasi, moderasi dan pencegahan sybil/insentif tersedia. |

### 5.5. Kemenangan berulang

- Pemenang **boleh** juara berulang selama memenuhi formula dan syarat.
- Kemenangan tidak otomatis memberi bonus skor periode berikutnya.
- Kesempatan tampil usaha lain dikelola lewat Discovery terpisah, **bukan mengganti juara yang sah**.

---

## 6. PERIODE, STATUS, DAN PENERBITAN HASIL

| Periode | Interval **lokal WIB** [mulai, selesai) | Mekanisme |
|---|---|---|
| Weekly | Senin 00.00 → Senin berikutnya 00.00 | Hitung aktivitas pekan itu, ulang setiap pekan. |
| Monthly | Tanggal 1 00.00 → tanggal 1 bulan berikutnya 00.00 | **Hitung dari aktivitas bulan kalender**, bukan total kemenangan/skor mingguan. |
| Annual | 1 Jan 00.00 → 1 Jan tahun berikutnya 00.00 | **Hitung dari snapshot skor bulanan dengan formula sama sepanjang periode**; jangan campur formula versi berbeda. |

- Backend menyimpan atau memproses timestamp **UTC**; konversi ke `Asia/Jakarta` untuk batas periode dan tampilan.
- Interval **half-open**: `timestamp >= start && timestamp < end`. Aktivitas tepat 00.00 awal periode berikut tidak masuk periode sebelumnya.
- Satu pekan yang melintasi pergantian bulan tidak membuat aktivitas salah bulan: hitung bulan dari waktu event, bukan sum mingguan.
- `provisional` (periode belum selesai atau skenario sementara), `finalized` (hasil dikunci menurut kebijakan demo), `insufficient_data` (kurang data/peserta), `simulated` (atribut asal data, **selalu benar untuk demo**). Status simulasi dapat berdampingan dengan finalized: misalnya "Hasil simulasi — periode selesai".
- Setelah finalized, penyusunan ulang hasil dengan input yang sama menghasilkan snapshot identik secara substansi. Koreksi perlu `revision`, alasan, dan riwayat, bukan diam-diam berubah.

### 6.1. Keputusan khusus Annual [PARAMETER UJI]

**Usulan pendekatan MVP yang paling aman:** tampilkan **tahun simulasi lengkap (12 bulan)** yang jelas disebut skenario hipotetis, dan **jangan menyatakan 2026 sebagai hasil akhir satu tahun** sebelum 1 Jan 2027. Boleh menampilkan 2026 YTD dengan label `sementara`.

Calon formula:

`AnnualScore = 0.70 × mean(MonthlyScore[12]) + 0.30 × median(MonthlyScore[12])`

- Bobot 70:30 **hanya eksperimen**, bukan angka empiris resmi.
- Skor bulanan harus berasal dari **formula version dan normalisasi bulanan yang sama**.
- Untuk **MVP**, tetapkan demonstrasi penilaian final tahunan pada **12 bulan simulasi lengkap** agar tidak membuat aturan bulan hilang ambigu.
- Usulan sebelumnya "minimal 9 bulan data" **belum final dan bukan persyaratan P0**. Pada produk nyata perlu kebijakan terpisah untuk usaha yang mulai di pertengahan tahun. Untuk MVP, tandai tidak eligible bagi *Annual Consistency* dan arahkan ke kategori Rising Star P1; jangan memalsukan nilai 0 untuk bulan sebelum bergabung.
- Bila usaha sudah terdaftar tetapi tidak aktif dalam satu bulan, definisikan eksplisit perbedaan `zero activity` vs `missing data`. Untuk MVP full synthetic year, fixture dapat mencakup 12 nilai yang dapat diaudit tanpa missing.

---

## 7. DEFINISI DATA INTERAKSI — KEBENARAN SEMANTIK

### 7.1. Variabel kandidat formula utama

- **`V` (unique visitors / views):** jumlah **identitas pengunjung berbeda** yang melihat halaman profil usaha **minimal sekali dalam periode itu**. Bila pengguna melihat lima pos usaha yang sama, `V` tetap 1. Bila membuka lagi pada hari lain dalam minggu yang sama, `V` tetap 1 untuk **weekly**.
- **`I` (unique interested visitors):** jumlah **pengunjung yang masuk V** dan melakukan **minimal satu** tindakan berniat menuju lokasi/kontak usaha dalam **periode yang sama** (`map_click` atau `whatsapp_click`). Setiap orang maksimal menyumbang 1 ke I per bisnis/periode.
- Invarian: **`0 ≤ I ≤ V`**. Jika suatu map click berasal dari peta tanpa membuka profil, event itu tidak masuk numerator `I` versi pertama **meskipun dapat dicatat sebagai statistik operasional terpisah**. Ini kebijakan konservatif; UI perlu menjelaskannya, dan Work harus menguji bahwa denominator dan numerator memakai kohort orang yang sama.
- **`F` favorit:** tersedia sebagai fitur akun NEARASA tetapi **tidak dipakai di formula v1** sampai ada event historis yang sah dan definisi aktivasi/pembatalan. Jangan mengambil current pivot `business_user` sebagai histori favorit mingguan.
- **`Q` kualitas profil:** **eligibility**, bukan skor kepuasan atau rasa.

### 7.2. Deduplikasi dan anti-manipulasi

- Untuk synthetic fixtures, gunakan `visitor_key` **fiktif dan stabil** lintas pos/event/periode; jangan menyertakan email, nomor telepon, ID sesi riil dalam ekspor publik.
- Tidak menghitung aktivitas pemilik terhadap usahanya sendiri (bila pemilik direpresentasikan di dataset), klik berulang, serta aktivitas bot/invalid yang sengaja disimulasikan. Aturan invalid **harus dapat ditunjukkan dalam test**, bukan klaim "anti-fraud aman".
- `profile_view` nyata di aplikasi berasal dari server Inertia, bukan *impression* kartu katalog. Jangan menyamakan keduanya.
- Karena tidak ada event `impression`, **keadilan distribusi eksposur belum dapat diukur langsung**. Ini roadmap riset, bukan fitur selesai.
- Identitas anonim berbasis sesi pada produk nyata bukan identitas unik sempurna lintas perangkat/browser. Jelaskan keterbatasan bila membahas potensi produksi.
- `map_click`/`whatsapp_click` mengindikasikan **niat**, bukan transaksi, kunjungan nyata, atau kepuasan.

---

## 8. FORMULA RANKING V1 — KANDIDAT YANG PERLU SIGN-OFF

### 8.1. Riwayat keputusan formula (penting agar tidak tercampur)

**Rumus awal yang DIGANTIKAN sebagai kandidat utama:**

`S_old = 0.35 × Intent + 0.25 × Favorites + 0.20 × Views + 0.20 × ProfileQuality`

Kelemahannya: bias popularitas, favorit tidak punya log histori memadai, dan kualitas profil bukan bukti minat masyarakat.

**Rumus kandidat saat ini: Hybrid Volume + Smoothed Engagement Rate.** Dasar konseptual: pembatasan dominasi volume dan menstabilkan rasio dengan sampel kecil. **Tidak menggunakan Wilson confidence bound**, sehingga **jangan sebut interval kepercayaan statistik**.

### 8.2. Definisi matematis

Untuk suatu bisnis dan suatu periode, dengan `V ≥ 0`, `0 ≤ I ≤ V`, `T > 0`:

```text
L(I,T) = 100 × min(1, ln(1+I) / ln(1+T))
R(I,V; r0, lambda) = (I + lambda × r0) / (V + lambda)
C(I,V) = 100 × min(1, R / rTarget)
S = 0.60 × L + 0.40 × C
```

Keterangan:

- `L` = skor *volume tindakan* dinormalisasi log (0–100).
- `R` = rasio tindakan unik terhadap pengunjung unik, dengan *smoothing prior*.
- `C` = skor rasio disesuaikan dan dibatasi 100.
- `S` = skor keseluruhan dalam interval [0,100].
- **Semua perhitungan memakai angka mentah float; pembulatan 2 angka desimal hanya pada presentasi/snapshot yang disetujui.**

### 8.3. Parameter *calibration fixtures*, bukan standar penelitian

| Parameter | Weekly | Monthly | Annual |
|---|---:|---:|---|
| `volumeWeight` | 0.60 | 0.60 | Tidak dipakai langsung; agregasi skor bulanan |
| `rateWeight` | 0.40 | 0.40 | Tidak dipakai langsung |
| `T` target volume | 75 | 300 | Tidak ada target volume tahunan tunggal pada model 12 bulanan |
| `r0` prior rate | 0.10 | 0.10 | Mewarisi skor bulan |
| `lambda` kekuatan prior | 100 | 100 | Mewarisi skor bulan |
| `rTarget` nilai skor rasio maksimum | 0.20 | 0.20 | Mewarisi skor bulan |
| `annualMeanWeight` | — | — | 0.70 |
| `annualMedianWeight` | — | — | 0.30 |

**Status seluruh angka: [PARAMETER UJI].** Parameter dapat dikonfigurasi dan harus tersimpan dalam snapshot (`formula_version`, `params`). Work perlu melakukan **uji sensitivitas** sebelum meminta pengguna mengunci pilihan.

### 8.4. Kondisi nol dan jumlah sampel kecil

- `V = 0` → `I = 0`, **tidak eligible untuk juara**, jangan memberi skor "tinggi" karena prior smoothing.
- `I = 0` → usaha tidak eligible untuk hadiah minat pada MVP, meskipun `C` matematis bisa positif akibat prior. Boleh tampil di daftar peserta dengan keterangan belum ada sinyal minat.
- `1 ≤ I ≤ V` tapi sampel sangat sedikit → tampilkan peringatan `low_sample` sesuai ambang yang **belum divalidasi**; uji dampak terhadap kelayakan pemenang.
- Smoothing mengurangi ekstrem rasio sampel kecil, **bukan memastikan keadilan sempurna**. Interpretasi `R` bergantung pada kohort, eksposur awal, bias self-selection, dan kemungkinan manipulasi.

### 8.5. Urutan peringkat dan tie-break

**Usulan deterministik untuk Work** (perlu sign-off sebelum final):

1. Urutkan `S` tertinggi; untuk kasus yang tampak sama pada **2 desimal**, gunakan tie-break agar penjelasan UI tidak kontradiktif.
2. Jumlah `I` unik terbanyak.
3. `R` yang disesuaikan tertinggi.
4. Jumlah `V` unik terbanyak.
5. ID bisnis stabil sebagai tie-break teknis terakhir.

**Jangan gunakan random order**, tanggal saat ekspor, atau urutan query. Berikan label "urutan ditentukan tie-break" bila dua skor tampilan sama.

### 8.6. Simulasi terverifikasi untuk menguji model A/B/C

Data ini **semuanya fiktif**, bukan statistik dashboard NEARASA:

| Bisnis | V | I | Rasio mentah | Hybrid `S` (60:40; T=75, r0=.10, λ=100, target=.20) |
|---|---:|---:|---:|---:|
| Pizza Sore | 1000 | 60 | 6.00% | **69.68** |
| Roti Pagi | 250 | 55 | 22.00% | **92.91** |
| Burger Pos | 20 | 10 | 50.00% | **66.55** |
| Dapur Bara | 1500 | 15 | 1.00% | **41.54** |
| Dapur Griya | 400 | 65 | 16.25% | **88.05** |

Model A (jumlah I): **Dapur Griya** menang (65). Model B (rasio mentah): **Burger Pos** menang (50%, N=20). Model C (hybrid): **Roti Pagi** menang (92.91). Hitungan model hybrid di atas telah diaudit aritmetiknya dengan rumus yang tercantum; angka input tetap fiktif.

**Penting:** analisis ini hanya membuktikan bahwa metode memberi urutan berbeda dan bisa diuji, **bukan** bahwa 60:40 terbukti paling adil atau meningkatkan konversi nyata.

---

## 9. MODEL PENGHARGAAN, PEMENANG, BADGE, DAN DISCOVERY

### 9.1. Tiga jenis pengakuan

| Periode | Nama UX usulan | Fungsi | Mekanisme |
|---|---|---|---|
| Weekly | **Weekly Spotlight** | Kesempatan mendapat perhatian pekan ini | Hitung skor dari event pada minggu tersebut. |
| Monthly | **Monthly Recognition** | Performa minat yang lebih stabil | Hitung ulang event per bulan kalender. |
| Annual | **Annual Recognition / UMKM Paling Konsisten** | Konsistensi jangka panjang | Mean/median 12 skor bulan pada skenario full-year. |

**Weekly tidak otomatis menjadi syarat menang Monthly.** Jumlah juara mingguan bukan indikator tambahan skor bulanan. **Annual tidak sekadar total views setahun.**

### 9.2. Badge sebagai catatan penghargaan yang bisa diperiksa

Setiap *badge* yang muncul harus memiliki: `business_slug/id`, `award_category`, `period`, `region`, `rank`, `period_start`, `period_end`, `formula_version`, `result_revision`, `is_simulated`, `result_url`.

- Pemenang 1/2/3 memakai identitas visual berbeda, **tanpa mengklaim sertifikasi kualitas rasa/pelayanan**.
- Pemenang boleh menang berulang. Riwayat pencapaian tidak lenyap ketika periode berganti.
- Badge lama pada profil dapat tampil di *Awards History*, sedangkan badge terbaru ditonjolkan.
- Jika hasil ditinjau ulang, status koreksi/pencabutan harus jelas dan audit tidak dihapus diam-diam.
- Semua badge/poster demo: **"SIMULASI — BUKAN PENGHARGAAN NYATA"** secara jelas.

### 9.3. Hadiah digital dan prioritas

- **P0:** Badge profil, leaderboard, halaman penjelasan, arsip pemenang, spotlight publik.
- **P1:** Winner's Kit: poster feed 1080×1350, story 1080×1920, caption siap salin, tautan/QR profil; boleh memakai **satu template adaptif**. **Jangan membuat editor kompleks.**
- **P2:** Sertifikat digital tahunan dan aset tambahan.
- **Tidak masuk MVP:** uang, sponsor, voucher, hadiah fisik, sponsored boosting, paid leaderboard, voting massal.

### 9.4. Discovery ≠ Awards

- Hasil pencarian utama tetap diurutkan berdasarkan **kecocokan kebutuhan konsumen, jarak, jam, filter harga/menu**, mengikuti perilaku produk asal.
- Pemenang mendapat **komponen spotlight khusus**, bukan otomatis mengalahkan relevansi semua pencarian.
- Beranda usulan menampung slot terpisah: "Kuliner Dekat Kamu", "Sorotan Pemenang", "Baru Bergabung" [P1], "Jelajahi Warung Lain".
- Tidak ada proporsi tetap 20%/30% penayangan yang bisa diklaim adil tanpa eksperimen; uji *impression* kelak.

---

## 10. RANCANGAN DATASET SIMULASI (JANGAN MERUSAK KATALOG)

### 10.1. Nama bisnis demo yang benar dari `database/seeders/data/catalog.php`

| Slug | Nama | Wilayah fixture | Pos |
|---|---|---|---|
| `dapur-griya` | Dapur Griya | Sidoarjo | **2** (kasus multi-pos) |
| `pizza-sore` | Pizza Sore | Sidoarjo | 1 |
| `dapur-bara` | Dapur Bara | Sidoarjo | 1 |
| `kopi-sudut` | Kopi Sudut | Surabaya | 1 |
| `rasa-segar` | Rasa Segar | Surabaya | 1 |
| `burger-pos` | Burger Pos | Sidoarjo | 1 |
| `mie-malam` | Mie Malam | Surabaya | 1 |
| `roti-pagi` | Roti Pagi | Sidoarjo | 1 |

**CATATAN:** alamat dan koordinat ini adalah **titik contoh**, bukan verifikasi usaha dunia nyata. Kategori lokasi berasal dari fixture awal; jangan mempromosikan seolah merchant asli.

### 10.2. Event sintetik minimal

- `event_id` unik stabil (untuk idempotensi), `business_slug/id`, `selling_post_id`, `visitor_key` dummy, `type`, `occurred_at_utc`, `validity/invalid_reason` bila diperlukan pada fixture.
- `type` untuk scoring inti: `profile_view`, `map_click`, `whatsapp_click`. `menu_open` boleh tetap disimpan untuk demonstrasi statistik tetapi **tidak masuk rumus hybrid v1**. `favorite` boleh dibuat sebagai skenario masa depan, **jangan dihitung oleh formula inti terbaru**.
- Setiap `I` valid harus punya `profile_view` yang cocok dalam periode sama supaya kohortnya benar.
- Buat variasi persebaran event: beberapa pekan, beberapa bulan, 12 bulan simulasi (untuk annual), batas WIB, hari berganti, pengguna kembali, lintas pos, usaha baru/viral, bot/duplikat, lokasi Sidoarjo/Surabaya.
- **Jangan mendaur ulang `visitor_key` dengan tujuan membongkar identitas riil.** Gunakan string sintetik.
- Seeder harus **deterministik, idempoten**, dan tidak menghapus data penggunaan aplikasi; **jangan memanggil ulang `CatalogSeeder` setelah event Awards dibuat** tanpa memastikan dampak cascade.
- Jangan memasukkan event sintetik ke `interaction_events` nyata; gunakan tabel demo terpisah seperti branch percobaan.

### 10.3. Skenario pengujian fixture

1. UMKM terkenal: V tinggi tetapi rasio kecil.
2. UMKM kecil: V sedang dan I kuat.
3. UMKM baru: V sangat kecil, rasio tinggi → smoothing dan aturan data-minimum diuji.
4. UMKM viral: views tinggi, I rendah → tidak otomatis menang.
5. Multi-pos: satu orang membuka beberapa pos → V/I dihitung satu kali per periode.
6. Klik peta dan WA oleh orang sama → I tetap satu.
7. Klik peta dari direktori tanpa view profil → tidak menjadi I (kebijakan formula v1).
8. Pemilik login, aktor bot fiktif, event invalid → tidak menaikkan skor.
9. Periode tepat di 00.00 WIB, tahun kabisat bila relevan, bulan melintasi minggu.
10. Bulan tidak lengkap, tahun belum selesai, <3 peserta, skor seri, usaha unpublished.
11. Dataset dihasilkan ulang → hasil **identik**, tidak menumpuk duplikasi.
12. Foto/poster kosong/invalid di frontend → fallback dan label simulasi tetap tampil.

---

## 11. DATA CONTRACT: JSON SNAPSHOT UNTUK VERCEL

### 11.1. Prinsip

- Snapshot adalah hasil ekspor lokal **yang dapat dihitung ulang** dari fixture, bukan array pemenang acak yang disunting tangan.
- Tidak menyertakan data identitas pengunjung, session, email pemilik, nomor WhatsApp pribadi, atau API key.
- Kunci revisi/versi formula dan status data eksplisit; JSON valid dan mudah diverifikasi oleh unit test serta frontend.
- `generated_at` boleh berubah antar ekspor, **sedangkan skor/rank/hasil** harus deterministik untuk input dan versi formula yang sama; tes perbandingan mengecualikan metadata build yang berubah.

### 11.2. CONTOH struktur snapshot (nama field adalah **kontrak usulan**, sesuaikan setelah audit Work)

```json
{
  "schema_version": "1.0",
  "formula_version": "hybrid-demo-v1",
  "data_status": "simulated",
  "result_status": "finalized",
  "region": "Sidoarjo",
  "category": "most_interested",
  "period": "weekly",
  "start_local": "2026-11-02T00:00:00+07:00",
  "end_local_exclusive": "2026-11-09T00:00:00+07:00",
  "timezone": "Asia/Jakarta",
  "generated_at_utc": "2026-11-12T05:00:00Z",
  "params": {
    "volume_weight": 0.6,
    "rate_weight": 0.4,
    "volume_target": 75,
    "prior_rate": 0.1,
    "prior_strength": 100,
    "rate_target": 0.2
  },
  "eligible_business_count": 5,
  "minimum_participants": 3,
  "entries": [
    {
      "business_id": 8,
      "business_slug": "roti-pagi",
      "display_name": "Roti Pagi",
      "rank": 1,
      "score": 92.91,
      "metrics": { "unique_profile_visitors": 250, "unique_interested_visitors": 55 },
      "score_parts": { "volume": 92.95, "smoothed_rate": 92.86 },
      "badge": { "eligible": true, "rank": 1, "award_type": "weekly" }
    }
  ],
  "notes": ["DATA SIMULASI; bukan penghargaan nyata atau statistik pelanggan."]
}
```

**Peringatan:** `business_id=8` adalah **placeholder struktural** dan belum tentu benar untuk data katalog yang di-seed pada setiap lingkungan; `rank=1` dan nilai 92.91 menggambarkan **hasil perhitungan dataset fiktif pada Bagian 8** (Roti Pagi), bukan hasil fixture repository yang tersedia. Snapshot akhir harus dibuat dari data eksekusi Work sesungguhnya, bukan menyalin contoh ini ke produksi.

**Kemampuan frontend:** filter wilayah/periode/kategori, pencarian peserta, urutan peringkat, detail skor, badge, status `insufficient_data`, empty state, riwayat, dan tautan navigasi tidak boleh gagal saat reload.

---

## 12. SPESIFIKASI UX/UI RINGKAS DAN ALUR PENGGUNA

### 12.1. Rute konsep (belum ada di repository)

- `/awards` — entry utama dan leaderboard publik.
- `/awards/history` — arsip hasil pemenang menurut kategori/wilayah/periode.
- Profil usaha `/usaha/{slug}` — embed badge/riwayat pemenang; di static demo Work harus memastikan rute ini **benar-benar dapat dirender**.
- Beranda `/` — spotlight berlabel simulasi; tautan detail Awards.
- Dashboard pemilik `/kelola-usaha` — **P1** simulasi skor pribadi tanpa klaim login/persistensi nyata.

### 12.2. Award page: komponen P0

1. **Hero ringkas** — apa itu Awards, kenapa bukan bukti rasa terbaik.
2. **Label permanen simulasi** — terlihat tanpa perlu scroll; dapat dijelaskan dalam metodologi.
3. **3 tab periode** weekly/monthly/annual; **2 wilayah** Sidoarjo/Surabaya; tahun/periode terpilih jelas.
4. **Leaderboard** — peringkat, usaha, total skor, tanda pemenang, periode & status.
5. **Detail score breakdown** — `V`, `I`, rasio mentah, rasio smoothed, skor volume, skor rasio, hasil akhir, `formula_version`; jangan membocorkan visitor IDs.
6. **Bagaimana cara penilaian?** — ketentuan eligibility, formula, contoh perhitungan, batasan seperti klik bukan transaksi.
7. **CTA** — buka profil usaha, jelajah kuliner, riwayat penghargaan.
8. **Empty/insufficient state** — data tidak tersedia, belum cukup peserta, periode berjalan, JSON gagal dibaca.

### 12.3. User journey konsumen

Beranda → lihat Sorotan Awards → pilih wilayah/periode → baca ranking & detail → buka profil UMKM → lihat lokasi/jadwal/menu → kembali ke Jelajah/Peta. Semua tindakan pada versi static hanya navigasi/aksi simulasi yang didukung, **jangan ada tombol seolah akan menyimpan ke server bila tidak bekerja**.

### 12.4. User journey pemilik (P1)

Buka Dashboard Demo Pemilik → pilih usaha contoh → lihat posisi/perkembangan & alasan skor → jika menang, lihat badge dan *Winner's Kit* → salin caption/bagikan poster yang jelas bertanda DEMO. **Jangan menjanjikan akun login persisten**.

### 12.5. Kualitas UX dan aksesibilitas

- Mobile-first; ringkas, angka dapat dibaca, tombol/tabs jelas, tidak hanya dibedakan warna.
- Format angka Indonesia & rentang tanggal WIB; tidak boleh ambigu antara "minggu lalu" dan periode tanggal absolut.
- Tidak mengumumkan "juara final" untuk periode yang masih berjalan.
- Beri alternatif teks dan fallback untuk foto usaha; tautan kembali tidak rusak saat deep link.
- Jangan buat halaman semata "mockup cantik" dengan angka hardcoded yang bertentangan dengan snapshot.

---

## 13. PRODUCT GROWTH LOOP — NARASI, BUKAN SCOPE TAMBAHAN

```text
Pemilik melengkapi profil/pos/menu
    ↓
Konsumen menemukan usaha lewat Jelajah/Peta
    ↓
Konsumen melihat profil dan menunjukkan minat (klik arah/kontak)
    ↓
Interaksi valid menjadi dasar penghargaan simulasi
    ↓
Pemenang memperoleh badge + sorotan + materi promosi
    ↓
Pemilik berbagi profil kepada calon pelanggan
    ↓
Lebih banyak peluang penemuan kuliner lokal
```

**Jaga dua jalur:**

- **Awards = pengakuan performa** dari data valid.
- **Discovery = relevansi dan keberagaman** untuk semua usaha, termasuk yang belum pernah menang.

**Risiko siklus kaya semakin kaya:** semakin populer → semakin mudah menang → semakin terlihat. Mitigasi yang diusulkan: spotlight Awards dibedakan dari hasil pencarian utama, kategori khusus UMKM baru [P1], rotasi eksplorasi relevan, pengujian exposure/impression di masa depan.

**Metrik hipotesis produk (nanti, bukan data aktual MVP):** profile CTR dari spotlight, jumlah usaha yang diekspos, klik peta/WA, penggunaan Winner's Kit, pelaku UMKM yang menganggap fitur berguna, konsentrasi exposure. **Jangan memaparkan angka pertumbuhan tanpa pengukuran.**

---

## 14. RISIKO DAN EDGE CASES — CHECKLIST AUDIT

| Risiko | Pencegahan/tes yang diminta |
|---|---|
| Data demo menyaru nyata | Label SIMULASI pada halaman, badge, poster, JSON, presentasi. |
| Formula berubah tanpa jejak | `formula_version`, params, fixture, result revision; snapshot dibekukan. |
| Fiktif bisnis lama jadi annual winner | Year 2025 berlabel "skenario hipotetis"; 2026 YTD bukan final. |
| Multi-pos memberi dua suara | Agregasi usaha; V/I unik lintas pos. |
| Pengunjung mengklik berulang | Dedup periode, bukan hitungan event mentah. |
| `I > V` | Validasi invariant/cohort; event direct-map tanpa view tidak dihitung numerator. |
| Smoothing memberi skor padahal I=0 | Ineligible awarding; display penjelasan. |
| Sampel satu orang viral 100% | Smoothed rate; coba ambang minimum & status low-sample. |
| Unit perbandingan wilayah tidak adil | Kompetisi Sidoarjo/Surabaya terpisah; tidak mengarang verified location. |
| Katalog disemai ulang | Seeder katalog menghapus/membangun ulang pos; jangan dijalankan setelah event Awards tersimpan tanpa migrasi/retensi. |
| Favorite bukan histori | Jangan pakai pivot `business_user` sebagai event favorit periode. |
| Tidak ada WhatsApp katalog demo | Klik peta tetap indikator; jangan buat nomor telepon palsu sebagai kontak nyata. |
| Cross-month weekly | Hitung monthly dari waktu event yang benar. |
| UTC/WIB salah | Tes batas 17:00 UTC = 00:00 WIB; start inclusive/end exclusive. |
| Partial annual/monthly | `provisional` dan tidak memakai label juara final. |
| Berubah pada redeploy | Snapshot statis; tidak ada persistence, jelas untuk juri. |
| Vercel deep link 404 | SPA rewrite; uji `/awards`, `/usaha/{slug}`, refresh. |
| Inertia mengirim request ke Laravel mati | Static shell dan data lokal JSON; menu tindakan yang tidak didukung jangan berpura-pura hidup. |
| Hasil pengujian tidak dijalankan | Work wajib mencatat perintah, hasil, tes yang belum bisa dijalankan. |
| Browser/local device privacy | Snapshot tidak membawa akun/session/identitas pengguna nyata. |
| Aset pemenang disalahgunakan | Hanya UMKM fiktif, label simulasi, sumber detail; tidak membuat klaim resmi. |
| Algoritma memotivasi spam | No paid boosting dan no incentivized reviews; nonaktifkan voting sebelum ada perlindungan. |
| P2 mengganggu P0 | Gate prioritas: statistik → snapshot → leaderboard → badges → UX → opsional. |

---

## 15. RENCANA IMPLEMENTASI UNTUK WORK (JANGAN JALANKAN DARI ROOM STRATEGI)

> **Status:** rencana untuk dipakai **setelah pengguna menginstruksikan eksekusi dalam room Work**. Work boleh mengusulkan penyederhanaan teknis tetapi tidak mengubah keputusan produk tanpa mencatat alasannya.

### Task 0 — Audit awal + menyelaraskan branch

**File teramati untuk dibaca:** README, `composer.json`, `package.json`, `vite.config.ts`, `resources/js/app.tsx`, `routes/web.php`, migration interaksi, `CatalogSeeder`, `InteractionTracker`, `CommunityFlowTest`, branch `feat/awards-demo-ranking-v1`.

**Hasil:** daftar file relevan, diff branch vs main, daftar konflik test lama-v1.0, risiko `CatalogSeeder`, rencana static build dan keputusan cut scope. **Tidak melakukan merge.**

### Task 1 — Dataset sintetik yang aman (P0)

**File di branch yang sudah ada:** `database/migrations/2026_11_12_000100_create_award_demo_events.php`.
**Usulan create:** `database/seeders/AwardsDemoSeeder.php` dan `database/seeders/data/awards.php` atau fixture generation deterministik yang disepakati.
**Test:** `tests/Feature/AwardsDemoRankingTest.php` disesuaikan, test tambahan bila perlu.

**Kontrak:** `seed()` hanya mengubah data Awards demo, tidak menyentuh aktivitas nyata, tidak memanggil ulang katalog tanpa mitigasi, tidak duplikat pada eksekusi berulang, tidak memakai data pribadi.

**TDD:** (1) tulis tes gagal, (2) buktikan gagal, (3) implement minimal, (4) jalankan tes fokus sampai pass, (5) jalankan integrasi terkait. Jangan mengklaim lulus sebelum command dieksekusi.

### Task 2 — Calculator yang terpisah dan deterministik (P0)

**Usulan create:** `app/Services/Awards/RankingCalculator.php`, `config/awards.php` (atau satu konfigurasi yang transparan). **Jangan berasumsi file sudah ada** karena verifikasi branch terakhir menunjukkan belum ada.

**Interface kandidat (Work boleh rapikan setelah audit):**

```php
calculate(string $period, string $startDateWib, string $region, string $formulaVersion): array
```

**Input:** event sintetik, profil eligible, region fixture, parameter versi; **output:** periode, params, daftar peserta, metrik V/I, score breakdown, rank, status data.

**Test:** V/I lintas pos, intent subset profile visitors, zero/low sample, eligibility, wilayah, mingguan/bulanan/tahunan, UTC boundary, tie-break, determinisme, ambang pemenang, tetap tidak mengubah `InteractionTracker` yang lama.

**Catatan konflik branch:** test awal mengharapkan `favorite` pada metrik sedangkan formula hybrid terbaru tidak menghitungnya; **ubah tes terlebih dahulu**, bukan memaksa kode memenuhi spesifikasi lama.

### Task 3 — Snapshot Exporter (P0)

**Usulan create:** `app/Console/Commands/ExportAwardsDemo.php` atau Artisan closure command teruji di `routes/console.php`; format output JSON yang eksplisit sesuai Bagian 11. **Path output yang diusulkan** `/public/demo/awards/` atau lokasi hasil build static yang disetujui.

**Kontrak:** menerima kombinasi region/period/date, validasi input, menghasilkan file deterministik, berlabel simulasi, tidak menyertakan visitor keys, tidak menimpa arsip hasil final tanpa explicit revision policy. Tes hasil re-run konsisten dan JSON valid.

### Task 4 — Static frontend scaffold Vercel (P0)

**File teramati:** `resources/js/app.tsx`, `vite.config.ts`, `package.json`. **Usulan file baru:** entry point React SPA terpisah (misalnya `resources/js/awards-demo/main.tsx`), HTML entry, Vite config static terpisah, `vercel.json` rewrite SPA bila dibutuhkan; **Work harus memastikan nama/path tepat setelah audit.**

**Kontrak:** `npm run build` lama untuk Laravel tetap bekerja, ada perintah build demo statis terpisah; frontend tidak mengirim request POST ke backend saat deploy Vercel; mendukung reload/deep link. Test browser mobile dan desktop; bila homepage dan profile disertakan, seluruh navigasi utama bekerja.

### Task 5 — Halaman Awards dan pengakuan (P0)

**Komponen yang diusulkan:** `AwardsPage`, `AwardsLeaderboard`, `ScoreExplanation`, `AwardBadge`, `AwardsHistory`, `WinnerSpotlight`, `SimulatedDataBanner` (nama dapat menyesuaikan konvensi React repo).

**Uji:** Weekly/Monthly/Annual berganti tanpa angka stale; wilayah berganti; score breakdown cocok snapshot; aturan min 3 & empty states; tautan profil, badge dan Spotlight konsisten; label simulasi tidak hilang pada mobile/scroll/publikasi.

### Task 6 — Integrasi UX, regresi, build & presentasi (P0)

**Perintah dari README yang harus dijalankan Work (setelah lingkungan tersedia):**

```sh
php artisan test --compact
npm run typecheck
npm run test:discovery
npm run test:profile
npm run test:consumer
npm run build
```

Tambahkan `php artisan test --filter=AwardsDemoRankingTest` dan perintah build static yang Work buat; dokumentasikan perintah aktual dan output tes. Jalankan static preview dan pengujian URL refresh/deep link. Jika tidak bisa menjalankan di lingkungan terhubung, tulis sebagai **belum terverifikasi** dengan alasan teknis dan cara verifikasi.

### Task 7 — P1 (hanya setelah P0 stabil)

Bintang Baru dengan fixture onboarding sintetik, dashboard pemilik simulasi, Poster Winner's Kit template adaptif, caption promosi dan QR. Jangan mengerjakan P2 kecuali pengguna secara jelas memintanya.

---

## 16. ACCEPTANCE CRITERIA / DEFINITION OF DONE

### 16.1. Data dan algoritma

- [ ] Demo event **terpisah** dari statistik interaksi lama; tidak memakai identitas riil.
- [ ] Fixture **idempoten dan deterministik**, tanpa menghapus menu/pos dengan dampak tidak disengaja.
- [ ] V/I sesuai definisi **unik pada level usaha dan periode**, I⊆V.
- [ ] Angka skor dihitung, **bukan hardcode pemenang**; sesuai tes numerik dan contoh rumus.
- [ ] Skor 0–100, parameter/formula version disertakan dan stabil.
- [ ] Weekly dan Monthly mengacu batas WIB yang benar; annual dari bulan yang sebanding.
- [ ] Tidak ada juara resmi bila peserta/data tidak mencukupi; periode berlangsung masih provisional.
- [ ] Uji edge case dan regresi lama pass, atau kegagalan dijelaskan dengan bukti.

### 16.2. Vercel demo dan UX

- [ ] Frontend statis **benar-benar** dapat dirender tanpa PHP/Laravel online.
- [ ] Akses `/awards`, reload, deep links, mobile, fallback gambar/JSON tidak error.
- [ ] Filter periode/wilayah bekerja; detail skor cocok dengan snapshot.
- [ ] Badge, halaman arsip, spotlight mengacu hasil yang sama; tidak stale.
- [ ] **Label SIMULASI** terlihat pada halaman, poster, dan badge.
- [ ] Tidak ada CTA login/CRUD/post yang menyesatkan atau diam-diam gagal.
- [ ] Tidak mengklaim real-time/persistence/transaksi/peningkatan omzet.

### 16.3. Deliverables room Work

- [ ] Ringkasan audit repo dan branch eksperimen.
- [ ] Catatan keputusan parameter yang sudah disetujui pengguna.
- [ ] Implementasi kode terpisah dan perubahan aman pada branch yang disepakati.
- [ ] Daftar file berubah, hasil test, contoh snapshot JSON, instruksi build lokal/static.
- [ ] Bukti verifikasi deployment (jika dilakukan), tautan demo dan screenshot seperlunya.
- [ ] Daftar keterbatasan yang masih ada serta apa yang **belum** diverifikasi.

---

## 17. RISET DAN ALASAN BERBASIS SUMBER (BUKAN OPINI ASISTEN SAJA)

> **Aturan epistemik:** riset eksternal mendukung **prinsip desain**, bukan parameter formula 60:40 atau dampak nyata NEARASA. Angka skenario kompetisi tetap simulasi. Prioritaskan sumber primer/resmi; opini Reddit, jika dipakai kemudian, hanya indikasi pengalaman individual.

1. **Nextdoor (14 Okt 2026), Fave Awards:** https://about.nextdoor.com/press-releases/nextdoor-announces-2026-fave-award-winners-celebrating-neighborhood-favorites — contoh penghargaan bisnis lokal berbasis komunitas, badge, kit pemenang, stiker, tempat khusus dalam penemuan usaha. **Catatan:** Nextdoor memang menaikkan ranking pencarian pemenang; NEARASA **sengaja tidak harus meniru** karena tujuan fairness berbeda.
2. **Etsy, Star Seller:** https://help.etsy.com/hc/en-us/articles/4403058372503-What-is-the-Star-Seller-Badge — penilaian per 1 bulan menggunakan 3 bulan data dan syarat kelayakan, badge tidak langsung mengubah search ranking. **Jangan menyalin standar transaksi Etsy** ke platform tanpa transaksi.
3. **DoorDash, Road to Most Loved (2026):** https://merchants.doordash.com/en-us/learning-center/road-to-most-loved — pengakuan kualitas operasional berbasis metrik, badge dan slot khusus. **Pembeda:** DoorDash punya data order/operasional yang NEARASA belum punya.
4. **Klimashevskaia dkk., Springer 2024, *A survey on popularity bias in recommender systems*:** https://link.springer.com/article/10.1007/s11257-024-09406-0 — bias popularitas dapat menciptakan konsentrasi dan penguatan eksposur. **Peringatan penulis:** dampak dan mitigasi banyak diteliti dalam eksperimen komputasional, belum otomatis terbukti pada pengguna nyata.
5. **Evan Miller, *How Not To Sort By Average Rating*:** https://www.evanmiller.org/how-not-to-sort-by-average-rating.html — rasio mentah dengan sampel kecil menyesatkan, ukuran sampel penting. **Miller membahas Wilson lower bound; formula NEARASA berbeda, memakai smoothing heuristik, tidak boleh dilabeli interval keyakinan 95%.**
6. **Google Business Profile, local ranking:** https://support.google.com/business/answer/7091?hl=en — Google menyebut relevansi, jarak, dan popularitas; menguatkan pemisahan pencarian kebutuhan konsumen dari leaderboard prestasi.
7. **Google Maps, kebijakan interaksi palsu:** https://support.google.com/contributionpolicy/answer/7400114?hl=id — larangan ulasan berbayar, insentif untuk rating tertentu, aktivitas palsu; inspirasi prinsip anti-manipulasi. **Bukan berarti NEARASA telah mengimplementasikan anti-fraud produksi.**
8. **Vercel, function runtimes:** https://vercel.com/docs/functions/runtimes — PHP tercantum sebagai *community runtime*, filesystem fungsi read-only dengan `/tmp` sementara. Sebab memilih static demo daripada Laravel SQLite online.
9. **Vercel, Vite deployment & SPA rewrites:** https://vercel.com/docs/frameworks/frontend/vite — dukungan Vite, isu deep link SPA, dan solusi routing.
10. **RRI Surabaya (28 Jul 2026), lomba SWK dan promosi digital:** https://rri.co.id/surabaya/ekonomi/umkm/2605183/pemkot-surabaya-gelar-lomba-swk-perkuat-tata-kelola-dan-promosi-digital — relevansi lokal kompetisi dan promosi digital. **Tidak membuktikan Awards NEARASA menaikkan omzet.**

**Cara menggunakan rujukan:** di proposal, kaitkan klaim spesifik dengan sumber. Contoh: “Popularity bias bisa mempersempit eksposur” → Springer; “Badge tidak harus langsung menaikkan ranking pencarian” → Etsy; “Sistem penghargaan lokal dengan toolkit promosi memungkinkan” → Nextdoor. Jangan menyatakan sumber tertentu memvalidasi bobot/angka demo NEARASA.

---

## 18. DECISION LOG, AUDIT KONTRADIKSI, DAN PROMPT UNTUK WORK

### 18.1. Audit kontradiksi antar-versi diskusi (HARUS DIBACA WORK)

| Konflik historis | Interpretasi final yang disarankan |
|---|---|
| Rumus lama 35/25/20/20 vs hybrid 60/40 | **Pakai hybrid sebagai kandidat utama**; jangan gabungkan tanpa keputusan baru. |
| `InteractionTracker` dedup 30 menit per pos vs Awards V/I unik per periode per usaha | Biarkan statistik lama; agregasi fixture Awards di jalur terpisah. |
| Test branch awal menghitung favorites vs keputusan v1 menunda favorit | Sesuaikan test dengan semantik final sebelum kode Calculator. |
| Test awal "map_click tanpa profile view" bisa dianggap I | **Syarat I subset V**; gunakan fixture yang mempunyai pasangan view atau jangan hitung sebagai I. |
| Static Vercel vs Laravel Inertia | Build SPA/MPA mandiri; jangan deploy Inertia seolah bisa berjalan tanpa PHP. |
| Annual berdasarkan volume setahun vs 70/30 mean-median | Untuk konsep terbaru **annual dinilai dari skor bulanan 12 bulan**, bukan jumlah views/trofi. |
| Annual min 9 bulan vs kesetaraan tahun penuh | **Min 9 bulan belum diputuskan**; gunakan 12 bulan fiktif lengkap untuk demo final tahunan P0. |
| Nama "UMKM Terbaik" vs data hanya klik | Gunakan **Paling Diminati** / **Paling Konsisten**, bukan kualitas makanan. |
| Semua data demo vs status "juara resmi" | Pemenang resmi **dalam skenario simulasi**, bukan penghargaan kepada merchant nyata; label tetap terlihat. |
| Presentasi gamification growth vs MVP fokus | Growth loop adalah argumen bisnis; **jangan menambah fitur gamification atau referral** hanya karena disebut sebagai peluang. |

### 18.2. Keputusan yang memerlukan sign-off pengguna sebelum Work mengunci implementasi

| ID | Pertanyaan keputusan | Default yang direkomendasikan |
|---|---|---|
| D1 | Formula utama yang dipilih? | Hybrid Volume + Smoothed Rate, parameter awal 60:40; formulas & limits dari Bagian 8. |
| D2 | Ambang kelayakan juara? | Minimal 3 bisnis layak; `min_views`/`min_intents` setelah melihat uji sensitivitas, jangan mengarang benchmark. |
| D3 | Kasus skor sama? | Tie-break dari Bagian 8.5 setelah pembulatan display; detail harus dijelaskan. |
| D4 | Periode tahunan demo? | Skenario 12 bulan penuh yang jelas fiktif; 2026 YTD provisional saja. |
| D5 | Kategori P1 diterapkan langsung? | Tidak. Fokus P0 Paling Diminati untuk 3 periode dahulu. |
| D6 | Cakupan website statis Vercel yang wajib hidup? | Minimum Home–Awards–Profil–History, dan fungsi existing yang ditampilkan harus jujur sebagai demo. |
| D7 | Strategi branch/PR dari eksperimen lama? | Audit dulu, revisi jika perlu, **jangan merge otomatis**. |

**Cara kerja yang disarankan:** Work merangkum D1–D7 dalam satu persetujuan singkat bila pengguna meminta implementasi; **jangan menanyakan ulang pilihan yang sudah [SETUJU]**. Setelah parameter disepakati, tulis tes gagal sebelum implementasi logic, jalankan verifikasi, dan laporkan apa yang benar-benar selesai.

### 18.3. Instruksi siap salin untuk room Work

```text
Baca file NEARASA_MASTER_WORK_HANDOFF.md ini secara UTUH sebagai sumber konteks,
terutama Bagian 0 (aturan/status), Bagian 2 (keputusan), Bagian 3 (audit repo),
Bagian 8 (formula), Bagian 14 (risiko), Bagian 15–16 (tugas dan acceptance),
serta Bagian 18 (kontradiksi/keputusan terbuka).

Tujuan: kembangkan NEARASA Awards Competition Edition untuk LOGICODIX 2026.
Aplikasi existing Laravel 13 + React/Inertia + SQLite; harus tetap aman.
Demo online disepakati berupa frontend statis interaktif di Vercel, dengan
snapshot JSON hasil perhitungan Laravel + SQLite lokal; tidak butuh real-time,
cron, database online, atau autentikasi nyata pada demo statis.

LANGKAH PERTAMA WAJIB READ-ONLY: akses repository KurioSannn/NEARASA,
cek main, cek feat/awards-demo-ranking-v1, audit test+migration yang sempat
terbuat, konfirmasi bahwa RankingCalculator dan AwardsDemoSeeder belum ada
atau laporkan jika status berubah. Identifikasi konflik spesifikasi dengan
kode saat ini. Jangan merge/rewrite main secara otomatis.

Buat rencana P0 bertahap + TDD dan ajukan D1–D7 untuk persetujuan bila belum
diberikan. Setelah disetujui, implement fixture sintetis terpisah, hybrid
calculator teruji, JSON exporter, static React demo, leaderboard, riwayat,
badge, spotlight, dan verifikasi penuh. Jangan mengklaim backend online,
peningkatan omzet, atau anti-fraud produksi. Seluruh data dan penghargaan harus
menyatakan SIMULASI. Jika suatu fitur existing tak dapat berjalan statis,
jelaskan keterbatasannya dan jangan tampilkan tombol yang menipu.

Laporkan secara eksplisit: file berubah, command & hasil tes, screenshot/alur
juri, status build Vercel, keterbatasan, dan keputusan yang masih terbuka.
```

---

## CATATAN PENUTUP

Dokumen ini berusaha mempertahankan **seluruh keputusan substantif** yang muncul selama brainstorming Awards: motivasi dan studi pembanding, strategi fairness dan cold start, tiga periode, formula hybrid, eligibility, status simulasi, multi-pos, anti-duplication, badge dan Winner's Kit, pemisahan discovery, kebutuhan frontend statis, audit repo/branch eksperimen, risiko, tes, dan instruksi operasional Work. Hal-hal yang **tidak didukung data atau belum diputuskan** ditandai secara eksplisit, bukan diselundupkan sebagai fakta.

**Jangan memasukkan angka TAM/SAM/SOM, BMC, SWOT, VPC atau proyeksi omzet tanpa dokumen/data sumber yang diverifikasi.** Tema bisnis tersebut pernah disebut sebagai kerangka analisis yang mungkin relevan, tetapi isi faktual dan angka spesifiknya **tidak tersedia secara lengkap pada sumber audit ini**; bila Work membutuhkannya untuk proposal lain, lakukan riset/sumber terpisah.

**Sumber kebenaran setelah coding dimulai:** spesifikasi yang sudah disetujui pengguna **dan kode/test aktual di branch terbaru**. Bila ditemukan perbedaan, laporkan; jangan diam-diam mengganti aturan kompetisi.
