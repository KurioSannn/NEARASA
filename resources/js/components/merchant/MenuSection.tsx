import { useCallback, useRef, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Check, ChevronDown, Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import Dialog from '@/components/Dialog';
import { rupiah, type SharedProps } from '@/types/catalog';
import type { MerchantBusiness, MerchantMenu } from '@/types/business-profile';
import { DeleteDialog, EditorDialog } from './ProfileDialogs';
import { CheckField, ErrorSummary, FileField, imageAccept, imageHint, SectionHeading, SelectField, TextAreaField, TextField } from './ProfileFields';
import { type DirtyReporter, useProfileDraft } from './useProfileDraft';

function MenuEditor({ business, menu, onClose, onSaved, onDelete, onDirty }: { business: MerchantBusiness; menu: MerchantMenu | null; onClose: () => void; onSaved: () => void; onDelete: () => void; onDirty: DirtyReporter }) {
  const { options } = usePage<SharedProps>().props;
  const form = useForm({ name: menu?.name ?? '', description: menu?.description ?? '', group: menu?.group ?? options.groups[0] ?? '', category: menu?.category ?? options.categories[0] ?? '', price: menu ? menu.price.toLocaleString('id-ID') : '', sold_out: menu?.sold_out ?? false, photo: null as File | null, remove_photo: false });
  useProfileDraft('menus', form.isDirty, onDirty);
  return (
    <EditorDialog
      title={menu ? `Edit menu: ${menu.name}` : 'Tambah menu'}
      dirty={form.isDirty}
      processing={form.processing}
      onClose={onClose}
    >
      <form
        className="profile-form owner-settings-form"
        onSubmit={event => {
          event.preventDefault();
          form.transform(data => ({ ...data, price: data.price.replaceAll('.', ''), ...(menu ? { _method: 'patch' } : {}) }));
          form.post(`/kelola-usaha/${business.slug}/menu${menu ? `/${menu.id}` : ''}`, { forceFormData: true, preserveScroll: true, errorBag: 'profileMenu', onSuccess: onSaved });
        }}
      >
        <ErrorSummary errors={form.errors} />
        <TextField id="menu-name" label="Nama menu" required maxLength={120} value={form.data.name} onChange={event => form.setData('name', event.target.value)} error={form.errors.name} />
        <div className="profile-field">
          <label htmlFor="menu-price">Harga</label>
          <div>
            <div className="owner-currency-input">
              <span>Rp</span>
              <input id="menu-price" className="text-input" inputMode="numeric" pattern="[0-9.]+" required aria-invalid={Boolean(form.errors.price)} aria-describedby={form.errors.price ? 'menu-price-error' : undefined} value={form.data.price} onChange={event => form.setData('price', event.target.value)} />
            </div>
            {form.errors.price && <p className="profile-field-error" id="menu-price-error">{form.errors.price}</p>}
          </div>
        </div>
        <SelectField id="menu-group" label="Jenis menu" required options={options.groups.map(value => [value, value])} value={form.data.group} onChange={event => form.setData('group', event.target.value)} error={form.errors.group} />
        <SelectField id="menu-category" label="Kategori" required options={options.categories.map(value => [value, value])} value={form.data.category} onChange={event => form.setData('category', event.target.value)} error={form.errors.category} />
        <div className="owner-menu-photo-fields">
          {menu?.photo && !form.data.remove_photo && <img className="owner-current-menu-photo" src={menu.photo} alt={`Foto ${menu.name} saat ini`} width={60} height={60} />}
          <FileField id="menu-photo" label="Foto menu (opsional)" accept={imageAccept} hint={imageHint} disabled={form.data.remove_photo} error={form.errors.photo} onChange={event => form.setData('photo', event.target.files?.[0] ?? null)} />
          {menu?.photo && <CheckField label="Hapus foto saat disimpan" checked={form.data.remove_photo} onChange={event => form.setData(data => ({ ...data, remove_photo: event.target.checked, photo: null }))} />}
        </div>
        <TextAreaField id="menu-description" label="Deskripsi (opsional)" maxLength={1000} rows={3} value={form.data.description} onChange={event => form.setData('description', event.target.value)} error={form.errors.description} />
        <details className="profile-optional-group">
          <summary>Ketersediaan bawaan<span>{form.data.sold_out ? 'Habis' : 'Tersedia'}</span></summary>
          <CheckField label="Habis sebagai ketersediaan bawaan" hint="Hanya berlaku bagi pos yang belum punya pengaturan sendiri. Ubah stok per pos melalui Operasional." checked={form.data.sold_out} onChange={event => form.setData('sold_out', event.target.checked)} />
        </details>
        {form.progress && <p className="profile-hint" role="status">Mengunggah {Math.round(form.progress.percentage ?? 0)}%</p>}
        <footer className="owner-editor-footer">
          {menu && <button type="button" className="owner-button owner-button-danger" disabled={business.menus.length <= 1} title={business.menus.length <= 1 ? 'Minimal satu menu harus tetap ada.' : undefined} onClick={onDelete}><Trash2 size={17} aria-hidden="true" />Hapus menu</button>}
          <button type="button" className="owner-button owner-button-secondary owner-cancel" onClick={onClose}>Batal</button>
          <button type="submit" className="owner-button owner-save" disabled={form.processing}>{form.processing ? 'Menyimpan…' : 'Simpan menu'}</button>
        </footer>
      </form>
    </EditorDialog>
  );
}

export default function MenuSection({ business, onDirty }: { business: MerchantBusiness; onDirty: DirtyReporter }) {
  const [editor, setEditor] = useState<{ menu: MerchantMenu | null } | null>(null);
  const [pendingEditor, setPendingEditor] = useState<{ menu: MerchantMenu | null } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [deleting, setDeleting] = useState<MerchantMenu | null>(null);
  const [message, setMessage] = useState('');
  const trigger = useRef<HTMLElement | null>(null);
  const reportDirty = useCallback((key: string, value: boolean) => { setDirty(value); onDirty(key, value); }, [onDirty]);
  function choose(menu: MerchantMenu | null) {
    if (editor?.menu?.id === menu?.id && editor) return;
    trigger.current = document.activeElement as HTMLElement;
    if (dirty) setPendingEditor({ menu }); else { setMessage(''); setEditor({ menu }); }
  }
  function close() { setEditor(null); setDirty(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); }
  const renderEditor = (menu: MerchantMenu | null) => <MenuEditor key={menu?.id ?? 'new'} business={business} menu={menu} onClose={close} onSaved={() => { close(); setMessage('Menu dan harga tersimpan.'); }} onDelete={() => menu && setDeleting(menu)} onDirty={reportDirty} />;
  return <div className="profile-card owner-menu-section"><SectionHeading title="Menu & harga" description={`Berlaku untuk semua lokasi ${business.name}.`} action={<button type="button" className="owner-button" onClick={() => choose(null)}><Plus size={17} aria-hidden="true" />Tambah menu</button>} />
    {message && <p className="profile-success" role="status"><Check size={17} aria-hidden="true" />{message}</p>}
    {editor && renderEditor(editor.menu)}
    {business.menus.length ? <ul className="owner-menu-list">{business.menus.map(menu => <li key={menu.id}><div className="owner-menu-row"><button type="button" className="owner-menu-expand" aria-label={`Edit ${menu.name}`} onClick={() => choose(menu)}><ChevronDown size={19} aria-hidden="true" /></button><span className="owner-menu-thumbnail">{menu.photo ? <img src={menu.photo} alt="" width={56} height={56} loading="lazy" /> : <Utensils size={23} aria-hidden="true" />}</span><div className="owner-menu-identity"><h3>{menu.name}</h3><p>{menu.group} / {menu.category}</p>{menu.sold_out && <span className="owner-caption">Bawaan: habis</span>}</div><strong className="owner-menu-price">{rupiah(menu.price)}</strong><button type="button" className="owner-text-link owner-menu-edit" onClick={() => choose(menu)}><Pencil size={17} aria-hidden="true" />Edit<span className="profile-sr-only"> {menu.name}</span></button></div></li>)}</ul> : !editor && <div className="owner-empty"><Utensils size={28} aria-hidden="true" /><h3>Belum ada menu</h3><p>Tambahkan menu beserta harga untuk membantu pelanggan memilih.</p></div>}
    {business.menus.length === 1 && <p className="owner-inline-hint">Minimal satu menu harus tetap ada. Tambahkan menu lain sebelum menghapus menu terakhir.</p>}
    {pendingEditor && <Dialog title="Ganti menu yang sedang diedit?" onClose={() => setPendingEditor(null)}><div className="profile-confirm"><p>Ada perubahan menu yang belum disimpan.</p><div className="profile-confirm-actions"><button type="button" className="profile-secondary" onClick={() => setPendingEditor(null)}>Lanjut mengedit</button><button type="button" className="profile-danger" onClick={() => { setEditor(pendingEditor); setPendingEditor(null); setDirty(false); }}>Buang perubahan & ganti</button></div></div></Dialog>}
    {deleting && <DeleteDialog title="Hapus menu?" name={deleting.name} endpoint={`/kelola-usaha/${business.slug}/menu/${deleting.id}`} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); close(); setMessage('Menu dihapus.'); }} />}
  </div>;
}
