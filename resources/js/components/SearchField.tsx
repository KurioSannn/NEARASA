import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Dialog from './Dialog';
import { parseSearchIntent } from './search-intent';
import Button from './Button';
import { catalogUrl, rupiah, type Filters } from '@/types/catalog';

export default function SearchField({
  filters,
  onFilter,
  base = '/jelajah',
  discovery = false,
}: {
  filters: Filters;
  onFilter?: () => void;
  base?: string;
  discovery?: boolean;
}) {
  const [q, setQ] = useState(filters.q);
  const [budgetQuery, setBudgetQuery] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQ(filters.q);
  }, [filters.q]);

  const search = useCallback((query: string, maxPrice: number | null, replace = false) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    router.get(
      catalogUrl({ ...filters, q: query, max_price: maxPrice }, base),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace,
        onStart: () => setPending(true),
        onFinish: () => setPending(false),
        onSuccess: () => setBudgetQuery(null),
      }
    );
  }, [base, filters]);

  // Wait for typing to pause before updating discovery results.
  useEffect(() => {
    if (!discovery) return;
    if (q === filters.q) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const intent = parseSearchIntent(q);
      const price = intent.maxPrice ?? filters.max_price;
      if (!intent.chooseBudget && (intent.q !== filters.q || price !== filters.max_price)) {
        search(intent.q, price, true);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [q, discovery, filters.q, filters.max_price, search]);

  const handleClear = () => {
    setQ('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    search('', filters.max_price, true);
  };

  return (
    <>
      <form
        className={'search-field' + (discovery ? ' discovery-search-field' : '')}
        role="search"
        aria-busy={pending}
        onSubmit={event => {
          event.preventDefault();
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
          }
          const intent = parseSearchIntent(q);
          if (intent.chooseBudget) {
            setBudgetQuery(intent.q);
          } else {
            search(intent.q, intent.maxPrice ?? filters.max_price);
          }
        }}
      >
        {discovery ? (
          <Search className="search-leading-icon" size={22} aria-hidden="true" />
        ) : (
          <button
            className="search-submit"
            aria-label={pending ? 'Mencari makanan' : 'Cari makanan'}
            type="submit"
            disabled={pending}
          >
            <Search size={21} aria-hidden="true" />
          </button>
        )}
        <input
          type="search"
          aria-label="Cari makanan atau nama usaha"
          placeholder={discovery ? 'Cari makanan atau usaha' : 'Lagi ingin makan apa?'}
          value={q}
          maxLength={100}
          onChange={event => setQ(event.target.value)}
        />
        {discovery && q && (
          <button
            type="button"
            className="search-clear"
            aria-label="Kosongkan isian pencarian"
            onClick={handleClear}
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {discovery && (
          <button type="submit" className="discovery-search-submit" disabled={pending}>
            {pending ? 'Mencari…' : 'Cari'}
          </button>
        )}
        {!discovery && onFilter && (
          <button
            type="button"
            className="filter-trigger"
            aria-label="Buka filter"
            onClick={onFilter}
          >
            <SlidersHorizontal size={20} aria-hidden="true" />
          </button>
        )}
      </form>
      {budgetQuery !== null && (
        <Dialog title="Pilih batas harga menumu" onClose={() => setBudgetQuery(null)}>
          <div className="budget-prompt">
            <p>
              Murah yang pas untukmu sampai berapa? Pilihan ini menjadi batas harga menu dan bisa kamu ubah dari filter.
            </p>
            <div className="budget-options">
              {[15000, 20000, 30000].map(price => (
                <Button
                  key={price}
                  className="button-outline"
                  type="button"
                  disabled={pending}
                  onClick={() => search(budgetQuery, price)}
                >
                  Maksimal {rupiah(price)}
                </Button>
              ))}
            </div>
            <span className="consumer-pending" role="status">
              {pending ? 'Mencari pilihan sesuai anggaran…' : ''}
            </span>
          </div>
        </Dialog>
      )}
    </>
  );
}
