import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Dialog from '@/components/Dialog';
import Button from '@/components/Button';
import { ErrorSummary } from './ProfileFields';

export function EditorDialog({ title, children, dirty, processing, onClose, wide = false }: { title: string; children: ReactNode; dirty: boolean; processing: boolean; onClose: () => void; wide?: boolean }) {
  const [discarding, setDiscarding] = useState(false);
  const continueButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const requestClose = () => { if (processing) return; if (dirty) { previousFocus.current = document.activeElement as HTMLElement | null; setDiscarding(true); } else onClose(); };
  useEffect(() => { if (discarding) continueButton.current?.focus(); else previousFocus.current?.focus(); }, [discarding]);
  return <Dialog title={discarding ? 'Tutup tanpa menyimpan?' : title} onClose={() => discarding ? setDiscarding(false) : requestClose()} wide={wide}><div hidden={discarding} aria-busy={processing}><fieldset className="profile-dialog-fields" disabled={processing}>{children}</fieldset></div>{discarding && <div className="profile-confirm"><AlertTriangle size={28} /><p>Perubahan pada formulir ini belum disimpan. Kamu dapat melanjutkan pengeditan atau membuang draf ini.</p><div className="profile-confirm-actions"><button ref={continueButton} type="button" className="profile-secondary" onClick={() => setDiscarding(false)}>Lanjut mengedit</button><button type="button" className="profile-danger" onClick={onClose}>Buang perubahan</button></div></div>}</Dialog>;
}

export function DeleteDialog({ title, name, endpoint, description, onClose, onDeleted }: { title: string; name: string; endpoint: string; description?: string; onClose: () => void; onDeleted: () => void }) {
  const form = useForm({});
  return <Dialog title={title} onClose={() => { if (!form.processing) onClose(); }}><form className="profile-form" onSubmit={event => { event.preventDefault(); form.delete(endpoint, { preserveScroll: true, errorBag: 'deleteProfileItem', onSuccess: onDeleted }); }}><p className="profile-dialog-intro">Hapus <strong>{name}</strong>? {description ?? 'Data ini akan hilang dari profil usaha dan tidak dapat dikembalikan.'}</p><ErrorSummary errors={form.errors} /><div className="profile-confirm-actions"><button className="profile-secondary" type="button" disabled={form.processing} onClick={onClose}>Batal</button><Button className="profile-danger" disabled={form.processing}><Trash2 size={17} />{form.processing ? 'Menghapus…' : 'Ya, hapus'}</Button></div></form></Dialog>;
}
