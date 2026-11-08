import { Link, useForm, usePage } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import Button from '@/components/Button';
import type { Business, SellingPost, SharedProps } from '@/types/catalog';
import { profileLoginUrl } from './profile-utils';

export default function ProfileClosedReport({ business, post, ownerId }: { business: Business; post: SellingPost; ownerId?: number }) {
  const { props: { auth }, url } = usePage<SharedProps>();
  const form = useForm({ note: '' });
  const loginUrl = profileLoginUrl(business.slug, post.id, url);
  if (auth.user && auth.user.id === ownerId) return null;
  return <details className="profile-closed-report"><summary><Flag size={15} aria-hidden="true" />Saya menemukan tempat ini tutup</summary><div><p>Laporan untuk <strong>{post.name}</strong> diteruskan ke pemilik dan dicatat untuk admin. Pemilik akan memeriksa informasi jamnya.</p>{auth.user ? <form className="consumer-form" aria-busy={form.processing} onSubmit={event => { event.preventDefault(); form.post(`/usaha/${business.slug}/pos/${post.id}/laporan-tutup`, { preserveScroll: true, onSuccess: () => form.reset('note') }); }}><label htmlFor={`report-note-${post.id}`}>Catatan <span>(opsional)</span></label><textarea id={`report-note-${post.id}`} rows={3} maxLength={500} value={form.data.note} disabled={form.processing} onChange={event => form.setData('note', event.target.value)} placeholder="Contoh: tiba pukul 16.00 dan tempat sudah tutup." />{form.errors.note && <p className="form-error" role="alert">{form.errors.note}</p>}<Button type="submit" disabled={form.processing}>{form.processing ? 'Mengirim laporan…' : 'Kirim laporan tutup'}</Button>{form.recentlySuccessful && <p className="consumer-success" role="status">Laporan pos ini sudah terkirim. Terima kasih sudah membantu.</p>}</form> : <Link href={loginUrl} className="text-link">Masuk untuk mengirim laporan</Link>}</div></details>;
}
