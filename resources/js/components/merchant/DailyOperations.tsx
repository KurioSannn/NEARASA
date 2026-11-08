import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Check, Clock3, Info, MapPin, RotateCcw, Utensils } from 'lucide-react';
import { rupiah } from '@/types/catalog';
import { operationStatus } from '@/types/merchant';

type DailyMenu = { id: number; name: string; price: number; photo?: string | null; sold_out: boolean; availability?: { post_id: number; sold_out: boolean }[] };
type DailyPost = {
  id: number;
  name: string;
  address: string;
  is_open?: boolean;
  operating_status?: 'operating' | 'temporarily_closed' | 'permanently_closed';
  hours_updated_at?: string | null;
  today_hours?: { opens_at: string; closes_at: string; closes_tomorrow: boolean } | null;
  schedule_today?: { label: string; source: string };
};
export type DailyOperation = { business_id: number; business_slug: string; business_name: string; post: DailyPost; menus: DailyMenu[] };

export function merchantDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date) + ' WIB';
}

function currentTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}

function firstError(errors: Record<string, unknown>) {
  const value = Object.values(errors)[0];
  return typeof value === 'string' ? value : 'Perubahan belum tersimpan. Coba lagi.';
}

function menuSoldOut(menu: DailyMenu, postId: number) {
  return menu.availability?.find(item => item.post_id === postId)?.sold_out ?? menu.sold_out;
}

function AvailabilityRow({ operation, menu }: { operation: DailyOperation; menu: DailyMenu }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const soldOut = menuSoldOut(menu, operation.post.id);
  const rowId = `availability-${operation.post.id}-${menu.id}`;
  function toggleAvailability() {
    setError(''); setMessage('');
    router.patch(`/kelola-usaha/${operation.business_slug}/pos/${operation.post.id}/menu/${menu.id}/ketersediaan`, { sold_out: !soldOut }, {
      preserveScroll: true, preserveState: true, errorBag: rowId,
      onStart: () => setProcessing(true),
      onSuccess: () => setMessage(`${menu.name} ditandai ${soldOut ? 'tersedia' : 'habis'} di ${operation.post.name}.`),
      onError: errors => setError(firstError(errors)), onFinish: () => setProcessing(false),
    });
  }
  return <li className={`daily-menu-row${soldOut ? ' is-sold-out' : ''}`}>
    <span className="owner-stock-photo">{menu.photo ? <img src={menu.photo} alt="" width={52} height={52} loading="lazy" /> : <Utensils size={23} aria-hidden="true" />}</span><div className="daily-menu-info"><strong>{menu.name}</strong><span>{rupiah(menu.price)}</span></div>
    <button type="button" role="switch" aria-checked={!soldOut} className="daily-stock-switch" disabled={processing}
      aria-label={`${menu.name} di ${operation.post.name}: ${soldOut ? 'habis, tandai tersedia' : 'tersedia, tandai habis'}`}
      aria-describedby={error ? `${rowId}-error` : undefined} onClick={toggleAvailability}>
      <span className="owner-switch-track" aria-hidden="true"><span /></span><span>{processing ? 'Menyimpan…' : soldOut ? 'Habis' : 'Tersedia'}</span>
    </button>
    {error && <p className="daily-field-error daily-menu-feedback" id={`${rowId}-error`} role="alert">{error}</p>}
    <span className="daily-sr-only" role="status">{message}</span>
  </li>;
}

