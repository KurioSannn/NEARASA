import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock, Compass, Map, MapPin, Navigation, Search, SlidersHorizontal, Store, Utensils } from 'lucide-react';
import { useState } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import SearchField from '@/components/SearchField';
import FoodCategory from '@/components/FoodCategory';
import BusinessCard from '@/components/BusinessCard';
import ConsumerPhoto from '@/components/ConsumerPhoto';
import FilterPanel from '@/components/FilterPanel';
import EmptyCatalog from '@/components/EmptyCatalog';
import { cardKey, catalogUrl, type CatalogProps } from '@/types/catalog';
import { groupBusinessLocations } from '@/types/consumer-pages';

export default function Home({ businesses, filters, options, location, recommendations = [] }: CatalogProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { openLocation } = useUi();
  const choices = groupBusinessLocations(businesses).slice(0, 4).map(group => group[0]);
  const personal = groupBusinessLocations(recommendations).slice(0, 4).map(group => group[0]);

  return <>
    <Head title="Kuliner lokal, lebih dekat" />
    <div className="home-overview">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title">Kuliner lokal,<br />lebih dekat.</h1>
          <p>Temukan warung dan pos jualan di sekitarmu. Cek menu, harga, dan jam buka sebelum berangkat.</p>
          <div className="home-hero-actions">
            <Link href="/jelajah" className="home-primary">
              <Search size={18} aria-hidden="true" />
              Jelajahi kuliner
            </Link>
            <Link href="/peta" className="home-secondary">
              <Map size={18} aria-hidden="true" />
              Lihat peta
            </Link>
          </div>
        </div>
        <ConsumerPhoto className="home-hero-food" src="/images/brand/nearasa-food-hero-v1.png" alt="Ilustrasi sajian kuliner khas lokal" eager />
      </section>

      <section className="home-search-area" aria-label="Cari kuliner">
        <div className="home-search-controls">
          <SearchField filters={filters} discovery />
          <button type="button" className="home-filter-control" aria-label="Buka filter makanan" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal size={22} aria-hidden="true" />
          </button>
        </div>
        <button className="home-origin" type="button" onClick={openLocation}>
          <MapPin size={16} aria-hidden="true" />
          <span>{location?.label ?? 'Pilih lokasi untuk melihat pilihan terdekat'}</span>
          <span className="home-origin-action">{location ? 'Ubah' : 'Pilih lokasi'}</span>
        </button>
      </section>
    </div>

    <div className="home-body">
      <section className="home-category-section" aria-label="Pilih kategori">
        <FoodCategory categories={options.categories} filters={filters} />
      </section>

      {personal.length > 0 && (
        <section className="home-catalog" aria-labelledby="home-personal-title">
          <header className="home-section-heading">
            <div>
              <h2 id="home-personal-title">Untukmu</h2>
              <p>Pilihan dari aktivitasmu di NEARASA, bersama rasa baru untuk dicoba.</p>
            </div>
            <Link href={catalogUrl(filters)} className="home-section-link">
              Lihat semua <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>
          <div className="business-grid">
            {personal.map(business => <BusinessCard key={cardKey(business)} business={business} />)}
          </div>
        </section>
      )}

      <section className="home-catalog" aria-labelledby="home-choices-title">
        <header className="home-section-heading">
          <div>
            <h2 id="home-choices-title">{location ? 'Pilihan di sekitarmu' : 'Pilihan untuk dicoba'}</h2>
            <p>Rekomendasi gerai & warung kuliner terdekat siap santap hari ini.</p>
          </div>
          <Link href={catalogUrl(filters)} className="home-section-link">
            Lihat semua <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </header>
        {choices.length ? (
          <div className="business-grid">
            {choices.map(business => <BusinessCard key={cardKey(business)} business={business} />)}
          </div>
        ) : (
          <EmptyCatalog filters={filters} base="/" />
        )}
      </section>

      <section className="home-map-callout" aria-labelledby="home-map-callout-title">
        <div className="home-map-callout-content">
          <span className="home-map-callout-kicker">Peta Kuliner Interaktif</span>
          <h2 id="home-map-callout-title">Cari tempat makan terdekat langsung di peta</h2>
          <p className="home-map-callout-desc">
            Lihat sebaran warung dan rombong yang sedang buka hari ini di sekitarmu, lengkap dengan jarak tempuh, rute presisi, dan ketersediaan menu.
          </p>

          <div className="home-map-callout-points">
            <span className="map-point-chip">
              <Compass size={14} aria-hidden="true" />
              Radius fleksibel
            </span>
            <span className="map-point-chip">
              <Clock size={14} aria-hidden="true" />
              Jadwal buka aktual
            </span>
            <span className="map-point-chip">
              <Navigation size={14} aria-hidden="true" />
              Rute langsung
            </span>
          </div>

          <div className="home-map-callout-action">
            <Link href="/peta" className="home-map-callout-btn">
              <Map size={18} aria-hidden="true" />
              <span>Buka Peta Kuliner</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="home-map-callout-visual" aria-hidden="true">
          <div className="mock-map-canvas">
            <div className="mock-map-roads" />
            
            <div className="mock-map-center">
              <div className="mock-center-dot" />
              <div className="mock-center-pulse" />
            </div>

            <div className="mock-map-pin pin-1">
              <span className="mock-pin-disc">
                <Utensils size={13} />
              </span>
              <div className="mock-pin-card">
                <strong>Dapur Griya</strong>
                <small>&middot; 783 m</small>
              </div>
            </div>

            <div className="mock-map-pin pin-2">
              <span className="mock-pin-disc">
                <Utensils size={13} />
              </span>
              <div className="mock-pin-card">
                <strong>Pizza Sore</strong>
                <small className="pin-open-tag">Buka</small>
              </div>
            </div>

            <div className="mock-map-pin pin-3">
              <span className="mock-pin-disc">
                <Store size={13} />
              </span>
              <div className="mock-pin-card">
                <strong>Burger Pos</strong>
                <small>&middot; 1,2 km</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-merchant-callout" aria-labelledby="home-merchant-title">
        <div>
          <h2 id="home-merchant-title">Punya usaha kuliner?</h2>
          <p>Atur profil, menu, dan jadwal jualanmu langsung di NEARASA.</p>
        </div>
        <Link href="/kelola-usaha" className="button">
          <Store size={18} aria-hidden="true" />
          Kelola usaha
        </Link>
        <img src="/images/demo/places/dapur-griya.png" width={260} height={150} loading="lazy" alt="Ilustrasi etalase gerai kuliner" />
      </section>
    </div>

    {filterOpen && <FilterPanel filters={filters} options={options} onClose={() => setFilterOpen(false)} />}
  </>;
}
Home.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
