import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Store } from 'lucide-react';
import BusinessWatchlist from '@/components/merchant/dashboard/BusinessWatchlist';
import CurvedSidebar from '@/components/merchant/dashboard/CurvedSidebar';
import InteractionChart from '@/components/merchant/dashboard/InteractionChart';
import RightWalletSidebar from '@/components/merchant/dashboard/RightWalletSidebar';
import SummaryCards from '@/components/merchant/dashboard/SummaryCards';
import TodayPostsTable from '@/components/merchant/dashboard/TodayPostsTable';
import TopNav from '@/components/merchant/dashboard/TopNav';
import Footer from '@/components/merchant/dashboard/Footer';
import type { DailyOperation } from '@/components/merchant/DailyOperations';
import type { SharedProps } from '@/types/catalog';
import type { ClosureReport, MerchantNavigation, MerchantStatistics, OwnedBusiness } from '@/types/merchant';

type DashboardProps = {
  businesses: OwnedBusiness[];
  operations: DailyOperation[];
  statistics: MerchantStatistics;
  reports: ClosureReport[];
  merchantNavigation: MerchantNavigation;
};

export default function Dashboard({
  businesses,
  operations,
  statistics,
  reports,
  merchantNavigation,
}: DashboardProps) {
  const { auth, flash } = usePage<SharedProps>().props;
  const [searchQuery, setSearchQuery] = useState('');

  const pending = merchantNavigation.pending_reports;
  const openCount = operations.filter(
    (op) => op.post.is_open && op.post.operating_status !== 'permanently_closed'
  ).length;

  const userName = auth.user?.public_name || auth.user?.name || 'Pemilik';
  const firstName = userName.trim().split(' ')[0];
  const firstReport = reports.find((r) => !r.resolved_at);

  const q = searchQuery.toLowerCase().trim();
  const filteredBusinesses = q
    ? businesses.filter((b) => b.name.toLowerCase().includes(q) || b.kind.toLowerCase().includes(q))
    : businesses;

  const filteredOperations = q
    ? operations.filter(
        (op) =>
          op.post.name.toLowerCase().includes(q) ||
          op.business_name.toLowerCase().includes(q) ||
          op.post.address.toLowerCase().includes(q)
      )
    : operations;

  return (
    <>
      <Head title="Dashboard Pemilik · NEARASA" />
      <div
        className="min-h-screen bg-sand-surface text-clay-900 antialiased"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 lg:pb-6 flex flex-col gap-6">
          {/* BEGIN: TopNavigationBar (Clean header without middle nav pills) */}
          <TopNav
            merchantNavigation={merchantNavigation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Flash Notice */}
          {flash?.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between font-medium">
              <span>{flash.success}</span>
            </div>
          )}

          {/* BEGIN: MainContentGrid */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Compact Curved Sidebar & Mobile Floating Pill Nav */}
            <CurvedSidebar merchantNavigation={merchantNavigation} />

            {/* Center Main Column */}
            <main className="flex-1 min-w-0 w-full flex flex-col gap-6 overflow-hidden">
              {/* BEGIN: Greeting & Controls - Perfectly aligned with content below */}
              <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-purpose="hero-controls">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-clay-900 flex items-center gap-2">
                    Halo, {firstName} <span className="animate-pulse">👋</span>
                  </h1>
                  <p className="text-xs text-clay-700 font-medium mt-1">
                    Selamat datang kembali! Ini ringkasan operasional dan interaksi seluruh usahamu hari ini.
                  </p>
                </div>

                {/* Action Tools */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/kelola-usaha/daftar"
                    className="flex items-center gap-1.5 bg-white hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-300 text-clay-800 hover:text-terracotta px-3.5 py-2 rounded-full text-xs font-bold transition-colors duration-150 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    <span>+ Tambah Usaha</span>
                  </Link>
                  {businesses.length > 0 && (
                    <Link
                      href={merchantNavigation.manage_url}
                      className="flex items-center gap-1.5 bg-terracotta hover:bg-terracotta-600 text-white !text-white px-4 py-2 rounded-full text-xs font-bold shadow-pill transition-colors duration-150 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white !text-white" />
                      <span className="text-white !text-white">Kelola usaha</span>
                    </Link>
                  )}
                </div>
              </section>

              {/* Onboarding Welcome Banner for Zero Business */}
              {businesses.length === 0 && (
                <div className="bg-gradient-to-r from-terracotta-50 to-sand-surface p-6 rounded-3xl border border-sand-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta bg-white px-3 py-1 rounded-full border border-terracotta-200 shadow-2xs">
                      <Store className="w-3.5 h-3.5" />
                      Mulai Kemitraan UMKM
                    </span>
                    <h2 className="text-base font-extrabold text-clay-900">Belum ada usaha kuliner yang terhubung</h2>
                    <p className="text-xs text-clay-600 max-w-xl">
                      Daftarkan warung makan, kedai kopi, atau gerai kulinermu untuk mulai mengelola menu, jadwal buka aktual, dan terhubung dengan pelanggan sekitar.
                    </p>
                  </div>
                  <Link
                    href="/kelola-usaha/daftar"
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-terracotta hover:bg-terracotta-600 text-white shadow-pill transition flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Daftarkan Usaha Pertama</span>
                  </Link>
                </div>
              )}

              {/* Row 1: Watchlist & Engagement Chart */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" data-purpose="charts-and-watchlist">
                <BusinessWatchlist businesses={filteredBusinesses} totalPosts={operations.length} />
                <InteractionChart statistics={statistics} />
              </section>

              {/* Row 2: Status Badges / Operational Metrics */}
              <SummaryCards
                businessCount={businesses.length}
                postCount={operations.length}
                openCount={openCount}
                pending={pending}
                manageUrl={merchantNavigation.manage_url}
              />

              {/* Row 3: Transaction / Posts History Table */}
              <TodayPostsTable
                businesses={businesses}
                operations={filteredOperations}
                manageUrl={merchantNavigation.manage_url}
              />
            </main>

            {/* Right Sidebar Widgets */}
            <RightWalletSidebar
              ownerName={userName}
              ownerId={auth.user?.id}
              businesses={businesses}
              postCount={operations.length}
              openCount={openCount}
              pending={pending}
              report={firstReport}
              manageUrl={merchantNavigation.manage_url}
            />
          </div>

          {/* Site Footer - Seamless bottom alignment */}
          <Footer />
        </div>
      </div>
    </>
  );
}
