import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import DesktopHeader from '@/components/DesktopHeader';
import MobilePillNav from '@/components/MobilePillNav';
import LocationPicker from '@/components/LocationPicker';
import { type SharedProps } from '@/types/catalog';

const UiContext = createContext({ openLocation: () => {}, openAccount: (_purpose?: string) => {}, toggleFavorite: (_slug: string, _id: number) => {}, isNavigating: false });
export const useUi = () => useContext(UiContext);

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { props, url } = usePage<SharedProps>();
  const home = url.split('?')[0] === '/';
  const collection = /^\/(akun|favorit|riwayat|pemilik)(?:[/?]|$)/.test(url);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const start = router.on('start', () => setLoading(true));
    const finish = router.on('finish', () => setLoading(false));
    return () => { start(); finish(); };
  }, []);
  const openAccount = (purpose?: string) => router.visit(purpose === 'Favorit' ? '/favorit' : '/akun');
  const toggleFavorite = (slug: string, id: number) => {
    if (!props.auth.user) { router.visit('/favorit'); return; }
    const options = { preserveScroll: true };
    if (props.auth.favorites.includes(id)) router.delete('/favorit/' + slug, options);
    else router.post('/favorit/' + slug, {}, options);
  };
  return <UiContext.Provider value={{ openLocation: () => setLocationOpen(true), openAccount, toggleFavorite, isNavigating: loading }}>
    <div className={'customer-layout discovery-shell' + (home ? ' home-shell' : '') + (collection ? ' collection-shell' : '')}>
      <a className="skip-link" href="#main">Langsung ke isi</a>
      <DesktopHeader discovery />
      <main id="main" className="app-main" tabIndex={-1} aria-busy={loading}>{children}</main>
      <footer className="site-footer"><Link className="wordmark" href="/">nearasa<span>.</span></Link><p>Good food is closer than you think.</p><span>Katalog contoh · Sidoarjo & Surabaya</span></footer>
      <MobilePillNav />
      {locationOpen && <LocationPicker location={props.location} areas={props.options.areas} tileUrl={props.mapTiles} onClose={() => setLocationOpen(false)} />}
    </div>
  </UiContext.Provider>;
}

export function LocationButton() {
  const { location } = usePage<SharedProps>().props;
  const { openLocation } = useUi();
  return <button className="location-button" onClick={openLocation}><span className="location-disc"><MapPin size={22} /></span><span><small>Lokasi pencarian</small><strong>{location?.label ?? 'Pilih lokasimu'} <span aria-hidden="true">⌄</span></strong></span></button>;
}
