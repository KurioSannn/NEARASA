import { Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { useUi } from '@/layouts/CustomerLayout';
import { catalogUrl, defaultFilters, type Filters } from '@/types/catalog';

export default function EmptyCatalog({
  filters = defaultFilters,
  base = '/jelajah',
  compact = false,
  onFilter,
}: {
  filters?: Filters;
  base?: string;
  compact?: boolean;
  onFilter?: () => void;
}) {
  const { openLocation } = useUi();
  const hasActiveFilters = Boolean(
    filters.q ||
    filters.category ||
    filters.group ||
    filters.max_price !== null ||
    filters.radius !== 'unlimited'
  );

  return (
    <div className={'empty-state catalog-empty ' + (compact ? 'catalog-empty-compact' : '')} role="status">
      <span className="empty-state-icon">
        <SearchX size={36} aria-hidden="true" />
      </span>
      <h2>
        {filters.q
          ? `Belum ada kuliner yang cocok dengan "${filters.q}"`
          : 'Belum ada kuliner yang sesuai filter'}
      </h2>
      <p>
        {filters.max_price !== null
          ? 'Coba naikkan batas anggaran harga atau cari jenis makanan lainnya.'
          : 'Coba gunakan kata kunci lain atau ubah filter untuk menemukan lebih banyak pilihan kuliner terdekat.'}
      </p>
      <div className="empty-filter-actions">
        {filters.q && (
          <Link className="button button-outline" href={catalogUrl({ ...filters, q: '' }, base)}>
            Hapus pencarian
          </Link>
        )}
        {onFilter ? (
          <button type="button" className="button" onClick={onFilter}>
            Ubah filter
          </button>
        ) : null}
        {hasActiveFilters && (
          <Link className="button button-outline" href={base}>
            Lihat semua kuliner
          </Link>
        )}
      </div>
      <button type="button" className="text-button empty-location-action" onClick={openLocation}>
        Ubah titik lokasi pencarian
      </button>
    </div>
  );
}
