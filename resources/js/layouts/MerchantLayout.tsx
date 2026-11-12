import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Home, LayoutGrid, ShieldCheck, Store } from 'lucide-react';
import type { SharedProps } from '@/types/catalog';
import type { MerchantNavigation } from '@/types/merchant';
import TopNav from '@/components/merchant/dashboard/TopNav';
import CurvedSidebar from '@/components/merchant/dashboard/CurvedSidebar';
import Footer from '@/components/merchant/dashboard/Footer';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { merchantNavigation, flash } = usePage<SharedProps & { merchantNavigation: MerchantNavigation }>().props;
  const { url } = usePage();
  const pageUrl = (url || '').split('?')[0];
  const activeNav = pageUrl === '/kelola-usaha' ? 'dashboard' : pageUrl.startsWith('/kelola-usaha/laporan') ? 'reports' : 'manage';
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const start = router.on('start', () => setNavigating(true));
    const finish = router.on('finish', () => setNavigating(false));
    return () => { start(); finish(); };
  }, []);

  return (
    <div
      className="min-h-screen bg-sand-surface text-clay-900 antialiased"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 flex flex-col gap-6">
        {/* Unified Top Navbar */}
        <TopNav merchantNavigation={merchantNavigation} />

        {flash.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between font-medium">
            <span>{flash.success}</span>
          </div>
        )}

        {/* Main Layout Body: Compact Left Dock + Center Canvas */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Compact Curved Dock */}
          <CurvedSidebar merchantNavigation={merchantNavigation} />

          {/* Center Main Content */}
          <main id="main-content" className="flex-1 min-w-0 flex flex-col gap-6 pb-16 lg:pb-0" aria-busy={navigating}>
            {children}
            <span className="profile-sr-only" role="status">
              {navigating ? 'Menyimpan atau memuat halaman...' : ''}
            </span>
          </main>
        </div>

        {/* Modern Footer */}
        <Footer />
      </div>

      {/* Mobile Bottom Dock */}
      <nav aria-label="Navigasi Bawah Seluler" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-border p-2 flex items-center justify-around shadow-lg">
        <Link
          href="/kelola-usaha"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold ${
            activeNav === 'dashboard' ? 'text-terracotta' : 'text-clay-500'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href={merchantNavigation.manage_url}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold ${
            activeNav === 'manage' ? 'text-terracotta' : 'text-clay-500'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Kelola Usaha</span>
        </Link>
        <Link
          href="/kelola-usaha/laporan"
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold ${
            activeNav === 'reports' ? 'text-terracotta' : 'text-clay-500'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Laporan</span>
          {merchantNavigation.pending_reports > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-terracotta ring-2 ring-white" />
          )}
        </Link>
        <Link
          href="/"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-semibold text-clay-500"
        >
          <Home className="w-5 h-5" />
          <span>Publik</span>
        </Link>
      </nav>
    </div>
  );
}
