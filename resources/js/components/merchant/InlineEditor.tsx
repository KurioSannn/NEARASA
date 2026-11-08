import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import Dialog from '@/components/Dialog';

export default function InlineEditor({ title, dirty, processing, onClose, children }: { title: string; dirty: boolean; processing: boolean; onClose: () => void; children: (requestClose: () => void) => ReactNode }) {
  const id = useId();
  const [discarding, setDiscarding] = useState(false);
  const editor = useRef<HTMLElement>(null);
  useEffect(() => { editor.current?.querySelector<HTMLInputElement>('input:not([type="hidden"]):not([type="file"])')?.focus({ preventScroll: true }); }, []);
  const requestClose = () => { if (!processing) { if (dirty) setDiscarding(true); else onClose(); } };
  return <section ref={editor} className="owner-inline-editor" aria-labelledby={id} aria-busy={processing}><header><h3 id={id}>{title}</h3>{dirty && <span className="owner-draft-label">Belum disimpan</span>}<button className="icon-button" type="button" disabled={processing} onClick={requestClose} aria-label={`Tutup ${title.toLowerCase()}`}><X size={17} aria-hidden="true" /></button></header>{children(requestClose)}{discarding && <Dialog title="Buang perubahan yang belum disimpan?" onClose={() => setDiscarding(false)}><div className="profile-confirm"><p>Perubahan pada formulir ini belum disimpan.</p><div className="profile-confirm-actions"><button type="button" className="profile-secondary" onClick={() => setDiscarding(false)}>Lanjut mengedit</button><button type="button" className="profile-danger" onClick={onClose}>Buang perubahan</button></div></div></Dialog>}</section>;
}
