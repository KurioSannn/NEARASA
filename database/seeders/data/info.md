# Folder Data Seeder Katalog (`database/seeders/data`)

Folder ini menyimpan dataset terstruktur untuk mengisi katalog usaha kuliner NEARASA di database:

- [`catalog.php`](file:///D:/NEARASA/database/seeders/data/catalog.php): 8 profil usaha inti demo (`Dapur Griya`, `Pizza Sore`, dll.) yang dipertahankan stabil untuk kebutuhan pengujian `CatalogPersistenceTest` dan `DemoAccountSeeder`.
- [`scraped_places.php`](file:///D:/NEARASA/database/seeders/data/scraped_places.php): 22 titik lokasi kuliner riil di wilayah Sidoarjo dan Surabaya hasil pengambilan data dari OpenStreetMap Overpass API lengkap dengan koordinat presisi (`latitude`, `longitude`), alamat jalan, jam operasional, daftar menu, serta kategori.
