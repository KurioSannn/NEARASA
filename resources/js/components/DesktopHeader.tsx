import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Heart, UserRound } from 'lucide-react';
import { LocationButton, useUi } from '@/layouts/CustomerLayout';
import type { SharedProps } from '@/types/catalog';

export default function DesktopHeader({ discovery = false }: { discovery?: boolean }) {
  const { url, props } = usePage<SharedProps>();
  const { openAccount } = useUi();
  const user = props.auth.user;
  const pathname = url.split('?')[0];
  const name = (user?.public_name || user?.name || '').trim();
  return <header className="desktop-header"><div className="header-inner">
    <Link href="/" className="header-brand" aria-label="NEARASA beranda">
      <img
        src="/images/logo/nearasa-logo-colored.png"
        alt="NEARASA Kuliner Lokal"
        className="brand-logo"
        width="96"
        height="40"
      />
    </Link>
    <nav aria-label="Navigasi utama"><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Beranda</Link><Link href="/jelajah" aria-current={(url.startsWith('/jelajah') || url.startsWith('/usaha/') || url.startsWith('/pemilik/')) ? 'page' : undefined}>{discovery ? 'Jelajah' : 'Jelajah rasa'}</Link><Link href="/peta" aria-current={url.startsWith('/peta') ? 'page' : undefined}>Peta</Link></nav>
    <div className="header-actions">{!discovery && <><LocationButton /><span className="header-divider" /></>}
      <button className="icon-button header-favorite" aria-label="Favorit" onClick={() => openAccount('Favorit')}><Heart size={19} aria-hidden="true" /></button>
      <button className="account-button" aria-label={user ? 'Buka akun' : 'Masuk'} onClick={() => openAccount('Akun')}>
        {discovery && user ? <span className="discovery-avatar" aria-hidden="true">{name.charAt(0).toLocaleUpperCase('id-ID') || 'A'}</span> : <UserRound size={19} aria-hidden="true" />}
        <span className="account-label">{discovery ? user ? name.split(' ')[0] : 'Masuk' : 'Akun'}</span>{discovery && user && <ChevronDown size={15} aria-hidden="true" />}
      </button>
    </div>
  </div></header>;
}
