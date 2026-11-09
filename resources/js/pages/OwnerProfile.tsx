import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, Store, UserCheck } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import BusinessLocationsCard from '@/components/BusinessLocationsCard';
import { groupBusinessLocations, publicOwnerBackUrl } from '@/types/consumer-pages';
import type { BusinessCardData, PublicOwner } from '@/types/catalog';

export default function OwnerProfile({ owner, businesses }: { owner: PublicOwner; businesses: BusinessCardData[] }) {
  const { url } = usePage();
  const groups = groupBusinessLocations(businesses);
  const back = publicOwnerBackUrl(new URLSearchParams(url.split('?')[1] ?? '').get('from'));

  return (
    <>
      <Head title={`Profil Pemilik · ${owner.public_name}`} />
      <div className="consumer-collection-page owner-profile-page">
        <div className="collection-back-wrap">
          <Link className="collection-back-pill" href={back}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{back.startsWith('/usaha/') ? 'Kembali ke profil usaha' : 'Kembali ke jelajah'}</span>
          </Link>
        </div>

        {/* Curated Owner Identity Card */}
        <header className="consumer-owner-hero">
          <div className="owner-hero-top">
            <span className="owner-avatar" aria-hidden="true">
              {owner.public_name.charAt(0).toLocaleUpperCase('id-ID')}
            </span>
            <div className="owner-hero-identity">
              <div className="owner-tag-row">
                <span className="owner-mitra-badge">
                  <UserCheck size={12} aria-hidden="true" />
                  <span>Mitra Kuliner Terdaftar</span>
                </span>
                <span className="owner-city-badge">
                  <MapPin size={12} aria-hidden="true" />
                  <span>Sidoarjo & Surabaya</span>
                </span>
              </div>
              <h1>{owner.public_name}</h1>
              <p className="owner-hero-bio">
                Pengelola aneka pilihan kuliner lokal di NEARASA. Kunjungi gerai langsung atau intip menu terfavorit.
              </p>
            </div>
          </div>

          <div className="owner-stats-bar">
            <div className="owner-stat-item">
              <Store size={18} className="stat-icon" aria-hidden="true" />
              <div>
                <strong>{groups.length} Usaha</strong>
                <span>Merek kuliner aktif</span>
              </div>
            </div>
            <div className="owner-stat-item">
              <MapPin size={18} className="stat-icon" aria-hidden="true" />
              <div>
                <strong>{businesses.length} Titik Pos</strong>
                <span>Gerai & cabang jualan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Section: Usaha yang Dikelola */}
        <section className="owner-businesses-section" aria-labelledby="public-owner-businesses-title">
          <div className="owner-section-heading">
            <div>
              <h2 className="collection-section-title" id="public-owner-businesses-title">
                Usaha Kuliner yang Dikelola
              </h2>
              <p className="collection-section-sub">
                Pilih salah satu usaha di bawah untuk melihat rincian daftar menu, foto, dan jadwal buka setiap gerai.
              </p>
            </div>
            <span className="owner-businesses-counter">{groups.length} usaha</span>
          </div>

          {groups.length ? (
            <div className="business-location-grid">
              {groups.map(locations => (
                <BusinessLocationsCard key={locations[0].id} locations={locations} />
              ))}
            </div>
          ) : (
            <div className="collection-empty">
              <Store size={36} aria-hidden="true" />
              <h3>Belum ada lokasi yang dapat ditampilkan</h3>
              <p>Lokasi usaha yang tersedia di katalog akan muncul di sini.</p>
              <Link className="button" href="/jelajah">
                Lanjut menjelajah
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

OwnerProfile.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
