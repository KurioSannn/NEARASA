import { Link } from '@inertiajs/react';
import { List, Map } from 'lucide-react';
import { catalogUrl, type Filters } from '@/types/catalog';

export default function CatalogViewToggle({ filters, map = false }: { filters: Filters; map?: boolean }) {
  return <nav className="catalog-view-toggle" aria-label="Tampilan pencarian">
    <Link href={catalogUrl(filters)} aria-current={!map ? 'page' : undefined}><List size={16} aria-hidden="true" />Daftar</Link>
    <Link href={catalogUrl(filters, '/peta')} aria-current={map ? 'page' : undefined}><Map size={16} aria-hidden="true" />Peta</Link>
  </nav>;
}
