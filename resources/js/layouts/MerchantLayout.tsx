import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronDown, ChevronRight, FileText, LayoutDashboard, LogOut, Store, UserRound } from 'lucide-react';
import type { SharedProps } from '@/types/catalog';
import type { MerchantNavigation } from '@/types/merchant';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { auth, merchantNavigation, flash } = usePage<SharedProps & { merchantNavigation: MerchantNavigation }>().props;
  const { url } = usePage();
  const pathname = url.split('?')[0];
  const active = pathname === '/kelola-usaha' ? 'dashboard' : pathname === '/kelola-usaha/laporan' ? 'reports' : 'manage';
  const [navigating, setNavigating] = useState(false);
  const account = useRef<HTMLDetailsElement>(null);
  const nav = [
    { key: 'dashboard', label: 'Dashboard', href: '/kelola-usaha', icon: LayoutDashboard },
    { key: 'manage', label: 'Kelola usaha', href: merchantNavigation.manage_url, icon: Store },
    { key: 'reports', label: 'Laporan', href: '/kelola-usaha/laporan', icon: FileText },
  ];
  useEffect(() => {
    const start = router.on('start', () => setNavigating(true));
    const finish = router.on('finish', () => setNavigating(false));
    return () => { start(); finish(); };
  }, []);
  useEffect(() => { if (account.current) account.current.open = false; }, [url]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (account.current && !account.current.contains(event.target as Node)) account.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && account.current?.open) { account.current.open = false; account.current.querySelector('summary')?.focus(); } };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <div className="merchant-shell merchant-redesign">
    <aside className="merchant-sidebar"><Link href="/kelola-usaha" className="wordmark" aria-label="NEARASA, dashboard pemilik">nearasa<span>.</span></Link>
      <nav aria-label="Navigasi pemilik">{nav.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} className={active === key ? 'selected' : ''} aria-current={active === key ? 'page' : undefined}><Icon size={21} aria-hidden="true" /><span>{label}</span>{key === 'reports' && merchantNavigation.pending_reports > 0 && <span className="owner-nav-count" aria-label={`${merchantNavigation.pending_reports} perlu diperiksa`}>{merchantNavigation.pending_reports}</span>}</Link>)}</nav>
      <div className="owner-sidebar-foot"><Store size={20} aria-hidden="true" /><p>Ruang pemilik<span>Informasi yang kamu atur tampil di profil usahamu.</span></p></div>
    </aside>
    <div className="merchant-main"><header className="merchant-topbar">
      <Link href="/kelola-usaha" className="wordmark">nearasa<span>.</span></Link>
      <nav className="owner-breadcrumb" aria-label="Jejak halaman"><span>Ruang pemilik</span><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{nav.find(item => item.key === active)?.label}</span></nav>
      <div className="owner-header-actions"><Link href="/" className="owner-public-link">Lihat NEARASA<ArrowRight size={17} aria-hidden="true" /></Link>
        <details ref={account} className="owner-account"><summary aria-label={`Menu akun ${auth.user?.public_name || auth.user?.name || ''}`}><span className="owner-avatar">{(auth.user?.public_name || auth.user?.name || 'P').slice(0, 1).toLocaleUpperCase('id-ID')}</span><ChevronDown size={15} aria-hidden="true" /></summary><div className="owner-account-menu"><p>{auth.user?.public_name || auth.user?.name}<small>{auth.user?.email}</small></p><Link href="/akun"><UserRound size={16} aria-hidden="true" />Akun saya</Link>{auth.user && merchantNavigation.businesses.some(business => business.status === 'published') && <Link href={`/pemilik/${auth.user.id}`}><Store size={16} aria-hidden="true" />Profil publik pemilik</Link>}<button type="button" onClick={() => router.post('/keluar')}><LogOut size={16} aria-hidden="true" />Keluar akun</button></div></details>
      </div>
    </header><main id="main-content" className="merchant-content" aria-busy={navigating}>
      {flash.success && <p className="owner-flash" role="status">{flash.success}</p>}{children}
      <span className="profile-sr-only" role="status">{navigating ? 'Menyimpan atau memuat halaman. Konten yang sudah tersedia tetap ditampilkan.' : ''}</span>
    </main></div>
    <nav className="owner-mobile-nav" aria-label="Navigasi pemilik seluler">{nav.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} aria-current={active === key ? 'page' : undefined}><span><Icon size={22} aria-hidden="true" />{key === 'reports' && merchantNavigation.pending_reports > 0 && <span className="owner-nav-count" aria-label={`${merchantNavigation.pending_reports} perlu diperiksa`}>{merchantNavigation.pending_reports}</span>}</span>{label}</Link>)}</nav>
  </div>;
}
