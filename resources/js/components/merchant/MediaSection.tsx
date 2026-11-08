import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Download, Image, FileText } from 'lucide-react';
import type { MerchantBusiness } from '@/types/business-profile';
import { businessCover } from '@/types/business-images';
import { CheckField, ErrorSummary, FileField, imageAccept, imageHint, SaveBar, SectionHeading } from './ProfileFields';
import GallerySection from './GallerySection';
import { type DirtyReporter, useProfileDraft } from './useProfileDraft';

export default function MediaSection({ business, onDirty }: { business: MerchantBusiness; onDirty: DirtyReporter }) {
  const empty = { section: 'media', photo: null as File | null, logo: null as File | null, menu_pdf: null as File | null, remove_logo: false, remove_menu_pdf: false };
  const form = useForm(empty);
  const [fileKey, setFileKey] = useState(0);
  useProfileDraft('media', form.isDirty, onDirty);
  return <div className="merchant-profile-stack"><div className="profile-card"><SectionHeading title="Foto & berkas usaha" description="Foto sampul, logo, dan daftar menu PDF dikelola terpisah dari galeri." /><form className="profile-form" onSubmit={event => { event.preventDefault(); form.transform(data => ({ ...data, _method: 'patch' })); form.post(`/kelola-usaha/${business.slug}`, { forceFormData: true, preserveScroll: true, errorBag: 'profileMedia', onSuccess: () => { form.setDefaults(empty); form.reset(); setFileKey(value => value + 1); } }); }}><fieldset className="profile-busy-fields" disabled={form.processing}><ErrorSummary errors={form.errors} />
    <div className="profile-media-row"><figure className="profile-cover"><img src={businessCover(business)} alt={`Foto sampul ${business.name} saat ini`} width={600} height={400} /><figcaption>Foto sampul yang tampil</figcaption></figure><div><FileField key={`cover-${fileKey}`} id="media-cover" label="Ganti foto sampul" accept={imageAccept} hint={imageHint} error={form.errors.photo} onChange={event => form.setData('photo', event.target.files?.[0] ?? null)} /><p className="profile-hint">Foto sampul juga digunakan pada kartu usaha di halaman jelajah.</p></div></div>
    <div className="profile-media-row"><div className="profile-logo">{business.logo ? <img src={business.logo} alt={`Logo ${business.name} saat ini`} width={120} height={120} /> : <div className="profile-media-empty"><Image size={28} /><span>Belum ada logo</span></div>}</div><div><FileField key={`logo-${fileKey}`} id="media-logo" label="Logo usaha" accept={imageAccept} hint={imageHint} error={form.errors.logo} disabled={form.data.remove_logo} onChange={event => form.setData('logo', event.target.files?.[0] ?? null)} />{business.logo && <CheckField label="Hapus logo saat disimpan" checked={form.data.remove_logo} onChange={event => form.setData(data => ({ ...data, remove_logo: event.target.checked, logo: null }))} />}</div></div>
    <div className="profile-media-row"><div className="profile-media-empty profile-pdf-icon"><FileText size={30} /><span>Daftar menu PDF</span></div><div>{business.menu_pdf && <a href={business.menu_pdf} download className="profile-inline-link"><Download size={16} />Unduh PDF saat ini</a>}<FileField key={`pdf-${fileKey}`} id="media-pdf" label={business.menu_pdf ? 'Ganti berkas PDF menu' : 'Unggah PDF menu'} accept="application/pdf" hint="Berkas PDF maksimal 2 MB. Pelanggan mengunduh berkas ini." error={form.errors.menu_pdf} disabled={form.data.remove_menu_pdf} onChange={event => form.setData('menu_pdf', event.target.files?.[0] ?? null)} />{business.menu_pdf && <CheckField label="Hapus PDF saat disimpan" checked={form.data.remove_menu_pdf} onChange={event => form.setData(data => ({ ...data, remove_menu_pdf: event.target.checked, menu_pdf: null }))} />}</div></div>
    <SaveBar label="Media usaha" processing={form.processing} dirty={form.isDirty} successful={form.wasSuccessful} progress={form.progress?.percentage} />
  </fieldset></form></div><GallerySection business={business} onDirty={onDirty} /></div>;
}
