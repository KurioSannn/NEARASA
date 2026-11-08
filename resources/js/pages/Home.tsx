import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Clock3, FileText, Map, MapPin, Search, SlidersHorizontal, Store } from 'lucide-react';
import { useState } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import SearchField from '@/components/SearchField';
import FoodCategory from '@/components/FoodCategory';
import { FavoriteControl } from '@/components/DiscoveryResultCard';
import ConsumerPhoto from '@/components/ConsumerPhoto';
import FilterPanel from '@/components/FilterPanel';
import EmptyCatalog from '@/components/EmptyCatalog';
import { businessCover } from '@/types/business-images';
import { allMenusSoldOut, cardKey, catalogUrl, distanceLabel, rupiah, type BusinessCardData, type CatalogProps } from '@/types/catalog';
import { businessDetailUrl, groupBusinessLocations } from '@/types/consumer-pages';
import { postStatus } from '@/components/business-profile/profile-utils';

function HomeChoice({ business }: { business: BusinessCardData }) {
  const { url } = usePage();
  const href = businessDetailUrl(business, url);
  return <article className="home-choice"><div className="home-choice-cover"><Link href={href} tabIndex={-1} aria-hidden="true"><ConsumerPhoto src={businessCover(business)} /></Link><FavoriteControl business={business} /></div><div className="home-choice-body"><h3><Link href={href}>{business.name}</Link></h3><p className="home-choice-post">{business.post.name}</p><p className={`home-choice-status${business.is_open ? ' is-open' : ''}`}><span aria-hidden="true" />{postStatus(business.post)}</p><p className="home-choice-place"><MapPin size={13} aria-hidden="true" /><span>{business.distance !== null ? `${distanceLabel(business.distance)} dari titik pilihan` : business.post.address}</span></p><p className="home-choice-price">{allMenusSoldOut(business) ? 'Menu sedang habis' : <>Mulai <strong>{rupiah(business.min_price)}</strong></>}</p><Link href={href} className="home-choice-open">Lihat menu<ArrowRight size={15} aria-hidden="true" /></Link></div></article>;
}

export default function Home({ businesses, filters, options, location, recommendations = [] }: CatalogProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { openLocation } = useUi();
  const choices = groupBusinessLocations(businesses).slice(0, 4).map(group => group[0]);
  const personal = groupBusinessLocations(recommendations).slice(0, 4).map(group => group[0]);
  return <><Head title="Kuliner lokal, lebih dekat" /><div className="home-overview"><section className="home-hero" aria-labelledby="home-title"><div className="home-hero-copy"><h1 id="home-title">Kuliner lokal,<br />lebih dekat.</h1><p>Temukan warung dan pos jualan di sekitarmu. Cek menu, harga, dan jam buka sebelum berangkat.</p><div className="home-hero-actions"><Link href="/jelajah" className="home-primary"><Search size={18} aria-hidden="true" />Jelajahi kuliner</Link><Link href="/peta" className="home-secondary"><Map size={18} aria-hidden="true" />Lihat peta</Link></div></div><ConsumerPhoto className="home-hero-food" src="/images/brand/nearasa-food-hero-v1.png" eager /><span className="home-hero-orbit" aria-hidden="true" /></section>
    <section className="home-search-area" aria-label="Cari kuliner"><div className="home-search-controls"><SearchField filters={filters} discovery /><button type="button" className="home-filter-control" aria-label="Buka filter makanan" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={22} aria-hidden="true" /></button></div><button className="home-origin" type="button" onClick={openLocation}><MapPin size={16} aria-hidden="true" /><span>{location?.label ?? 'Pilih lokasi untuk melihat pilihan terdekat'}</span><span className="home-origin-action">{location ? 'Ubah' : 'Pilih lokasi'}</span></button></section></div>
    <div className="home-body"><section className="home-category-section" aria-label="Pilih kategori"><FoodCategory categories={options.categories} filters={filters} /></section>
    {personal.length > 0 && <section className="home-catalog" aria-labelledby="home-personal-title"><header className="home-section-heading"><div><h2 id="home-personal-title">Untukmu</h2><p>Pilihan dari aktivitasmu di NEARASA, bersama rasa baru untuk dicoba.</p></div></header><div className="home-choice-grid">{personal.map(business => <HomeChoice key={cardKey(business)} business={business} />)}</div></section>}
    <section className="home-catalog" aria-labelledby="home-choices-title"><header className="home-section-heading"><h2 id="home-choices-title">{location ? 'Pilihan di sekitarmu' : 'Pilihan untuk dicoba'}</h2><Link href={catalogUrl(filters)} className="home-section-link">Lihat semua<ArrowRight size={16} aria-hidden="true" /></Link></header>{choices.length ? <div className="home-choice-grid">{choices.map(business => <HomeChoice key={cardKey(business)} business={business} />)}</div> : <EmptyCatalog filters={filters} base="/" />}</section>
    <section className="home-benefits" aria-labelledby="home-benefits-title"><h2 id="home-benefits-title">Kenali tempatnya<br />sebelum berangkat.</h2><ul><li><FileText size={25} aria-hidden="true" /><span>Cek menu<br />dan harga</span></li><li><Clock3 size={25} aria-hidden="true" /><span>Lihat pos<br />dan jam jualan</span></li><li><Map size={25} aria-hidden="true" /><span>Buka peta atau<br />hubungi penjual</span></li></ul></section>
    <section className="home-merchant-callout" aria-labelledby="home-merchant-title"><div><h2 id="home-merchant-title">Punya usaha kuliner?</h2><p>Atur profil, menu, dan jadwal jualanmu.</p></div><Link href="/kelola-usaha" className="button"><Store size={18} aria-hidden="true" />Kelola usaha<ArrowRight size={16} aria-hidden="true" /></Link><img src="/images/demo/places/dapur-griya.png" width={260} height={150} loading="lazy" alt="" /></section>
    </div>{filterOpen && <FilterPanel filters={filters} options={options} onClose={() => setFilterOpen(false)} />}
  </>;
}
Home.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
