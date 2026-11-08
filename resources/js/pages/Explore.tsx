import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useState } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import CatalogToolbar from '@/components/CatalogToolbar';
import BusinessCard from '@/components/BusinessCard';
import DiscoveryResultCard from '@/components/DiscoveryResultCard';
import DiscoveryHeading from '@/components/DiscoveryHeading';
import FilterPanel from '@/components/FilterPanel';
import EmptyCatalog from '@/components/EmptyCatalog';
import { categoryImages } from '@/components/FoodCategory';
import { cardKey, type CatalogProps } from '@/types/catalog';

export default function Explore({ businesses, filters, options, location }: CatalogProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { openLocation, isNavigating } = useUi();
  const categoryView = filters.category && !filters.q;
  const image = filters.category ? categoryImages[filters.category] : null;
  return <><Head title={filters.category ? 'Pilihan ' + filters.category : 'Jelajah kuliner'} />
    {categoryView && image ? <div className="discovery-category-cover"><img src={'/images/demo/' + image + '.jpg'} alt="" width="1200" height="400" /><Link className="icon-button" href="/jelajah" aria-label="Kembali ke semua pilihan"><ArrowLeft /></Link><h1>Pilihan {filters.category}</h1></div> : <DiscoveryHeading title="Jelajah kuliner" />}
    <CatalogToolbar filters={filters} onFilter={() => setFilterOpen(true)} count={businesses.length} businessCount={new Set(businesses.map(item => item.id)).size} />
    {!location && <section className="discovery-location-prompt" aria-label="Titik pencarian belum dipilih"><span className="location-prompt-icon"><MapPin size={26} aria-hidden="true" /></span><div><h2>Cari yang dekat denganmu</h2><p>Pilih titik pencarian untuk melihat jarak{filters.radius === 'unlimited' ? '.' : ' dan memakai radius ' + filters.radius.toLocaleString('id-ID') + ' km.'}</p><small>Kamu tetap bisa melihat usaha tanpa memilih lokasi.</small></div><button type="button" className="button" onClick={openLocation}>Pilih titik pencarian</button></section>}
    <section aria-label="Hasil pencarian" aria-busy={isNavigating} className="result-section">
      <span className="consumer-sr-only" role="status">{isNavigating ? 'Memperbarui hasil pencarian. Hasil sebelumnya tetap terlihat.' : ''}</span>
      {businesses.length ? <div className={categoryView ? 'business-grid' : 'discovery-result-list'}>{businesses.map(business => categoryView ? <BusinessCard key={cardKey(business)} business={business} /> : <DiscoveryResultCard key={cardKey(business)} business={business} noOrigin={!location} />)}</div> : <EmptyCatalog filters={filters} onFilter={() => setFilterOpen(true)} />}
    </section>
    {filterOpen && <FilterPanel filters={filters} options={options} onClose={() => setFilterOpen(false)} />}
  </>;
}
Explore.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
