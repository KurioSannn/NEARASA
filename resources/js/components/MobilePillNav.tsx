import { Link, usePage } from '@inertiajs/react';
import { Award, Compass, Heart, House, Map, UserRound } from 'lucide-react';
import { useUi } from '@/layouts/CustomerLayout';

export default function MobilePillNav() {
  const { url } = usePage();
  const { openAccount } = useUi();
  const path = url.split('?')[0];
  const active = url.startsWith('/awards')
    ? 'Awards'
    : url.startsWith('/favorit')
    ? 'Favorit'
    : url.startsWith('/akun') || url.startsWith('/masuk') || url.startsWith('/riwayat')
    ? 'Akun'
    : path === '/peta'
    ? 'Peta'
    : path === '/'
    ? 'Beranda'
    : 'Jelajah';

  const items = [
    { label: 'Beranda', icon: House, href: '/' },
    { label: 'Jelajah', icon: Compass, href: '/jelajah' },
    { label: 'Peta', icon: Map, href: '/peta' },
    { label: 'Awards', icon: Award, href: '/awards' },
    { label: 'Favorit', icon: Heart },
    { label: 'Akun', icon: UserRound },
  ];
  return <nav className="mobile-pill-wrap" aria-label="Navigasi bawah"><div className="mobile-pill">
    {items.map(({ label, icon: Icon, href }) => {
      const content = <><span className="pill-symbol"><Icon size={21} /></span><span className="pill-label">{label}</span></>;
      return href ? <Link key={label} href={href} className={`pill-item ${active === label ? 'active' : ''}`} aria-label={label} aria-current={active === label ? 'page' : undefined}>{content}</Link> : <button key={label} type="button" className={`pill-item ${active === label ? 'active' : ''}`} aria-current={active === label ? 'page' : undefined} aria-label={label} onClick={() => openAccount(label)}>{content}</button>;
    })}
  </div></nav>;
}
