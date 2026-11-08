import { Link, usePage } from '@inertiajs/react';
import { LocateFixed, SlidersHorizontal, Tag, X } from 'lucide-react';
import SearchField from './SearchField';
import CatalogViewToggle from './CatalogViewToggle';
import { catalogUrl, rupiah, type Filters, type SharedProps } from '@/types/catalog';

export default function CatalogToolbar({ filters, onFilter, map = false, count, businessCount }: { filters: Filters; onFilter: () => void; map?: boolean; count: number; businessCount?: number }) {
  const base = map ? '/peta' : '/jelajah';
  const { location } = usePage<SharedProps>().props;
  return <div className="catalog-toolbar">
    <div className="catalog-toolbar-main"><SearchField filters={filters} base={base} onFilter={onFilter} discovery /><CatalogViewToggle filters={filters} map={map} /></div>
    <div className="catalog-filter-summary">
      <button className="chip" type="button" onClick={onFilter}><SlidersHorizontal size={16} aria-hidden="true" />Filter</button>
      <button className={'chip radius-chip' + (!location ? ' radius-inactive' : '')} type="button" onClick={onFilter} aria-label="Ubah radius pencarian">
        <LocateFixed size={17} aria-hidden="true" /><span>{filters.radius === 'unlimited' ? 'Tanpa batas' : filters.radius.toLocaleString('id-ID') + ' km'}{!location && filters.radius !== 'unlimited' && <small>Belum aktif</small>}</span>
      </button>
      {filters.max_price !== null && <button type="button" className="chip price-chip" onClick={onFilter}><Tag size={17} aria-hidden="true" />Maks. {rupiah(filters.max_price)}</button>}
      {filters.group && <Link className="chip" href={catalogUrl({ ...filters, group: null }, base)}>{filters.group}<X size={13} aria-hidden="true" /><span className="consumer-sr-only">Hapus kelompok</span></Link>}
      {filters.category && <Link className="chip" href={catalogUrl({ ...filters, category: null }, base)}>{filters.category}<X size={13} aria-hidden="true" /><span className="consumer-sr-only">Hapus kategori</span></Link>}
      <span className="result-count" aria-live="polite">{count} lokasi{businessCount !== undefined && ' · ' + businessCount + ' usaha'}</span>
    </div>
  </div>;
}
