import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

function Photo({ src, className = '', eager = false }: { src: string; className?: string; eager?: boolean }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => { if (image.current?.complete) setState(image.current.naturalWidth ? 'ready' : 'error'); }, []);
  return <div className={`consumer-photo ${className} is-${state}`}>
    {state !== 'error' && <img ref={image} src={src} alt="" width={720} height={440} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" onLoad={() => setState('ready')} onError={() => setState('error')} />}
    {state === 'loading' && <span className="consumer-image-skeleton" aria-hidden="true" />}
    {state === 'error' && <span className="consumer-image-fallback"><ImageOff size={27} aria-hidden="true" /><span>Foto belum tersedia</span></span>}
  </div>;
}
export default function ConsumerPhoto(props: { src: string; className?: string; eager?: boolean }) { return <Photo key={props.src} {...props} />; }
