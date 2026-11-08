import { Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { useUi } from '@/layouts/CustomerLayout';
import { catalogUrl, defaultFilters, type Filters } from '@/types/catalog';

export default function EmptyCatalog({ filters = defaultFilters, base = '/jelajah', compact = false, onFilter }: { filters?: Filters; base?: string; compact?: boolean; onFilter?: () => void }) {
  const { openLocation } = useUi();
  return <div className={'empty-state catalog-empty ' + (compact ? 'catalog-empty-compact' : '')} role="status">
    <span className="empty-state-icon"><SearchX size={36} aria-hidden="true" /></span>
    <h2>{filters.q ? 'Belum ada hasil untuk “' + filters.q + '”' : 'Belum ada pilihan yang sesuai'}</h2>
    <p>{filters.max_price !== null ? 'Coba naikkan batas harga atau cari makanan lain.' : 'Coba ubah kata pencarian, kategori, atau radiusnya.'}</p>
    <div className="empty-filter-actions">
      {onFilter ? <button type="button" className="button" onClick={onFilter}>Ubah filter</button> : <Link className="button" href={catalogUrl({ ...filters, category: null, group: null }, base)}>Lihat pilihan lain</Link>}
      {filters.q && <Link className="button button-outline" href={catalogUrl({ ...filters, q: '' }, base)}>Hapus kata pencarian</Link>}
    </div>
    <button type="button" className="text-button empty-location-action" onClick={openLocation}>Ubah titik pencarian</button>
  </div>;
}
