# DESIGN.md — NEARASA

> Arah identitas visual, filosofi merek, dan panduan desain antarmuka NEARASA.
> Dibuat sebagai acuan desain resmi untuk menjaga craftmanship dan mencegah AI slop.

---

## 1. Identitas & Karakter Merek (Brand Soul)

NEARASA (*"Good food is closer than you think"*) adalah aplikasi penemu kuliner lokal dan UMKM (warung makan, pedagang kaki lima, gerobak keliling, dan kedai kopi) di area Sidoarjo, Surabaya, dan sekitarnya.

### Karakter Visual:
* **Hangat & Bersahabat:** Mengadopsi palet terakota bumbu Nusantara dan kertas bungkus makanan hangat (`#B74A2B` dan `#FFF8F0`). Bukan aplikasi teknologi yang dingin, steril, atau gelap.
* **Jujur & Transparan:** Menonjolkan data riil: menu, harga pasti, jadwal buka/tutup aktual WIB, dan jarak garis lurus tanpa klaim palsu.
* **Ringan & Ergonomis Mobile-First:** Dirancang untuk orang yang sedang lapar di jalan—cepat dibuka, tulisan jelas terbaca di bawah terik matahari, tombol nyaman ditekan dengan jempol satu tangan.

---

## 2. Antislop Dials (Liveliness Toolkit)

```
Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
```

* **ENERGY 2 (Balanced):** Hangat dan mengundang selera (*appetizing*), kontras tajam pada nama menu dan harga, tanpa dekorasi berlebihan atau efek neon/glow.
* **RHYTHM 2 (Kontekstual & Mengalir):** Tata letak halaman mengikuti perjalanan pengguna mencari makan (Pilih Titik Lokasi $\rightarrow$ Rekomendasi Menu Untukmu $\rightarrow$ Kartu Warung Sekitar $\rightarrow$ Peta), bukan template statis AI "Hero + 3 Bento + FAQ".
* **MOTION 1 (Calm & Functional):** Transisi halus untuk navigasi tab, pembukaan modal dialog, dan respons penekanan tombol. Menghormati `prefers-reduced-motion`.

---

## 3. Palet Warna (Color System)

| Token | Nilai Hex | Fungsi |
| :--- | :--- | :--- |
| `--paper` | `#FFF8F0` | Latar belakang kanvas utama (krem hangat khas kertas bungkus/karton kuliner). |
| `--surface` | `#FFFFFF` | Permukaan kartu, panel, dan formulir (putih bersih dengan batas halus). |
| `--ink` | `#20160E` | Teks utama & heading (hitam arang hangat dengan kontras tinggi > 10:1). |
| `--muted` | `#695D53` | Teks sekunder, label jam, dan alamat (kontras WCAG AA > 4.5:1). |
| `--line` | `#E8DCD1` | Garis batas (*border*) halus pemisah komponen. |
| `--accent` | `#B74A2B` | Warna aksen utama (merah bata / terakota rempah). Digunakan selektif pada CTA primer dan penanda aktif. |
| `--soft` | `#FCEEE5` | Latar tombol sekunder dan badge aksen lembut. |
| `--open` | `#1D8348` | Status warung buka (hijau daun segar). |
| `--closed` | `#C0392B` | Status warung tutup / menu habis (merah tegas). |

### 3.1 Palet Discovery & Map (Discovery Shell)
Untuk kenyamanan navigasi geografis dan eksplorasi katalog (`/jelajah`, `/peta`), NEARASA menggunakan palet **Discovery Blue** yang bersih dan berkontras tinggi:
* `--accent`: `#3154D9` (Biru Discovery untuk pin peta, tombol aksi cari, dan penanda aktif navigasi).
* `--paper`: `#F4F7FC` (Latar kanvas sejuk untuk peta dan katalog).
* `--ink`: `#18213A` (Slate navy untuk teks tajam berkejelasan tinggi).
* `--green`: `#10B981` (Indikator status buka pada pin dan kartu).

---

## 4. Tipografi

* **Font Utama:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
* **Hierarki Ukuran & Bobot:**
  - H1: `28px – 32px` (mobile) / `36px – 40px` (desktop), `font-weight: 700`, line-height ketat `1.2`.
  - H2: `20px – 24px`, `font-weight: 650`.
  - H3: `16px – 18px`, `font-weight: 600`.
  - Body Text: `14px – 15px`, line-height nyaman `1.5 – 1.6`.
  - Caption / Microcopy: `12px – 13px`, line-height `1.4`.
* **Larangan:** Tidak menggunakan huruf *monospace* untuk teks umum, tidak menggunakan huruf kapital semua dengan jarak renggang ekstrim (*tracking*), dan tidak menggunakan karakter *em dash* (`—`).

---

## 5. Token Desain (Radius & Spacing)

### Radius:
* `--radius-sm: 8px` $\rightarrow$ Badge status, tag harga, dan kontrol mikro.
* `--radius-md: 14px` $\rightarrow$ Tombol aksi, input pencarian, dan elemen form.
* `--radius-lg: 20px` $\rightarrow$ Kartu kuliner, dialog modal, dan kontainer utama.
* `--radius-full: 9999px` $\rightarrow$ Avatar bulat dan indikator titik status.

### Elevasi / Bayangan:
* **Matte by Default:** Elemen bertumpu pada bidang datar (*ground plane*).
* **Bayangan Selektif:** Hanya digunakan pada elemen melayang riil: dialog modal (`box-shadow: 0 16px 36px rgba(32, 22, 14, 0.16)`) dan kontrol navigasi mengambang.

---

## 6. Aturan Interaksi & Tombol
* **Bebas Panah Dekoratif:** Tombol aksi tidak ditempeli ikon panah `ArrowRight` atau `→` secara sembarangan. Ikon panah miring `ArrowUpRight` hanya dipakai saat membuka tautan ke situs luar (Google Maps, WhatsApp).
* **Ukuran Target Sentuh:** Semua kontrol interaktif memiliki ukuran sentuh minimal `44px × 44px` pada perangkat bergerak.
