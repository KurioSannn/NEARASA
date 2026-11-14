import { Head } from '@inertiajs/react';
import { useState } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import CatalogToolbar from '@/components/CatalogToolbar';
import BusinessCard from '@/components/BusinessCard';
import DiscoveryHeading from '@/components/DiscoveryHeading';
import FilterPanel from '@/components/FilterPanel';
import EmptyCatalog from '@/components/EmptyCatalog';
import { cardKey, type CatalogProps } from '@/types/catalog';

export default function Explore({ businesses, filters, options }: CatalogProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { isNavigating } = useUi();
  const pageTitle = filters.category
    ? `Pilihan ${filters.category}`
    : filters.group
      ? `Pilihan ${filters.group}`
      : 'Jelajah kuliner';

  return (
    <>
      <Head title={pageTitle} />
      <DiscoveryHeading title={pageTitle} />
      <CatalogToolbar
        filters={filters}
        options={options}
        onFilter={() => setFilterOpen(true)}
        count={businesses.length}
        businessCount={new Set(businesses.map(item => item.id)).size}
      />
      <section aria-label="Hasil pencarian" aria-busy={isNavigating} className="result-section">
        <span className="consumer-sr-only" role="status">
          {isNavigating ? 'Memperbarui hasil pencarian. Hasil sebelumnya tetap terlihat.' : ''}
        </span>
        {isNavigating && !businesses.length ? (
          <div className="business-grid skeleton-grid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="business-card skeleton-card animate-pulse bg-white/70 rounded-2xl p-4 border border-[#e8dcd2]">
                <div className="h-44 bg-[#eadcd2] rounded-xl mb-3" />
                <div className="h-5 bg-[#eadcd2] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#f2e7de] rounded w-1/2 mb-3" />
                <div className="h-4 bg-[#f2e7de] rounded w-full mb-1" />
              </div>
            ))}
          </div>
        ) : businesses.length ? (
          <div className={`business-grid ${isNavigating ? 'opacity-60 transition-opacity duration-200' : ''}`}>
            {businesses.map(business => (
              <BusinessCard key={cardKey(business)} business={business} />
            ))}
          </div>
        ) : (
          <EmptyCatalog filters={filters} onFilter={() => setFilterOpen(true)} />
        )}
      </section>
      {filterOpen && <FilterPanel filters={filters} options={options} onClose={() => setFilterOpen(false)} />}
    </>
  );
}

Explore.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
