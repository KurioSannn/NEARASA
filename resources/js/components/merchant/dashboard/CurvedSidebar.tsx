import { Link, usePage } from '@inertiajs/react';
import { Home, LayoutGrid, Settings, ShieldCheck, Store } from 'lucide-react';
import type { MerchantNavigation } from '@/types/merchant';

export default function CurvedSidebar({ merchantNavigation }: { merchantNavigation: MerchantNavigation }) {
  const { url } = usePage();
  const pageUrl = (url || '').split('?')[0];
  const activeNav = pageUrl === '/kelola-usaha' ? 'dashboard' : pageUrl.startsWith('/kelola-usaha/laporan') ? 'reports' : 'manage';
  const pending = merchantNavigation.pending_reports;

  return (
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
          href="/kelola-usaha/laporan"
          aria-label="Review Pos Tutup"
          title="Review Pos Tutup"
          className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
            activeNav === 'reports'
              ? 'bg-terracotta text-white !text-white shadow-md shadow-terracotta/25'
              : 'text-clay-700 hover:text-terracotta hover:bg-[#fdeee9]'
          }`}
        >
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          {pending > 0 && (
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                activeNav === 'reports' ? 'bg-white' : 'bg-terracotta'
              }`}
            />
          )}
        </Link>
      </div>

      {/* Settings & Home Return */}
      <div className="flex flex-col items-center gap-2.5 pt-3 border-t border-sand-border w-10">
        <Link
          href="/akun"
          aria-label="Pengaturan Akun"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] transition-colors duration-150"
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
  );
}
