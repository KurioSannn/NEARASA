import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import Dialog from './Dialog';
import { catalogUrl, defaultFilters, rupiah, type Filters, type Options } from '@/types/catalog';

interface FilterPanelProps {
  filters: Filters;
  options: Options;
  onClose: () => void;
  base?: string;
}

const PRICE_PRESETS: { label: string; value: number | null }[] = [
  { label: 'Semua', value: null },
  { label: '≤ 20 rb', value: 20000 },
  { label: '≤ 35 rb', value: 35000 },
  { label: '≤ 50 rb', value: 50000 },
  { label: '≤ 75 rb', value: 75000 },
];

const RADIUS_PRESETS: { label: string; value: number | 'unlimited' }[] = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'Tanpa batas', value: 'unlimited' },
];

export default function FilterPanel({ filters, options, onClose, base = '/jelajah' }: FilterPanelProps) {
  const [draft, setDraft] = useState<Filters>(filters);
  const [pending, setPending] = useState(false);

  const activeCount =
    (draft.group ? 1 : 0) +
    (draft.category ? 1 : 0) +
    (draft.max_price !== null ? 1 : 0) +
    (draft.radius !== defaultFilters.radius ? 1 : 0);

  const isDirty =
    draft.group !== null ||
    draft.category !== null ||
    draft.max_price !== null ||
    draft.radius !== defaultFilters.radius;

  const resetAll = () => {
    setDraft({ ...defaultFilters, q: filters.q });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.get(
      catalogUrl(draft, base),
      {},
      {
        onStart: () => setPending(true),
        onFinish: () => setPending(false),
        onSuccess: onClose,
      }
    );
  };

  return (
    <Dialog title="Filter" onClose={onClose} className="dialog-ref-filter">
      <form className="ref-filter-form" onSubmit={handleSubmit}>
        <div className="ref-filter-body">
          {/* Section 1: Jenis Kuliner */}
          <section className="ref-filter-section">
            <h3 className="ref-section-title">Jenis Kuliner</h3>
            <div className="ref-pills-row" role="group" aria-label="Pilih jenis kuliner">
              {[null, ...options.groups].map(group => {
                const isSelected = draft.group === group;
                return (
                  <button
                    type="button"
                    key={group ?? 'all-groups'}
                    className={`ref-pill ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => setDraft(prev => ({ ...prev, group: isSelected && group !== null ? null : group }))}
                  >
                    <span className="ref-pill-radio" aria-hidden="true">
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="ref-pill-label">{group ?? 'Semua'}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Kategori Menu */}
          <section className="ref-filter-section">
            <h3 className="ref-section-title">Kategori Menu</h3>
            <div className="ref-pills-row wrap" role="group" aria-label="Pilih kategori menu">
              {[null, ...options.categories].map(category => {
                const isSelected = draft.category === category;
                return (
                  <button
                    type="button"
                    key={category ?? 'all-categories'}
                    className={`ref-pill ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() =>
                      setDraft(prev => ({ ...prev, category: isSelected && category !== null ? null : category }))
                    }
                  >
                    <span className="ref-pill-radio" aria-hidden="true">
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="ref-pill-label">{category ?? 'Semua'}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Batas Harga */}
          <section className="ref-filter-section">
            <div className="ref-section-header-row">
              <h3 className="ref-section-title">Batas Harga Menu</h3>
              <span className="ref-section-value">
                {draft.max_price === null ? 'Tanpa batas' : `Maks. ${rupiah(draft.max_price)}`}
              </span>
            </div>

            <div className="ref-presets-wrap">
              {PRICE_PRESETS.map(preset => {
                const isSelected = draft.max_price === preset.value;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={`ref-pill ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => setDraft(prev => ({ ...prev, max_price: preset.value }))}
                  >
                    <span className="ref-pill-radio" aria-hidden="true">
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="ref-pill-label">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="ref-slider-group">
              <input
                type="range"
                min="5000"
                max={Math.max(150000, draft.max_price ?? 0)}
                step="5000"
                value={draft.max_price ?? 150000}
                onChange={e => setDraft(prev => ({ ...prev, max_price: Number(e.target.value) }))}
                className="ref-range-input"
                aria-label="Pilih batas maksimal harga menu"
              />
              <div className="ref-slider-labels">
                <span>Rp 5.000</span>
                <span>Rp 75.000</span>
                <span>Rp 150.000+</span>
              </div>
            </div>
          </section>

          {/* Section 4: Radius Lokasi */}
          <section className="ref-filter-section">
            <div className="ref-section-header-row">
              <h3 className="ref-section-title">Radius Lokasi</h3>
              <span className="ref-section-value">
                {draft.radius === 'unlimited' ? 'Tanpa batas' : `${draft.radius} km`}
              </span>
            </div>

            <div className="ref-presets-wrap">
              {RADIUS_PRESETS.map(preset => {
                const isSelected = draft.radius === preset.value;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={`ref-pill ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => setDraft(prev => ({ ...prev, radius: preset.value }))}
                  >
                    <span className="ref-pill-radio" aria-hidden="true">
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="ref-pill-label">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="ref-slider-group">
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                disabled={draft.radius === 'unlimited'}
                value={draft.radius === 'unlimited' ? 30 : draft.radius}
                onChange={e => setDraft(prev => ({ ...prev, radius: Number(e.target.value) }))}
                className="ref-range-input"
                aria-label="Pilih batas jarak radius"
              />
              <div className="ref-slider-labels">
                <span>0,5 km</span>
                <span>15 km</span>
                <span>30 km</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer with Reference-style Big Action Button */}
        <footer className="ref-filter-footer">
          {isDirty && (
            <button type="button" className="ref-reset-link" onClick={resetAll} disabled={pending}>
              <RotateCcw size={14} aria-hidden="true" />
              <span>Atur Ulang Pilihan</span>
            </button>
          )}
          <button type="submit" className="ref-submit-button" disabled={pending}>
            {pending ? 'Menerapkan…' : `Tampilkan Hasil${activeCount > 0 ? ` (${activeCount})` : ''}`}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
