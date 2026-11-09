import { Link, router } from '@inertiajs/react';
import {
  SlidersHorizontal,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import SearchField from './SearchField';
import CatalogViewToggle from './CatalogViewToggle';
import { catalogUrl, rupiah, type Filters, type Options } from '@/types/catalog';

type CategoryItem = {
  key: string;
  label: string;
  image?: string;
  type: 'all' | 'category' | 'group';
};

const CATEGORY_ITEMS: CategoryItem[] = [
  { key: 'all', label: 'Semua', type: 'all' },
  { key: 'Ayam', label: 'Ayam', image: '/images/demo/rice.jpg', type: 'category' },
  { key: 'Pizza', label: 'Pizza', image: '/images/demo/pizza.jpg', type: 'category' },
  { key: 'Bakar', label: 'Bakar', image: '/images/demo/grill.jpg', type: 'category' },
  { key: 'Kopi', label: 'Kopi', image: '/images/demo/coffee.jpg', type: 'category' },
  { key: 'Segar', label: 'Segar', image: '/images/demo/salad.jpg', type: 'category' },
  { key: 'Burger', label: 'Burger', image: '/images/demo/burger.jpg', type: 'category' },
  { key: 'Mie', label: 'Mie', image: '/images/demo/noodles.jpg', type: 'category' },
  { key: 'Roti', label: 'Roti', image: '/images/demo/toast.jpg', type: 'category' },
  { key: 'Jajanan', label: 'Jajanan', image: '/images/demo/toast.jpg', type: 'group' },
  { key: 'Minuman', label: 'Minuman', image: '/images/demo/coffee.jpg', type: 'group' },
];

export default function CatalogToolbar({
  filters,
  options: _options,
  onFilter,
  map = false,
  count,
  businessCount,
}: {
  filters: Filters;
  options?: Options;
  onFilter: () => void;
  map?: boolean;
  count: number;
  businessCount?: number;
}) {
  const base = map ? '/peta' : '/jelajah';
  const isAll = !filters.group && !filters.category;
  const activeFilterCount = (filters.radius !== 'unlimited' ? 1 : 0) + (filters.max_price !== null ? 1 : 0);

  const getTargetUrl = (item: CategoryItem, isSelected: boolean) => {
    if (item.type === 'all') {
      return catalogUrl({ ...filters, group: null, category: null }, base);
    }
    if (item.type === 'group') {
      return catalogUrl({ ...filters, group: isSelected ? null : item.key, category: null }, base);
    }
    return catalogUrl({ ...filters, category: isSelected ? null : item.key, group: null }, base);
  };

  const getIsSelected = (item: CategoryItem) => {
    if (item.type === 'all') return isAll;
    if (item.type === 'group') return filters.group === item.key;
    return filters.category === item.key;
  };

  return (
    <div className="catalog-toolbar">
      {/* 1. Full-width Modern Search Bar (Tokopedia Style) */}
      <div className="catalog-search-wrap">
        <SearchField filters={filters} base={base} onFilter={onFilter} discovery />
      </div>

      {/* 2. Category Showcase: Round Appetizing Food Photography Discs (Real Food, Anti-Slop) */}
      <nav className="category-food-showcase" aria-label="Pilihan kategori kuliner">
        <div className="category-food-row">
          {CATEGORY_ITEMS.map(item => {
            const isSelected = getIsSelected(item);
            const targetUrl = getTargetUrl(item, isSelected);

            return (
              <Link
                key={item.key}
                href={targetUrl}
                className={`category-food-card ${isSelected ? 'is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="category-food-disc">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      width="68"
                      height="68"
                      loading="lazy"
                      className="category-food-img"
                    />
                  ) : (
                    <span className="category-food-icon-wrap" aria-hidden="true">
                      <UtensilsCrossed size={22} />
                    </span>
                  )}
                </span>
                <span className="category-food-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Results Header Bar: Results info + Filter action + View Switcher (Daftar / Peta) */}
      <div className="catalog-results-bar">
        <div className="catalog-results-left">
          <h2 className="catalog-results-heading">
            {filters.category
              ? `Pilihan ${filters.category}`
              : filters.group
                ? `Pilihan ${filters.group}`
                : 'Daftar Tempat Kuliner'}
          </h2>
          <span className="catalog-results-count" aria-live="polite">
            {count} lokasi{businessCount !== undefined ? ` · ${businessCount} usaha` : ''}
          </span>
        </div>

        <div className="catalog-results-right">
          {/* Active filter badges */}
          {filters.radius !== 'unlimited' && (
            <span className="active-filter-pill">
              Radius: {filters.radius.toLocaleString('id-ID')} km
              <button
                type="button"
                onClick={() => router.get(catalogUrl({ ...filters, radius: 'unlimited' }, base))}
                aria-label="Hapus batas radius"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.max_price !== null && (
            <span className="active-filter-pill">
              Maks. {rupiah(filters.max_price)}
              <button
                type="button"
                onClick={() => router.get(catalogUrl({ ...filters, max_price: null }, base))}
                aria-label="Hapus batas harga"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          )}

          {/* Deep Filter Trigger */}
          <button
            type="button"
            className={`catalog-filter-btn ${activeFilterCount > 0 ? 'has-filter' : ''}`}
            onClick={onFilter}
            aria-label="Buka filter lanjutan"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>Filter</span>
            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          </button>

          {/* View Switcher: Placed above the grid where view toggling makes complete sense */}
          <CatalogViewToggle filters={filters} map={map} />
        </div>
      </div>
    </div>
  );
}
