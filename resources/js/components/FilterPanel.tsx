import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Banknote, MapPin, RotateCcw, Utensils } from 'lucide-react';
import Dialog from './Dialog';
import Button from './Button';
import { catalogUrl, defaultFilters, rupiah, type Filters, type Options } from '@/types/catalog';

export default function FilterPanel({ filters, options, onClose, base = '/jelajah' }: { filters: Filters; options: Options; onClose: () => void; base?: string }) {
  const [draft, setDraft] = useState(filters);
  const [pending, setPending] = useState(false);
  return <Dialog title="Filter pencarian" onClose={onClose}>
    <form className="filter-form" onSubmit={event => { event.preventDefault(); router.get(catalogUrl(draft, base), {}, { onStart: () => setPending(true), onFinish: () => setPending(false), onSuccess: onClose }); }}>
      <button type="button" className="reset-filters" onClick={() => setDraft({ ...defaultFilters, q: filters.q })}><RotateCcw size={15} /> Reset</button>
      <fieldset><legend><Utensils size={18} />Jenis pilihan</legend><div className="filter-choices">{[null, ...options.groups].map(group => <button type="button" key={group ?? 'all'} className={draft.group === group ? 'selected' : ''} aria-pressed={draft.group === group} onClick={() => setDraft({ ...draft, group })}>{group ?? 'Semua'}</button>)}</div></fieldset>
      <fieldset><legend>Kategori</legend><div className="filter-choices small-choices">{[null, ...options.categories].map(category => <button key={category ?? 'all'} type="button" className={draft.category === category ? 'selected' : ''} aria-pressed={draft.category === category} onClick={() => setDraft({ ...draft, category })}>{category ?? 'Semua kategori'}</button>)}</div></fieldset>
      <fieldset className="range-box"><legend><Banknote size={19} />Batas harga menu</legend><div className="range-value"><label htmlFor="price-cap">Maksimal per menu</label><output htmlFor="price-cap">{draft.max_price === null ? 'Tanpa batas' : rupiah(draft.max_price)}</output></div><input id="price-cap" type="range" min="5000" max={Math.max(150000, draft.max_price ?? 0)} step="5000" value={draft.max_price ?? 150000} onChange={event => setDraft({ ...draft, max_price: Number(event.target.value) })} /><div className="range-labels"><span>Rp5.000</span><button type="button" onClick={() => setDraft({ ...draft, max_price: null })}>Tanpa batas</button></div></fieldset>
      <fieldset className="range-box"><legend><MapPin size={19} />Radius pencarian</legend><div className="range-value"><label htmlFor="radius-cap">Dari lokasi pilihanmu</label><output htmlFor="radius-cap">{draft.radius === 'unlimited' ? 'Tanpa batas' : `${draft.radius.toLocaleString('id-ID')} km`}</output></div><input id="radius-cap" type="range" min="0.5" max="50" step="0.5" disabled={draft.radius === 'unlimited'} value={draft.radius === 'unlimited' ? 50 : draft.radius} onChange={event => setDraft({ ...draft, radius: Number(event.target.value) })} /><div className="range-labels"><span>0,5 km</span><label className="checkbox-label"><input type="checkbox" checked={draft.radius === 'unlimited'} onChange={event => setDraft({ ...draft, radius: event.target.checked ? 'unlimited' : 5 })} /> Tanpa batas</label></div><p className="field-hint">Radius berlaku setelah kamu memilih lokasi.</p></fieldset>
      <Button type="submit" disabled={pending}>{pending ? 'Menerapkan…' : 'Terapkan filter'}</Button>
    </form>
  </Dialog>;
}
