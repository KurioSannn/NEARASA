import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock3, MapPin, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import Dialog from '@/components/Dialog';
import { facilityChoices, paymentChoices, serviceChoices, type MerchantBusiness, type MerchantPost } from '@/types/business-profile';
import ScheduleSummary from './ScheduleSummary';
import { DeleteDialog } from './ProfileDialogs';
import { SectionHeading } from './ProfileFields';
import PostEditor from './PostEditor';
import PostScheduleCalendar from './calendar/PostScheduleCalendar';
import type { PostEditorMode } from './post-form';
import type { DirtyReporter } from './useProfileDraft';

const statusNames = { operating: 'Beroperasi', temporarily_closed: 'Tutup sementara', permanently_closed: 'Tutup permanen' };
type Editing = { post: MerchantPost | null; mode: PostEditorMode };
function ServicesSummary({ post }: { post: MerchantPost }) {
  const groups = [['Layanan', post.service_options ?? [], serviceChoices], ['Fasilitas', post.facilities ?? [], facilityChoices], ['Pembayaran', post.payment_methods ?? [], paymentChoices]] as const;
  return <details className="owner-disclosure"><summary>Layanan & fasilitas</summary><dl className="profile-post-facts">{groups.map(([label, values, choices]) => <div key={label}><dt>{label}</dt><dd>{choices.filter(([key]) => values.includes(key)).map(([, name]) => name).join(', ') || 'Belum ditambahkan'}</dd></div>)}{post.service_area && <div><dt>Area layanan</dt><dd>{post.service_area}</dd></div>}</dl></details>;
}

export default function PostsSection({ business, selectedPostId, requestHours = 0, onDirty }: { business: MerchantBusiness; selectedPostId: number; requestHours?: number; onDirty: DirtyReporter }) {
  const [editor, setEditor] = useState<Editing | null>(null);
  const [pendingEditor, setPendingEditor] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<MerchantPost | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const trigger = useRef<HTMLElement | null>(null);
  const reportDirty = useCallback((key: string, value: boolean) => { setDirty(value); onDirty(key, value); }, [onDirty]);
  function choose(post: MerchantPost | null, mode: PostEditorMode) {
    if (editor && editor.post?.id === post?.id && editor.mode === mode) return;
    trigger.current = document.activeElement as HTMLElement;
    if (dirty) setPendingEditor({ post, mode }); else { setMessage(''); setEditor({ post, mode }); }
  }
  useEffect(() => {
    if (!requestHours) return;
    const post = business.posts.find(item => item.id === selectedPostId);
    if (post) choose(post, 'hours');
    // A request comes from the explicit "Atur jadwal rutin" action, not ordinary post/data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestHours]);
  function close() { setEditor(null); setDirty(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); }
  const renderEditor = () => editor && <PostEditor key={`${editor.post?.id ?? 'new'}-${editor.mode}`} business={business} post={editor.post} mode={editor.mode} onClose={close} onSaved={() => { const mode = editor.mode; close(); setMessage(mode === 'hours' ? 'Jadwal pos tersimpan.' : mode === 'services' ? 'Layanan, fasilitas, dan pembayaran tersimpan.' : 'Pos jualan tersimpan.'); }} onDirty={reportDirty} />;
  return <div className="profile-card owner-posts-section"><SectionHeading title="Pos & jadwal" description={`Lokasi jualan ${business.name}. Semua jam menggunakan WIB.`} action={<button type="button" className="owner-button" onClick={() => choose(null, 'new')}><Plus size={17} aria-hidden="true" />Tambah pos</button>} />{message && <p className="profile-success" role="status"><Check size={17} aria-hidden="true" />{message}</p>}
    {editor && renderEditor()}
    {business.posts.length ? <ul className="owner-post-list">{business.posts.map(post => <li key={post.id} id={`owner-post-card-${post.id}`}><div className="owner-post-summary"><div className="owner-post-identity"><MapPin size={22} aria-hidden="true" /><div><h3>{post.name}</h3><p>{post.address}</p>{post.landmark && <small>Patokan: {post.landmark}</small>}<span className={`owner-status${post.operating_status === 'operating' ? ' neutral' : ''}`}><span aria-hidden="true" />{statusNames[post.operating_status ?? 'operating']}</span>{post.closure_note && <p>{post.closure_note}</p>}</div></div><div className="owner-post-schedule"><strong><Clock3 size={16} aria-hidden="true" />Jadwal rutin</strong><ScheduleSummary post={post} /><small>{post.special_hours?.length ?? 0} tanggal khusus / hari libur</small></div><div className="owner-post-actions"><button type="button" className="owner-text-link" onClick={() => choose(post, 'location')}><Pencil size={16} aria-hidden="true" />Edit lokasi<span className="profile-sr-only"> {post.name}</span></button><button type="button" className="owner-text-link" onClick={() => choose(post, 'hours')}><Clock3 size={16} aria-hidden="true" />Atur jadwal<span className="profile-sr-only"> {post.name}</span></button><button type="button" className="owner-text-link" onClick={() => choose(post, 'services')}><Settings2 size={16} aria-hidden="true" />Edit layanan<span className="profile-sr-only"> {post.name}</span></button>{business.posts.length > 1 && <button type="button" className="owner-text-link text-rose-600 hover:text-rose-700" onClick={() => setDeleting(post)}><Trash2 size={16} aria-hidden="true" />Hapus<span className="profile-sr-only"> {post.name}</span></button>}</div></div><ServicesSummary post={post} />
    </li>)}</ul> : !editor && <div className="owner-empty"><MapPin size={28} aria-hidden="true" /><h3>Belum ada pos jualan</h3><p>Tambahkan lokasi dan jadwal agar pelanggan dapat menemukannya.</p></div>}
    {business.posts.length === 1 && <p className="owner-inline-hint">Minimal satu pos harus tetap ada. Tambahkan pos lain sebelum menghapus pos terakhir.</p>}
    {business.posts.length > 0 && (
      <div className="mt-8 pt-6 border-t border-sand-border" style={{ borderColor: 'rgba(183, 75, 40, 0.18)' }}>
        <PostScheduleCalendar business={business} selectedPostId={selectedPostId} />
      </div>
    )}
    {pendingEditor && <Dialog title="Ganti pengaturan yang sedang diedit?" onClose={() => setPendingEditor(null)}><div className="profile-confirm"><p>Ada perubahan pos yang belum disimpan.</p><div className="profile-confirm-actions"><button className="profile-secondary" type="button" onClick={() => setPendingEditor(null)}>Lanjut mengedit</button><button className="profile-danger" type="button" onClick={() => { setEditor(pendingEditor); setPendingEditor(null); setDirty(false); }}>Buang perubahan & ganti</button></div></div></Dialog>}
    {deleting && <DeleteDialog title="Hapus pos jualan?" name={deleting.name} endpoint={`/kelola-usaha/${business.slug}/pos/${deleting.id}`} description="Alamat, jadwal, dan fasilitas pos ini akan ikut dihapus." onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); close(); setMessage('Pos jualan dihapus.'); }} />}
  </div>;
}