function TodayHours({ operation, onDirty, onRoutine }: { operation: DailyOperation; onDirty: (postId: number, dirty: boolean) => void; onRoutine: () => void }) {
  const { post } = operation;
  const [editing, setEditing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const opensInput = useRef<HTMLInputElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const form = useForm({ opens_at: '', closes_at: '' });
  const endpoint = `/kelola-usaha/${operation.business_slug}/pos/${post.id}/jam-hari-ini`;
  const isPermanent = post.operating_status === 'permanently_closed';
  const overnight = Boolean(form.data.opens_at && form.data.closes_at && form.data.closes_at < form.data.opens_at);
  const startedYesterday = Boolean(overnight && post.today_hours && !post.today_hours.closes_tomorrow && post.today_hours.closes_at < post.today_hours.opens_at);
  const closingDay = overnight ? startedYesterday ? 'hari ini' : 'besok' : '';
  const updated = post.hours_updated_at ? merchantDate(post.hours_updated_at) : '';
  useEffect(() => { onDirty(post.id, editing && form.isDirty); }, [editing, form.isDirty, post.id, onDirty]);
  useEffect(() => () => onDirty(post.id, false), [post.id, onDirty]);
  useEffect(() => { if (editing) opensInput.current?.focus({ preventScroll: true }); }, [editing]);
  function startEditing() {
    const values = { opens_at: post.today_hours?.opens_at.slice(0, 5) ?? currentTime(), closes_at: post.today_hours?.closes_at.slice(0, 5) ?? '' };
    form.setDefaults(values); form.setData(values); form.clearErrors();
    setMessage(''); setRestoreError(''); setEditing(true);
  }
  function restoreRoutine() {
    setMessage(''); setRestoreError('');
    router.delete(endpoint, {
      preserveScroll: true, preserveState: true, errorBag: `restoreHours-${post.id}`,
      onStart: () => setRestoring(true),
      onSuccess: () => setMessage('Jam khusus dihapus. Pos kembali mengikuti jadwal rutin.'),
      onError: errors => setRestoreError(firstError(errors)), onFinish: () => setRestoring(false),
    });
  }
  return <section className="daily-hours" aria-labelledby={`hours-title-${post.id}`}>
    <h2 id={`hours-title-${post.id}`}>Jam hari ini</h2>
    {post.today_hours ? <p className="daily-hours-current"><strong>{post.today_hours.opens_at.slice(0, 5)}–{post.today_hours.closes_at.slice(0, 5)}{post.today_hours.closes_tomorrow ? ' besok' : ''} WIB</strong><span>Jam khusus · jadwal rutin tetap tersimpan</span></p>
      : <p className="daily-hours-current"><strong>{isPermanent ? 'Pos tutup permanen' : post.operating_status === 'temporarily_closed' ? 'Pos tutup sementara' : post.schedule_today?.label ?? 'Mengikuti jadwal rutin'}{!isPermanent && post.operating_status !== 'temporarily_closed' && /\d/.test(post.schedule_today?.label ?? '') ? ' WIB' : ''}</strong><span>{post.operating_status === 'temporarily_closed' ? 'Isi jam khusus untuk membuka pos hari ini.' : isPermanent ? 'Ubah kondisi operasional untuk membuka kembali.' : post.schedule_today?.source ?? 'Jadwal rutin'}</span></p>}
    {updated && <p className="daily-hours-updated">Jam hari ini diperbarui {updated}.</p>}
    {isPermanent && <p className="daily-hint"><Info size={15} aria-hidden="true" />Pos tutup permanen. Ubah kondisi operasional di Jadwal & hari libur sebelum membukanya.</p>}
    <div className="daily-hours-actions" hidden={editing}>
      <button ref={editButton} type="button" className="daily-action" onClick={startEditing} disabled={isPermanent || restoring} aria-controls={`hours-form-${post.id}`} aria-expanded={editing}><Clock3 size={16} aria-hidden="true" />{post.today_hours || post.is_open ? 'Ubah jam hari ini' : 'Buka sekarang'}</button>
      {post.today_hours && <button className="daily-text-action" type="button" onClick={restoreRoutine} disabled={restoring}><RotateCcw size={14} aria-hidden="true" />{restoring ? 'Memulihkan…' : 'Kembali ke jadwal rutin'}</button>}
      <button className="daily-text-action" type="button" onClick={onRoutine}>Atur jadwal rutin</button>
    </div><form hidden={!editing} className="daily-hours-form" id={`hours-form-${post.id}`} onSubmit={event => {
      event.preventDefault();
      form.post(endpoint, { preserveScroll: true, preserveState: true, errorBag: `todayHours-${post.id}`,
        onSuccess: () => { form.setDefaults(); setEditing(false); setMessage('Jam khusus tersimpan untuk pos ini.'); requestAnimationFrame(() => editButton.current?.focus({ preventScroll: true })); },
      });
    }}>
      <p className="daily-hint">Isi jamnya, lalu simpan agar perubahan berlaku pada pos ini.</p>
      {form.hasErrors && <p className="daily-field-error" role="alert">{Object.values(form.errors).join(' ')}</p>}
      <fieldset disabled={form.processing}>
        <div className="daily-time-fields">
          <div><label htmlFor={`opens-${post.id}`}>Buka{startedYesterday ? ' kemarin' : ''} (WIB)</label><input ref={opensInput} id={`opens-${post.id}`} type="time" required className="text-input" value={form.data.opens_at} aria-invalid={Boolean(form.errors.opens_at)} aria-describedby={form.errors.opens_at ? `opens-error-${post.id}` : undefined} onChange={event => form.setData('opens_at', event.target.value)} />{form.errors.opens_at && <p id={`opens-error-${post.id}`} className="daily-field-error">{form.errors.opens_at}</p>}</div>
          <div><label htmlFor={`closes-${post.id}`}>Tutup{closingDay ? ` ${closingDay}` : ''} (WIB)</label><input id={`closes-${post.id}`} type="time" required className="text-input" value={form.data.closes_at} aria-invalid={Boolean(form.errors.closes_at)} aria-describedby={`hours-effect-${post.id}${form.errors.closes_at ? ` closes-error-${post.id}` : ''}`} onChange={event => form.setData('closes_at', event.target.value)} />{form.errors.closes_at && <p id={`closes-error-${post.id}`} className="daily-field-error">{form.errors.closes_at}</p>}</div>
        </div>
        <p className={`daily-hint${overnight ? ' daily-overnight' : ''}`} id={`hours-effect-${post.id}`} aria-live="polite">{overnight ? `${startedYesterday ? 'Sesi yang dimulai kemarin' : 'Sesi'} berakhir pukul ${form.data.closes_at} ${closingDay}. Setelah itu, jadwal rutin berlaku kembali.` : 'Jam khusus berlaku hari ini. Jadwal rutin tetap tersimpan.'}</p>
        <div className="daily-form-actions"><button className="daily-text-action" type="button" onClick={() => { form.resetAndClearErrors(); setEditing(false); requestAnimationFrame(() => editButton.current?.focus({ preventScroll: true })); }}>Batal</button><button type="submit" className="daily-action">{form.processing ? 'Menyimpan…' : 'Simpan jam hari ini'}</button></div>
      </fieldset>
    </form>
    <p className="owner-inline-hint"><Info size={16} aria-hidden="true" />Jam khusus berlaku untuk sesi hari ini. Jadwal rutin tetap tersimpan.</p>{restoreError && <p className="daily-field-error" role="alert">{restoreError}</p>}
    {message && <p className="daily-success" role="status"><Check size={15} aria-hidden="true" />{message}</p>}
  </section>;
}

export default function DailyOperations({ operations, selectedPostId, onSelectPost, onRoutine, onDirty }: { operations: DailyOperation[]; selectedPostId: number; onSelectPost: (id: number) => void; onRoutine: () => void; onDirty?: (key: string, dirty: boolean) => void }) {
  const [drafts, setDrafts] = useState<Record<number, boolean>>({});
  const reportDirty = useCallback((postId: number, dirty: boolean) => setDrafts(previous => previous[postId] === dirty ? previous : { ...previous, [postId]: dirty }), []);
  const hasDraft = Object.values(drafts).some(Boolean);
  useEffect(() => { onDirty?.('daily', hasDraft); }, [hasDraft, onDirty]);
  useEffect(() => () => onDirty?.('daily', false), [onDirty]);
  if (!operations.length) return <div className="daily-empty"><MapPin size={24} aria-hidden="true" /><div><h3>Belum ada pos untuk dikelola</h3><p>Tambahkan pos dari profil usaha agar jam dan ketersediaan menunya dapat diatur di sini.</p></div></div>;
  const selected = operations.find(operation => operation.post.id === selectedPostId) ?? operations[0];
  const status = operationStatus(selected.post);
  return <div className="owner-operations"><section className="owner-panel owner-post-selector" aria-labelledby="owner-post-label"><div><label id="owner-post-label" htmlFor="owner-post-select">Lokasi jualan yang diatur</label><select id="owner-post-select" className="text-input" value={selected.post.id} onChange={event => onSelectPost(Number(event.target.value))}>{operations.map(operation => <option key={operation.post.id} value={operation.post.id}>{operation.post.name}</option>)}</select><p><MapPin size={16} aria-hidden="true" />{selected.post.address}</p></div><span className={`owner-status${status.open ? ' is-open' : ''}`}><span aria-hidden="true" />{status.label}</span></section>
    {operations.map(operation => {
      const available = operation.menus.filter(menu => !menuSoldOut(menu, operation.post.id)).length;
      return <div className="owner-operation-columns" key={operation.post.id} hidden={operation.post.id !== selected.post.id}><section className="owner-panel owner-stock" aria-labelledby={`stock-title-${operation.post.id}`}><header className="owner-panel-heading"><h2 id={`stock-title-${operation.post.id}`}>Ketersediaan menu</h2><span className="owner-caption">{available} tersedia</span></header>
        {operation.menus.length ? <ul className="daily-menu-list">{operation.menus.map(menu => <AvailabilityRow key={menu.id} operation={operation} menu={menu} />)}</ul> : <p className="owner-inline-hint">Belum ada menu. Tambahkan dari tab Menu & harga.</p>}
        <p className="owner-inline-hint"><Info size={16} aria-hidden="true" />Status habis tersimpan di pos ini sampai kamu mengubahnya.</p>{operation.menus.length > 0 && available === 0 && <p className="daily-hint daily-all-sold-out">Semua menu habis. Status buka pos tetap mengikuti jadwalnya.</p>}
      </section><TodayHours operation={operation} onDirty={reportDirty} onRoutine={onRoutine} /></div>;
    })}
  </div>;
}

