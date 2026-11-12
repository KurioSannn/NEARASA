import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Check, ChevronDown, Clock3, Info, MapPin, RotateCcw, Utensils } from 'lucide-react';
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
    setError('');
    setMessage('');
    router.patch(`/kelola-usaha/${operation.business_slug}/pos/${operation.post.id}/menu/${menu.id}/ketersediaan`, { sold_out: !soldOut }, {
      preserveScroll: true,
      preserveState: true,
      errorBag: rowId,
      onStart: () => setProcessing(true),
      onSuccess: () => setMessage(`${menu.name} ditandai ${soldOut ? 'tersedia' : 'habis'} di ${operation.post.name}.`),
      onError: errors => setError(firstError(errors)),
      onFinish: () => setProcessing(false),
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3.5 border-b border-sand-border last:border-b-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="w-12 h-12 rounded-2xl overflow-hidden bg-sand-surface border border-sand-border flex items-center justify-center shrink-0">
          {menu.photo ? (
            <img src={menu.photo} alt="" width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Utensils size={20} className="text-clay-400" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <strong className="block text-sm font-bold text-clay-900 truncate">{menu.name}</strong>
          <span className="text-xs font-semibold text-clay-600 mt-0.5 block">{rupiah(menu.price)}</span>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!soldOut}
        className="flex items-center gap-2 cursor-pointer shrink-0"
        disabled={processing}
        aria-label={`${menu.name} di ${operation.post.name}: ${soldOut ? 'habis, tandai tersedia' : 'tersedia, tandai habis'}`}
        aria-describedby={error ? `${rowId}-error` : undefined}
        onClick={toggleAvailability}
      >
        <span
          className={`relative inline-flex w-11 h-6 rounded-full transition-colors border ${
            soldOut ? 'bg-clay-200 border-clay-300' : 'bg-terracotta border-terracotta'
          } p-0.5`}
          aria-hidden="true"
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              soldOut ? 'translate-x-0' : 'translate-x-5'
            }`}
          />
        </span>
        <span className={`text-xs font-bold min-w-[54px] text-left ${soldOut ? 'text-clay-700' : 'text-terracotta'}`}>
          {processing ? 'Menyimpan…' : soldOut ? 'Habis' : 'Tersedia'}
        </span>
      </button>
      {error && <p className="daily-field-error w-full text-xs text-rose-600 mt-1" id={`${rowId}-error`} role="alert">{error}</p>}
      <span className="profile-sr-only" role="status">{message}</span>
    </li>
  );
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
    form.setDefaults(values);
    form.setData(values);
    form.clearErrors();
    setMessage('');
    setRestoreError('');
    setEditing(true);
  }

  function restoreRoutine() {
    setMessage('');
    setRestoreError('');
    router.delete(endpoint, {
      preserveScroll: true,
      preserveState: true,
      errorBag: `restoreHours-${post.id}`,
      onStart: () => setRestoring(true),
      onSuccess: () => setMessage('Jam khusus dihapus. Pos kembali mengikuti jadwal rutin.'),
      onError: errors => setRestoreError(firstError(errors)),
      onFinish: () => setRestoring(false),
    });
  }

  return (
    <section className="bg-white p-6 rounded-3xl border border-sand-border shadow-soft flex flex-col gap-4" aria-labelledby={`hours-title-${post.id}`}>
      <div className="flex items-center justify-between pb-3 border-b border-sand-border">
        <h2 id={`hours-title-${post.id}`} className="text-lg font-extrabold text-clay-900 tracking-tight">Jam Hari Ini</h2>
        <span className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta flex items-center justify-center">
          <Clock3 size={16} />
        </span>
      </div>

      {post.today_hours ? (
        <div className="py-2">
          <strong className="text-2xl sm:text-3xl font-extrabold text-clay-900 tracking-tight block">
            {post.today_hours.opens_at.slice(0, 5)}–{post.today_hours.closes_at.slice(0, 5)}{post.today_hours.closes_tomorrow ? ' besok' : ''} WIB
          </strong>
          <span className="text-xs font-semibold text-terracotta-600 mt-1 block">Jam khusus · jadwal rutin tetap tersimpan</span>
        </div>
      ) : (
        <div className="py-2">
          <strong className="text-2xl sm:text-3xl font-extrabold text-clay-900 tracking-tight block">
            {isPermanent ? 'Pos tutup permanen' : post.operating_status === 'temporarily_closed' ? 'Pos tutup sementara' : post.schedule_today?.label ?? 'Mengikuti jadwal rutin'}{!isPermanent && post.operating_status !== 'temporarily_closed' && /\d/.test(post.schedule_today?.label ?? '') ? ' WIB' : ''}
          </strong>
          <span className="text-xs font-semibold text-clay-700 mt-1 block">
            {post.operating_status === 'temporarily_closed' ? 'Isi jam khusus untuk membuka pos hari ini.' : isPermanent ? 'Ubah kondisi operasional untuk membuka kembali.' : post.schedule_today?.source ?? 'Jadwal rutin'}
          </span>
        </div>
      )}

      {updated && <p className="text-xs text-clay-600 font-medium">Jam hari ini diperbarui {updated}.</p>}
      {isPermanent && <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl"><Info size={14} className="inline mr-1" />Pos tutup permanen.</p>}

      <div className="flex flex-col gap-2 mt-1" hidden={editing}>
        <button
          ref={editButton}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-terracotta hover:bg-terracotta-600 text-white !text-white font-bold text-xs shadow-md shadow-terracotta/20 flex items-center justify-center gap-2 transition cursor-pointer"
          onClick={startEditing}
          disabled={isPermanent || restoring}
          aria-controls={`hours-form-${post.id}`}
          aria-expanded={editing}
        >
          <Clock3 size={15} aria-hidden="true" />
          <span className="text-white !text-white">{post.today_hours || post.is_open ? 'Ubah jam hari ini' : 'Buka sekarang'}</span>
        </button>

        {post.today_hours && (
          <button
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-terracotta bg-terracotta-50/70 hover:bg-[#fdeee9] border border-terracotta-200/60 hover:border-terracotta-200 flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer"
            type="button"
            onClick={restoreRoutine}
            disabled={restoring}
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>{restoring ? 'Memulihkan…' : 'Kembali ke jadwal rutin'}</span>
          </button>
        )}

        <button
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] border border-transparent hover:border-terracotta-200 transition-colors duration-150 cursor-pointer"
          type="button"
          onClick={onRoutine}
        >
          Atur jadwal rutin di Pos & Jadwal →
        </button>
      </div>

      <form hidden={!editing} className="flex flex-col gap-3 mt-1" id={`hours-form-${post.id}`} onSubmit={event => {
        event.preventDefault();
        form.post(endpoint, { preserveScroll: true, preserveState: true, errorBag: `todayHours-${post.id}`,
          onSuccess: () => { form.setDefaults(); setEditing(false); setMessage('Jam khusus tersimpan untuk pos ini.'); requestAnimationFrame(() => editButton.current?.focus({ preventScroll: true })); },
        });
      }}>
        <p className="text-xs text-clay-500">Isi jam buka & tutup pos untuk hari ini.</p>
        {form.hasErrors && <p className="text-xs text-rose-600" role="alert">{Object.values(form.errors).join(' ')}</p>}
        <fieldset disabled={form.processing} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`opens-${post.id}`} className="block text-[11px] font-bold text-clay-400 uppercase mb-1">
                Buka{startedYesterday ? ' kemarin' : ''} (WIB)
              </label>
              <input ref={opensInput} id={`opens-${post.id}`} type="time" required className="w-full bg-clay-50 text-clay-900 text-sm font-bold rounded-xl px-3 py-2 border border-sand-border focus:ring-2 focus:ring-terracotta/20 outline-none" value={form.data.opens_at} onChange={event => form.setData('opens_at', event.target.value)} />
            </div>
            <div>
              <label htmlFor={`closes-${post.id}`} className="block text-[11px] font-bold text-clay-400 uppercase mb-1">
                Tutup{closingDay ? ` ${closingDay}` : ''} (WIB)
              </label>
              <input id={`closes-${post.id}`} type="time" required className="w-full bg-clay-50 text-clay-900 text-sm font-bold rounded-xl px-3 py-2 border border-sand-border focus:ring-2 focus:ring-terracotta/20 outline-none" value={form.data.closes_at} onChange={event => form.setData('closes_at', event.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              className="flex-1 py-2 px-3 rounded-xl border border-sand-border text-xs font-semibold text-clay-600 hover:bg-clay-100/80 hover:text-clay-900 transition-colors duration-150 cursor-pointer"
              type="button"
              onClick={() => { form.resetAndClearErrors(); setEditing(false); requestAnimationFrame(() => editButton.current?.focus({ preventScroll: true })); }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-terracotta hover:bg-terracotta-600 text-white font-bold text-xs shadow-md shadow-terracotta/20 transition-colors duration-150 cursor-pointer"
            >
              {form.processing ? 'Menyimpan…' : 'Simpan Jam'}
            </button>
          </div>
        </fieldset>
      </form>

      {restoreError && <p className="text-xs text-rose-600" role="alert">{restoreError}</p>}
      {message && <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl font-semibold flex items-center gap-1.5" role="status"><Check size={14} />{message}</p>}
    </section>
  );
}

export default function DailyOperations({ operations, selectedPostId, onSelectPost, onRoutine, onDirty }: { operations: DailyOperation[]; selectedPostId: number; onSelectPost: (id: number) => void; onRoutine: () => void; onDirty?: (key: string, dirty: boolean) => void }) {
  const [drafts, setDrafts] = useState<Record<number, boolean>>({});
  const reportDirty = useCallback((postId: number, dirty: boolean) => setDrafts(previous => previous[postId] === dirty ? previous : { ...previous, [postId]: dirty }), []);
  const hasDraft = Object.values(drafts).some(Boolean);

  useEffect(() => { onDirty?.('daily', hasDraft); }, [hasDraft, onDirty]);
  useEffect(() => () => onDirty?.('daily', false), [onDirty]);

  if (!operations.length) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-soft flex items-center gap-4 text-clay-500">
        <MapPin size={24} className="text-terracotta shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-extrabold text-clay-900 text-base">Belum ada pos untuk dikelola</h3>
          <p className="text-xs text-clay-500 mt-1">Tambahkan pos dari tab Pos & Jadwal agar jam dan ketersediaan menunya dapat diatur di sini.</p>
        </div>
      </div>
    );
  }

  const selected = operations.find(operation => operation.post.id === selectedPostId) ?? operations[0];
  const status = operationStatus(selected.post);

  return (
    <div className="flex flex-col gap-6">
      {/* Pos Selector Card */}
      <section className="bg-white p-5 rounded-3xl border border-sand-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4" aria-labelledby="owner-post-label">
        <div className="flex-1 min-w-0">
          <label id="owner-post-label" htmlFor="owner-post-select" className="block text-[11px] font-bold text-clay-700 uppercase tracking-wider mb-1.5">
            Lokasi jualan yang diatur
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-auto">
              <select
                id="owner-post-select"
                className="w-full sm:w-auto appearance-none bg-clay-50 hover:bg-clay-100/70 text-clay-900 text-sm font-extrabold rounded-xl pl-3 pr-8 py-2 border border-sand-border cursor-pointer transition focus:ring-2 focus:ring-terracotta/20 outline-none"
                value={selected.post.id}
                onChange={event => onSelectPost(Number(event.target.value))}
              >
                {operations.map(operation => <option key={operation.post.id} value={operation.post.id}>{operation.post.name}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-clay-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-clay-700 font-medium">
              <MapPin size={14} className="text-terracotta shrink-0" aria-hidden="true" />
              <span className="truncate">{selected.post.address}</span>
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 w-fit ${
          status.open
            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            : 'text-amber-700 bg-amber-50 border border-amber-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.open ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
          {status.label}
        </span>
      </section>

      {/* Columns: Menu Availability & Today Hours */}
      {operations.map(operation => {
        const available = operation.menus.filter(menu => !menuSoldOut(menu, operation.post.id)).length;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" key={operation.post.id} hidden={operation.post.id !== selected.post.id}>
            {/* Left Column: Ketersediaan Menu (7 cols) */}
            <section className="lg:col-span-7 bg-white p-6 rounded-3xl border border-sand-border shadow-soft" aria-labelledby={`stock-title-${operation.post.id}`}>
              <header className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-sand-border">
                <h2 id={`stock-title-${operation.post.id}`} className="text-lg font-extrabold text-clay-900 tracking-tight">Ketersediaan Menu</h2>
                <span className="text-xs font-bold text-terracotta bg-terracotta-50 border border-terracotta-200 px-2.5 py-0.5 rounded-full">{available} tersedia</span>
              </header>
              {operation.menus.length ? (
                <ul className="divide-y divide-sand-border">
                  {operation.menus.map(menu => <AvailabilityRow key={menu.id} operation={operation} menu={menu} />)}
                </ul>
              ) : (
                <p className="text-xs text-clay-500 py-4">Belum ada menu. Tambahkan dari tab Menu & harga.</p>
              )}
              <p className="flex items-center gap-2 text-xs text-clay-400 mt-4 pt-3 border-t border-sand-border">
                <Info size={14} className="text-clay-400 shrink-0" aria-hidden="true" />
                Status habis tersimpan di pos ini sampai kamu mengubahnya.
              </p>
              {operation.menus.length > 0 && available === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-3 font-medium">
                  Semua menu habis. Status buka pos tetap mengikuti jadwalnya.
                </p>
              )}
            </section>

            {/* Right Column: Jam Hari Ini (5 cols) */}
            <div className="lg:col-span-5">
              <TodayHours operation={operation} onDirty={reportDirty} onRoutine={onRoutine} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
