import { Link, usePage } from '@inertiajs/react';
import { Home, LayoutGrid, Settings, ShieldCheck, Store } from 'lucide-react';
import type { MerchantNavigation } from '@/types/merchant';

export default function CurvedSidebar({ merchantNavigation }: { merchantNavigation: MerchantNavigation }) {
  const { url } = usePage();
  const pageUrl = (url || '').split('?')[0];
  const activeNav =
    pageUrl === '/kelola-usaha'
      ? 'dashboard'
      : pageUrl.startsWith('/kelola-usaha/ulasan')
      ? 'reports'
      : pageUrl.startsWith('/kelola-usaha/setelan')
      ? 'settings'
      : 'manage';

  const mobileItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/kelola-usaha', icon: LayoutGrid, active: activeNav === 'dashboard' },
    { key: 'manage', label: 'Kelola', href: merchantNavigation.manage_url, icon: Store, active: activeNav === 'manage' },
    {
      key: 'reports',
      label: 'Ulasan',
      href: '/kelola-usaha/ulasan',
      icon: ShieldCheck,
      active: activeNav === 'reports',
    },
    { key: 'settings', label: 'Setelan', href: '/kelola-usaha/setelan', icon: Settings, active: activeNav === 'settings' },
    { key: 'public', label: 'Publik', href: '/', icon: Home, active: false },
  ];

  return (
    <>
      <aside
        className="hidden lg:flex flex-col items-center gap-4 w-16 py-4 bg-white rounded-3xl border border-sand-border shadow-soft shrink-0 h-fit self-start sticky top-20 z-20"
        data-purpose="curved-sidebar"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {/* Primary Navigation Icons */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Dashboard Tab */}
          <Link
            href="/kelola-usaha"
            aria-label="Dashboard Utama"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
              activeNav === 'dashboard'
                ? 'bg-terracotta text-white !text-white shadow-md shadow-terracotta/25'
                : 'text-clay-700 hover:text-terracotta hover:bg-[#fdeee9]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" aria-hidden="true" />
          </Link>

          {/* Kelola Usaha Tab */}
          <Link
            href={merchantNavigation.manage_url}
            aria-label="Kelola Usaha & Pos"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
              activeNav === 'manage'
                ? 'bg-terracotta text-white !text-white shadow-md shadow-terracotta/25'
                : 'text-clay-700 hover:text-terracotta hover:bg-[#fdeee9]'
            }`}
          >
            <Store className="w-5 h-5" aria-hidden="true" />
          </Link>

          {/* Review Tab */}
          <Link
            href="/kelola-usaha/ulasan"
            aria-label="Ulasan pelanggan"
            title="Ulasan pelanggan"
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
              activeNav === 'reports'
                ? 'bg-terracotta text-white !text-white shadow-md shadow-terracotta/25'
                : 'text-clay-700 hover:text-terracotta hover:bg-[#fdeee9]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {/* Settings & Home Return */}
        <div className="flex flex-col items-center gap-2.5 pt-3 border-t border-sand-border w-10">
          <Link
            href="/kelola-usaha/setelan"
            aria-label="Setelan Mitra & Toko"
            title="Setelan Mitra & Toko"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
              activeNav === 'settings'
                ? 'bg-terracotta text-white !text-white shadow-md shadow-terracotta/25'
                : 'text-clay-700 hover:text-terracotta hover:bg-[#fdeee9]'
            }`}
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            aria-label="Kembali ke Beranda NEARASA"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] transition-colors duration-150"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </aside>

      {/* Mobile Floating Island Capsule Pill Navigation */}
      <nav
        aria-label="Navigasi Bawah Seluler"
        data-purpose="merchant-mobile-pill-nav"
        className="lg:hidden fixed z-50 left-1/2 -translate-x-1/2 bottom-[max(14px,env(safe-area-inset-bottom))] w-auto max-w-[calc(100%-20px)] flex justify-center pointer-events-none"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="pointer-events-auto inline-flex items-center justify-center gap-1.5 max-[370px]:gap-1 max-[350px]:gap-0.5 p-1.5 max-[370px]:p-1 max-[350px]:p-0.5 rounded-full bg-[#fffdfa]/96 backdrop-blur-md border border-sand-border shadow-[0_8px_30px_rgba(59,43,38,0.14)]">
          {mobileItems.map(({ key, label, href, icon: Icon, active }) => (
            <Link
              key={key}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'relative h-[42px] max-[370px]:h-[38px] max-[350px]:h-[34px] rounded-full bg-terracotta text-white !text-white pl-[4px] pr-3.5 max-[370px]:pr-2.5 max-[350px]:pr-2 gap-2 max-[350px]:gap-1 inline-flex items-center shrink-0 shadow-xs transition-all duration-200'
                  : 'relative w-[42px] h-[42px] max-[370px]:w-[38px] max-[370px]:h-[38px] max-[350px]:w-[34px] max-[350px]:h-[34px] rounded-full bg-[#f5ece3] hover:bg-[#f1d4bb] text-[#77645b] hover:text-[#3b2b26] inline-flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95'
              }
            >
              {active ? (
                <>
                  <span className="w-[34px] h-[34px] max-[370px]:w-[30px] max-[370px]:h-[30px] max-[350px]:w-[26px] max-[350px]:h-[26px] rounded-full bg-white text-terracotta grid place-items-center shrink-0">
                    <Icon className="w-[18px] h-[18px] max-[350px]:w-[15px] max-[350px]:h-[15px] stroke-[2.2]" aria-hidden="true" />
                  </span>
                  <span className="text-[13px] max-[370px]:text-[12px] max-[350px]:text-[11px] font-bold text-white !text-white leading-none whitespace-nowrap tracking-[-0.2px]">
                    {label}
                  </span>
                </>
              ) : (
                <>
                  <Icon className="w-[20px] h-[20px] max-[350px]:w-[17px] max-[350px]:h-[17px] stroke-[1.9]" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
