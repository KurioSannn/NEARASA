import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types/catalog';
import type { MerchantNavigation } from '@/types/merchant';
import TopNav from '@/components/merchant/dashboard/TopNav';
import CurvedSidebar from '@/components/merchant/dashboard/CurvedSidebar';
import Footer from '@/components/merchant/dashboard/Footer';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { merchantNavigation, flash } = usePage<SharedProps & { merchantNavigation: MerchantNavigation }>().props;
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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 lg:pb-6 flex flex-col gap-6">
        {/* Unified Top Navbar (Logo + Search + Notifications + Profile) */}
        <TopNav merchantNavigation={merchantNavigation} />

        {flash.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between font-medium">
            <span>{flash.success}</span>
          </div>
        )}

        {/* Main Layout Body: Compact Left Dock + Center Canvas */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Compact Curved Dock & Mobile Floating Pill Nav */}
          <CurvedSidebar merchantNavigation={merchantNavigation} />

          {/* Center Main Content */}
          <main id="main-content" className="flex-1 min-w-0 w-full flex flex-col gap-6 pb-4 lg:pb-0" aria-busy={navigating}>
            {children}
            <span className="profile-sr-only" role="status">
              {navigating ? 'Menyimpan atau memuat halaman...' : ''}
            </span>
          </main>
        </div>

        {/* Modern Footer */}
        <Footer />
      </div>
    </div>
  );
}
