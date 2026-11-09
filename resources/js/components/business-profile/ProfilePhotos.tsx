import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Expand, ImageOff, X } from 'lucide-react';
import { photoKinds } from '@/types/business-profile';
import type { Business } from '@/types/catalog';
import { businessCover } from '@/types/business-images';

type Photo = { src: string; alt: string; caption?: string };
type PhotoButtonProps = Photo & { className?: string; eager?: boolean; onOpen?: () => void };
const PhotoContext = createContext<(photo: Photo) => void>(() => {});

export function PhotoViewer({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!photo || !dialog.current) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    closeButton.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, [photo]);
  return <PhotoContext.Provider value={setPhoto}>
    {children}
    {photo && <dialog ref={dialog} className="profile-photo-dialog" aria-labelledby="profile-photo-title" onClose={() => setPhoto(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="profile-photo-dialog-heading"><h2 id="profile-photo-title">{photo.alt}</h2><button ref={closeButton} className="icon-button" type="button" aria-label="Tutup foto" onClick={() => dialog.current?.close()}><X size={22} /></button></div>
      <img src={photo.src} alt={photo.alt} width={1200} height={800} />
      {photo.caption && <p>{photo.caption}</p>}
    </dialog>}
  </PhotoContext.Provider>;
}
function PhotoButton({ src, alt, caption, className = '', eager = false, onOpen }: PhotoButtonProps) {
  const openPhoto = useContext(PhotoContext);
  const img = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => { if (img.current?.complete) setStatus(img.current.naturalWidth ? 'ready' : 'error'); }, []);
  return <button className={'profile-photo-button ' + className + ' photo-' + status} type="button" disabled={status !== 'ready'} aria-busy={status === 'loading'} onClick={() => { onOpen?.(); openPhoto({ src, alt, caption }); }} aria-label={(status === 'ready' ? 'Perbesar: ' : status === 'loading' ? 'Memuat foto: ' : 'Foto belum bisa dimuat: ') + alt}>
    <img ref={img} src={src} alt={alt} width={600} height={400} loading={eager ? 'eager' : 'lazy'} aria-hidden={status !== 'ready'} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
    {status === 'loading' && <span className="profile-photo-skeleton" aria-hidden="true"><span className="skeleton-block" /></span>}
    {status === 'error' && <span className="profile-photo-error"><ImageOff size={24} aria-hidden="true" /><span>Foto belum bisa dimuat</span></span>}
    {status === 'ready' && <span className="profile-photo-expand" aria-hidden="true"><Expand size={16} /></span>}
  </button>;
}
export function ProfilePhoto(props: PhotoButtonProps) {
  return <PhotoButton key={props.src} {...props} />;
}
export default function ProfilePhotos({ business }: { business: Business }) {
  const photos = [
    ...(business.photo ? [{ key: 'cover', src: businessCover(business), caption: 'Foto sampul', alt: 'Foto sampul ' + business.name }] : []),
    ...(business.logo ? [{ key: 'logo', src: business.logo, caption: 'Logo usaha', alt: 'Logo ' + business.name }] : []),
    ...(business.gallery ?? []).map(photo => ({ key: 'gallery-' + photo.id, src: photo.photo, caption: photo.caption, alt: photo.caption || (photoKinds.find(([key]) => key === photo.kind)?.[1] ?? 'Foto') + ' ' + business.name })),
  ];
  return <><div className="section-header"><div><h2>Foto usaha</h2><p className="profile-section-intro">Tempat, suasana, dan makanan dari pemilik usaha.</p></div><span>{photos.length} foto</span></div>
    <div className="profile-gallery">{photos.map(photo => <figure key={photo.key}><ProfilePhoto src={photo.src} alt={photo.alt} caption={photo.caption} className={photo.key === 'logo' ? 'profile-gallery-logo' : ''} />{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>)}</div>
  </>;
}
