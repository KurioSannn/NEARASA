# Dokumentasi H32 (TECH 2) - Scraping Peta Asli Sidoarjo & Surabaya, Seeder DB Lengkap & Pembersihan Hardcode

Dokumentasi ini mencatat pengerjaan **TECH 2** untuk memperkaya isi database (agar halaman Peta, Beranda, Jelajah, Dashboard Merchant, dan Profil Usaha tidak kosong saat demo atau deploy Render + Supabase) serta membersihkan sisa tautan/batas hardcode.

---

## 1. Perubahan yang Dilakukan

1. **Data Peta Kuliner Hasil Scraping OpenStreetMap ([`scraped_places.php`](file:///D:/NEARASA/database/seeders/data/scraped_places.php) & [`ScrapedMapCatalogSeeder.php`](file:///D:/NEARASA/database/seeders/ScrapedMapCatalogSeeder.php))**:
   - Mengambil 22 lokasi kuliner riil (11 di Sidoarjo: *Gado Gado Bu Ninik*, *Bakso Solo H. Kasan*, *Nasi Goreng Pak Mun & Jus*, *Warung Sudi Mampir*, *Kedai Tikungan Sidokumpul*, *Depot Tiara*, *Kedai Klinik Gading Fajar*, *Warkop Jenggolo*, *Toby's Chicken Kalijaten*, *Bakso 88 Waru*, *Bebek Juara Waru*; dan 11 di Surabaya: *Rawon Calculator Bungkul*, *Rawon Setan Embong Malang*, *Gudeg Bu Toegijo Gubeng*, *Bebek Goreng Hj. Slamet Bali*, *Lamongan Indah Karang Menjangan*, *Mie Ayam Lumayan Rungkut*, *Historica Coffee & Pastry*, *Kacang Ijo Pucang Anom*, *Pecel Kebon Rojo*, *Aiola Eatery Slamet*, *Warkop Nobar Surabaya Barat*) dari OpenStreetMap Overpass API.
   - Setiap usaha dilengkapi koordinat `latitude`/`longitude` asli, alamat jalan, jadwal mingguan 7 hari, layanan (`service_options`), fasilitas (`facilities`), metode pembayaran (`payment_methods`), serta menu berfoto lokal valid di `/images/demo/`.
   - Tetap menjaga [`CatalogSeeder.php`](file:///D:/NEARASA/database/seeders/CatalogSeeder.php) (8 usaha inti) tetap utuh agar [`CatalogPersistenceTest.php`](file:///D:/NEARASA/tests/Feature/CatalogPersistenceTest.php) tidak terganggu.

2. **Seeder Komunitas & Interaksi Anti-Kosong ([`DemoEngagementSeeder.php`](file:///D:/NEARASA/database/seeders/DemoEngagementSeeder.php))**:
   - Mengisi akun pengulas demo (`post_reviews`), kabar terbaru usaha (`business_updates`), galeri foto (`business_photos`), interaksi 7 hari terakhir (`interaction_events` untuk `profile_view`, `menu_open`, `map_click`, `whatsapp_click`), dan 1 contoh laporan selesai (`closed_reports`) secara idempoten.
   - Menghubungkan `ScrapedMapCatalogSeeder`, `DemoEngagementSeeder`, dan `AwardsDemoSeeder` ke dalam [`DatabaseSeeder.php`](file:///D:/NEARASA/database/seeders/DatabaseSeeder.php).

3. **Pembersihan Hardcode & Penyesuaian Area/Peta**:
   - Memperbarui tautan `/akun` yang tersisa di [`RightWalletSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/RightWalletSidebar.tsx) dan [`TodayPostsTable.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TodayPostsTable.tsx) agar mengarah ke `/kelola-usaha/setelan?tab=owner`.
   - Memperbesar batas pin pratinjau peta beranda pada [`HomeMapPreview.tsx`](file:///D:/NEARASA/resources/js/components/HomeMapPreview.tsx) dari 8 menjadi 30 titik.
   - Menambahkan area pencarian populer baru (*Alun-Alun Sidoarjo*, *Waru, Sidoarjo*, *Taman Bungkul / Darmo, Surabaya*, *Gubeng / Manyar, Surabaya*) pada [`CatalogOptions.php`](file:///D:/NEARASA/app/Services/CatalogOptions.php) setelah 4 area awal.

---

## 2. File yang Terdampak

1. [`database/seeders/data/scraped_places.php`](file:///D:/NEARASA/database/seeders/data/scraped_places.php)
2. [`database/seeders/data/info.md`](file:///D:/NEARASA/database/seeders/data/info.md)
3. [`database/seeders/ScrapedMapCatalogSeeder.php`](file:///D:/NEARASA/database/seeders/ScrapedMapCatalogSeeder.php)
4. [`database/seeders/DemoEngagementSeeder.php`](file:///D:/NEARASA/database/seeders/DemoEngagementSeeder.php)
5. [`database/seeders/DatabaseSeeder.php`](file:///D:/NEARASA/database/seeders/DatabaseSeeder.php)
6. [`app/Services/CatalogOptions.php`](file:///D:/NEARASA/app/Services/CatalogOptions.php)
7. [`resources/js/components/HomeMapPreview.tsx`](file:///D:/NEARASA/resources/js/components/HomeMapPreview.tsx)
8. [`resources/js/components/merchant/dashboard/RightWalletSidebar.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/RightWalletSidebar.tsx)
9. [`resources/js/components/merchant/dashboard/TodayPostsTable.tsx`](file:///D:/NEARASA/resources/js/components/merchant/dashboard/TodayPostsTable.tsx)
10. [`dokumentasi/H32/info.md`](file:///D:/NEARASA/dokumentasi/H32/info.md)

---

## 3. Hasil Verifikasi

- **Idempotensi Database Seeder (`php artisan db:seed` x2)**: Sukses tanpa error (`businesses`: 31, `posts`: 32, `menus`: 63, `reviews`: 78, `updates`: 31, `photos`: 32, `interactions`: 672, `award_demo_events`: 18755).
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Lulus tanpa error (exit code 0).
- **Frontend Node Tests (`node --test tests/Frontend/*.test.mjs`)**: 13 tests, 13 passed.
- **PHPUnit Full Suite (`php artisan test`)**: 126 tests, 126 passed, 1631 assertions (133562 ms).
