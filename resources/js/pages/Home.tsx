import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Award, Clock, Compass, Map, MapPin, Navigation, Search, SlidersHorizontal, Store, Utensils } from 'lucide-react';
import { useState } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import SearchField from '@/components/SearchField';
import FoodCategory from '@/components/FoodCategory';
import BusinessCard from '@/components/BusinessCard';
import TrendingBusinessCard from '@/components/TrendingBusinessCard';
import ConsumerPhoto from '@/components/ConsumerPhoto';
import FilterPanel from '@/components/FilterPanel';
import EmptyCatalog from '@/components/EmptyCatalog';
import HomeMapPreview from '@/components/HomeMapPreview';
import { cardKey, catalogUrl, type CatalogProps, type SharedProps } from '@/types/catalog';
import { groupBusinessLocations } from '@/types/consumer-pages';
import { businessCover } from '@/types/business-images';

type HomeProps = CatalogProps & {
  awardHighlight: { name: string; slug: string; photo: string | null; is_demo: boolean } | null;
};

export default function Home({ businesses, filters, options, location, recommendations = [], awardHighlight }: HomeProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { openLocation } = useUi();
  const { mapTiles, auth } = usePage<SharedProps>().props;
  const choices = groupBusinessLocations(businesses).slice(0, 3).map(group => group[0]);
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

      <section className="home-awards-banner-wrap" aria-label="Simulasi NEARASA Awards">
        <div className="home-awards-banner">
          <div className="awards-banner-content">
            <span className="awards-banner-kicker">NEARASA Awards · Simulasi</span>
            <h2 className="awards-banner-title">
              {awardHighlight ? `${awardHighlight.name} memimpin di Sidoarjo` : 'Tangga kuliner Sidoarjo dan Surabaya'}
            </h2>
            <p className="awards-banner-desc">
              {awardHighlight
                ? 'Peringkat pekan ini berdasarkan interaksi yang disimulasikan.'
                : 'Jelajahi peringkat usaha berdasarkan interaksi yang disimulasikan.'}
            </p>
            <div>
              <Link href="/awards?period=weekly&region=Sidoarjo" className="awards-banner-cta">
                <span>Lihat Klasemen Lengkap</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {awardHighlight && (
            <div className="awards-banner-photo-wrap" aria-hidden="true">
              <div className="awards-banner-photo-card">
                <img
                  src={businessCover({ ...awardHighlight, photo: awardHighlight.photo ?? '' })}
                  alt=""
                  className="awards-banner-img"
                  loading="lazy"
                />
                <div className="awards-banner-photo-caption">
                  <span className="photo-caption-rank">Peringkat 1</span>
                  <span className="photo-caption-name">{awardHighlight.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* Pilihan untuk dicoba (Restored to exact cards user loved) */}
      <section className="home-catalog home-trending-section" aria-labelledby="home-choices-title">
        <header className="home-section-heading">
          <div>
            <h2 id="home-choices-title">{location ? 'Pilihan di sekitarmu' : 'Pilihan untuk dicoba'}</h2>
            <p>Lihat menu, harga, dan lokasi tiap pos jualan.</p>
          </div>
          <Link href={catalogUrl(filters)} className="home-section-link">
            Lihat semua <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </header>
        {choices.length ? (
          <div className="home-trending-grid">
            {choices.map((business, index) => (
              <TrendingBusinessCard
                key={cardKey(business)}
                business={business}
                isHighlighted={index % 3 === 1}
              />
            ))}
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
            Lihat lokasi pos jualan, jarak garis lurus dari titik pilihanmu, dan jam buka menurut jadwal.
          </p>

          <div className="home-map-callout-points">
            <span className="map-point-chip">
              <Compass size={14} aria-hidden="true" />
              Radius fleksibel
            </span>
            <span className="map-point-chip">
              <Clock size={14} aria-hidden="true" />
              Jam buka terjadwal
            </span>
            <span className="map-point-chip">
              <Navigation size={14} aria-hidden="true" />
              Lokasi pos jualan
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

        <div className="home-map-callout-visual">
          <HomeMapPreview
            businesses={businesses}
            location={location}
            tileUrl={mapTiles}
          />
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
