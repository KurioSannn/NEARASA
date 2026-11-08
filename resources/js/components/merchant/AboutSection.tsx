import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { MerchantBusiness } from '@/types/business-profile';
import { ErrorSummary, SaveBar, SectionHeading, SelectField, TextAreaField, TextField } from './ProfileFields';
import { type DirtyReporter, useProfileDraft } from './useProfileDraft';

const categorySuggestions = ['Warung makan', 'Masakan rumahan', 'Kedai kopi', 'Jajanan', 'Minuman'];

export default function AboutSection({ business, onDirty }: { business: MerchantBusiness; onDirty: DirtyReporter }) {
  const form = useForm({ section: 'about', name: business.name, kind: business.kind, description: business.description, business_category: business.business_category ?? '', additional_categories: business.additional_categories ?? [], opened_on: business.opened_on ?? '' });
  const [categoryDraft, setCategoryDraft] = useState('');
  const [categoryError, setCategoryError] = useState('');
  useProfileDraft('about', form.isDirty || Boolean(categoryDraft.trim()), onDirty);
  const withDraft = () => [...new Set([...form.data.additional_categories, ...(categoryDraft.trim() ? [categoryDraft.trim()] : [])])];
  function addCategory() {
    const categories = withDraft();
    if (categories.length > 8) { setCategoryError('Maksimal 8 kategori tambahan.'); return; }
    form.setData('additional_categories', categories); setCategoryDraft(''); setCategoryError('');
  }
  return <div className="profile-card"><SectionHeading title="Tentang usaha" description="Bantu pelanggan mengenal nama, jenis kuliner, dan cerita usahamu." /><form className="profile-form" onSubmit={event => { event.preventDefault(); const categories = withDraft(); if (categories.length > 8) { setCategoryError('Maksimal 8 kategori tambahan.'); return; } form.transform(data => ({ ...data, additional_categories: categories })); form.patch(`/kelola-usaha/${business.slug}`, { preserveScroll: true, errorBag: 'profileAbout', onSuccess: () => { form.setData('additional_categories', categories); form.setDefaults({ ...form.data, additional_categories: categories }); setCategoryDraft(''); setCategoryError(''); } }); }}>
    <fieldset className="profile-busy-fields" disabled={form.processing}><ErrorSummary errors={form.errors} /><TextField id="about-name" label="Nama usaha · wajib" required maxLength={120} value={form.data.name} onChange={event => form.setData('name', event.target.value)} error={form.errors.name} />
    <div className="profile-two-columns"><div><TextField id="about-category" label="Kategori utama usaha · opsional" maxLength={120} placeholder="Tulis kategori sendiri" value={form.data.business_category} onChange={event => form.setData('business_category', event.target.value)} error={form.errors.business_category} hint="Pilih saran atau tulis kategori yang sesuai." /><div className="owner-category-suggestions" aria-label="Saran kategori utama">{categorySuggestions.map(category => <button key={category} type="button" aria-pressed={form.data.business_category === category} onClick={() => form.setData('business_category', category)}>{category}</button>)}</div></div><SelectField id="about-kind" label="Bentuk tempat jualan" value={form.data.kind} onChange={event => form.setData('kind', event.target.value)} error={form.errors.kind} options={[["warung", "Warung"], ["ruko", "Ruko"], ["rombong", "Rombong / gerobak"], ["mobil", "Mobil / food truck"], ["lainnya", "Lainnya"]]} /></div>
    <div className="profile-field"><label htmlFor="about-additional">Kategori tambahan <small>Opsional</small></label><div className="profile-category-entry"><input className="text-input" id="about-additional" maxLength={120} placeholder="Contoh: Kedai kopi" value={categoryDraft} aria-describedby="about-additional-hint" onChange={event => { setCategoryDraft(event.target.value); setCategoryError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addCategory(); } }} /><button type="button" className="profile-secondary" aria-label="Tambahkan kategori" disabled={!categoryDraft.trim()} onClick={addCategory}><Plus size={18} aria-hidden="true" />Tambah</button></div><ul className="profile-category-tags" aria-label="Kategori tambahan terpilih">{form.data.additional_categories.map(category => <li key={category}><span>{category}</span><button type="button" aria-label={`Hapus kategori ${category}`} onClick={() => form.setData('additional_categories', form.data.additional_categories.filter(item => item !== category))}><X size={15} aria-hidden="true" /></button></li>)}</ul><p className="profile-hint" id="about-additional-hint">Tambahkan satu per satu, maksimal 8 kategori.</p>{(categoryError || form.errors.additional_categories) && <p className="profile-field-error" role="alert">{categoryError || form.errors.additional_categories}</p>}</div>
    <TextAreaField id="about-description" label="Cerita usaha · wajib" required maxLength={2000} rows={6} value={form.data.description} onChange={event => form.setData('description', event.target.value)} error={form.errors.description} hint={`${form.data.description.length}/2000 karakter`} /><TextField id="about-opened" label="Tanggal mulai usaha · opsional" type="date" value={form.data.opened_on} onChange={event => form.setData('opened_on', event.target.value)} error={form.errors.opened_on} />
    <SaveBar label="Tentang usaha" processing={form.processing} dirty={form.isDirty || Boolean(categoryDraft.trim())} successful={form.wasSuccessful} />
  </fieldset></form></div>;
}
