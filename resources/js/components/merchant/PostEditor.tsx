import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import type { MerchantBusiness, MerchantPost } from '@/types/business-profile';
import InlineEditor from './InlineEditor';
import { ErrorSummary, SaveBar } from './ProfileFields';
import PostLocationFields from './PostLocationFields';
import PostHoursFields from './PostHoursFields';
import PostServicesFields from './PostServicesFields';
import { postDraft, type PostDraft, type PostEditorMode } from './post-form';
import { type DirtyReporter, useProfileDraft } from './useProfileDraft';

const steps = [['location', 'Lokasi'], ['hours', 'Jadwal'], ['services', 'Layanan']] as const;
export default function PostEditor({ business, post, mode, onClose, onSaved, onDirty }: { business: MerchantBusiness; post: MerchantPost | null; mode: PostEditorMode; onClose: () => void; onSaved: () => void; onDirty: DirtyReporter }) {
  const form = useForm<PostDraft>(postDraft(post));
  const [step, setStep] = useState<Exclude<PostEditorMode, 'new'>>(mode === 'new' ? 'location' : mode);
  const [locating, setLocating] = useState(false);
  const section = mode === 'hours' ? 'hours' : mode === 'services' ? 'services' : 'posts';
  const titles = { location: 'Edit lokasi pos', hours: 'Edit jadwal pos', services: 'Edit layanan & fasilitas', new: 'Tambah pos jualan' };
  useProfileDraft(section, form.isDirty, onDirty);
  return <InlineEditor title={titles[mode]} onClose={onClose} dirty={form.isDirty} processing={form.processing || locating}>{requestClose => <form className="profile-form" onSubmit={event => {
    event.preventDefault();
    form.transform(data => ({ ...data, schedules: data.schedules.map(slot => ({ ...slot, all_day: Boolean(slot.all_day), opens_at: slot.all_day ? '00:00' : slot.opens_at, closes_at: slot.all_day ? '00:00' : slot.closes_at })), special_hours: data.special_hours.map(slot => ({ ...slot, all_day: !slot.is_closed && slot.all_day, opens_at: slot.is_closed ? null : slot.all_day ? '00:00' : slot.opens_at, closes_at: slot.is_closed ? null : slot.all_day ? '00:00' : slot.closes_at })) }));
    const options = { preserveScroll: true, errorBag: 'profilePost', onSuccess: onSaved, onError: (errors: Record<string, string>) => { if (mode !== 'new') return; const key = Object.keys(errors)[0] ?? ''; setStep(/^(schedules|special_hours|operating_status|closure_note)/.test(key) ? 'hours' : /^(service_options|facilities|payment_methods)/.test(key) ? 'services' : 'location'); } };
    if (post) form.patch(`/kelola-usaha/${business.slug}/pos/${post.id}`, options); else form.post(`/kelola-usaha/${business.slug}/pos`, options);
  }}>
    {post && <p className="profile-editing-context">Pos yang diubah: <strong>{post.name}</strong></p>}{mode === 'new' && <nav className="profile-editor-steps" aria-label="Tahap tambah pos">{steps.map(([key, label], index) => <button key={key} type="button" aria-current={step === key ? 'step' : undefined} disabled={form.processing || locating} onClick={() => setStep(key)}><span>{index + 1}</span>{label}</button>)}</nav>}<ErrorSummary errors={form.errors} />
    <fieldset className="profile-editor-fields" key={step} disabled={form.processing}>{step === 'location' && <PostLocationFields data={form.data} setData={form.setData} errors={form.errors} locating={locating} onLocating={setLocating} />}{step === 'hours' && <PostHoursFields data={form.data} setData={form.setData} errors={form.errors} />}{step === 'services' && <PostServicesFields data={form.data} setData={form.setData} errors={form.errors} />}</fieldset>
    {mode === 'new' && step !== 'services' ? <div className="profile-step-footer"><button type="button" className="profile-secondary" disabled={locating || form.processing} onClick={requestClose}>Batal</button>{step === 'hours' && <button type="button" className="profile-secondary" onClick={() => setStep('location')}><ArrowLeft size={16} />Kembali</button>}<Button type="button" disabled={locating || form.processing} onClick={event => { if (event.currentTarget.form?.reportValidity()) setStep(step === 'location' ? 'hours' : 'services'); }}>Lanjut ke {step === 'location' ? 'jadwal' : 'layanan'}<ArrowRight size={16} /></Button></div> : <>{mode === 'new' && <button type="button" className="profile-secondary" disabled={form.processing} onClick={() => setStep('hours')}><ArrowLeft size={16} />Kembali ke jadwal</button>}<SaveBar label={mode === 'hours' ? 'Jadwal' : mode === 'services' ? 'Layanan pos' : 'Pos jualan'} processing={form.processing || locating} dirty={form.isDirty} successful={false} onCancel={requestClose} /></>}
  </form>}</InlineEditor>;
}
