import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import { catalogUrl, rupiah, type Filters } from '@/types/catalog';

type SearchIntent = { q: string; maxPrice: number | null; chooseBudget: boolean };

export function parseSearchIntent(value: string): SearchIntent {
  const amount = '(\\d{1,3}(?:[.]\\d{3})+|\\d+(?:[,.]\\d+)?)';
  const unit = '\\s*(ribu|rb|k)?';
  const patterns = [
    new RegExp(`(?:\\b(?:maksimal|maksimum|max|di bawah|dibawah|kurang dari|sampai(?: dengan)?|hingga)\\s*|(?:≤|<=)\\s*)(?:rp\\.?\\s*)?${amount}${unit}\\b`, 'i'),
    new RegExp(`\\brp\\.?\\s*${amount}${unit}\\b`, 'i'),
    new RegExp(`\\b${amount}\\s*(ribu|rb|k)\\b`, 'i'),
  ];
  const match = patterns.map(pattern => value.match(pattern)).find(Boolean);
  let maxPrice: number | null = null;
  if (match) {
    const raw = match[1];
    const numeric = /^\d{1,3}(?:[.]\d{3})+$/.test(raw) ? Number(raw.replaceAll('.', '')) : Number(raw.replace(',', '.'));
    const price = Math.round(numeric * (match[2] ? 1000 : 1));
    if (Number.isFinite(price) && price > 0 && price <= 10000000) maxPrice = price;
  }
  const cheap = /\bmurah\b/i.test(value);
  let q = maxPrice !== null && match ? value.replace(match[0], ' ') : value;
  if (cheap) q = q.replace(/\bmurah\b|\bdekat sini\b|^\s*(?:makan|makanan)\b/gi, ' ');
  q = q.replace(/\s+/g, ' ').trim();
  return { q, maxPrice, chooseBudget: cheap && maxPrice === null };
}

export default function SearchField({ filters, onFilter, base = '/jelajah', discovery = false }: { filters: Filters; onFilter?: () => void; base?: string; discovery?: boolean }) {
  const [q, setQ] = useState(filters.q);
  const [budgetQuery, setBudgetQuery] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => setQ(filters.q), [filters.q]);
  const search = (query: string, maxPrice: number | null) => router.get(catalogUrl({ ...filters, q: query, max_price: maxPrice }, base), {}, { onStart: () => setPending(true), onFinish: () => setPending(false), onSuccess: () => setBudgetQuery(null) });
  return <><form className={'search-field' + (discovery ? ' discovery-search-field' : '')} role="search" aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    const intent = parseSearchIntent(q);
    if (intent.chooseBudget) setBudgetQuery(intent.q);
    else search(intent.q, intent.maxPrice ?? filters.max_price);
  }}>
    {discovery ? <Search className="search-leading-icon" size={22} aria-hidden="true" /> : <button className="search-submit" aria-label={pending ? 'Mencari makanan' : 'Cari makanan'} type="submit" disabled={pending}><Search size={21} aria-hidden="true" /></button>}
    <input type="search" aria-label="Cari makanan atau nama usaha" placeholder={discovery ? 'Cari makanan atau usaha' : 'Lagi ingin makan apa?'} value={q} maxLength={100} onChange={event => setQ(event.target.value)} />
    {discovery && q && <button type="button" className="search-clear" aria-label="Kosongkan isian pencarian" onClick={() => setQ('')}><X size={18} aria-hidden="true" /></button>}
    {discovery && <button type="submit" className="discovery-search-submit" disabled={pending}>{pending ? 'Mencari…' : 'Cari'}</button>}
    {!discovery && onFilter && <button type="button" className="filter-trigger" aria-label="Buka filter" onClick={onFilter}><SlidersHorizontal size={20} aria-hidden="true" /></button>}
  </form>{budgetQuery !== null && <Dialog title="Pilih batas harga menumu" onClose={() => setBudgetQuery(null)}><div className="budget-prompt"><p>Murah yang pas untukmu sampai berapa? Pilihan ini menjadi batas harga menu dan bisa kamu ubah dari filter.</p><div className="budget-options">{[15000, 20000, 30000].map(price => <Button key={price} className="button-outline" type="button" disabled={pending} onClick={() => search(budgetQuery, price)}>Maksimal {rupiah(price)}</Button>)}</div><span className="consumer-pending" role="status">{pending ? 'Mencari pilihan sesuai anggaran…' : ''}</span></div></Dialog>}</>;
}
