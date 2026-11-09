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
        {businesses.length ? (
          <div className="business-grid">
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
