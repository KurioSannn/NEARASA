import { Link } from '@inertiajs/react';
import { ArrowUpRight, Clock, FileText, Info, Plus, ShieldCheck, Store, TrendingUp, UserRound } from 'lucide-react';
import type { OwnedBusiness } from '@/types/merchant';

type Props = {
  ownerName: string;
  ownerId?: number;
  businesses: OwnedBusiness[];
  postCount: number;
  openCount: number;
  manageUrl: string;
};

export default function RightWalletSidebar({
  ownerName,
  ownerId,
  businesses,
  postCount,
  openCount,
  manageUrl,
}: Props) {
  const readinessPercent = postCount > 0 ? Math.round((openCount / postCount) * 100) : 0;
  const primaryBusiness = businesses[0];

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-6 shrink-0" data-purpose="right-wallet-sidebar">
      {/* My Wallet / Business Identity Card Box */}
      <section className="bg-white p-5 rounded-3xl border border-sand-border shadow-soft flex flex-col gap-5" data-purpose="wallet-overview-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-clay-900">Kartu Pemilik</h2>
          <Link
            href={manageUrl}
            className="w-7 h-7 rounded-full bg-clay-100 hover:bg-[#fdeee9] border border-transparent hover:border-terracotta-200 flex items-center justify-center text-clay-600 hover:text-terracotta transition-colors duration-150"
            aria-label="Buka kelola usaha"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Operational Ratio */}
        <div>
          <p className="text-xs text-clay-400 font-medium">Kesiapan Pos Hari Ini</p>
          <h3 className="text-3xl font-extrabold text-clay-900 tracking-tight mt-0.5">
            {openCount} <span className="text-lg font-bold text-clay-400">/ {postCount} Pos Buka</span>
          </h3>
        </div>

        {/* Stacked Gradient Card Representation */}
        <div className="relative pt-3 pb-1 px-1">
          {/* Background Stack Cards */}
          <div className="absolute inset-x-4 top-0 h-28 rounded-2xl card-stack-back opacity-50 shadow-sm" />
          <div className="absolute inset-x-2 top-2 h-28 rounded-2xl card-stack-mid opacity-70 shadow-sm" />
          {/* Foreground Card */}
          <div className="relative fintech-card-gradient text-clay-900 p-5 rounded-2xl shadow-md border border-white/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-widest">NEARASA CARD</span>
              <span className="text-sm font-black tracking-wider text-terracotta-800 italic">UMKM OWNER</span>
            </div>
            <div className="mt-5 mb-3">
              <p className="text-lg font-extrabold tracking-tight text-clay-900 truncate">
                {ownerName}
              </p>
              <p className="text-[11px] font-bold text-clay-600 mt-0.5">
                {primaryBusiness ? primaryBusiness.name : 'Usaha Kuliner'}
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-clay-600 pt-1 border-t border-white/40">
              <span>{businesses.length} Usaha Terhubung</span>
              <span className="text-terracotta-700">AKTIF</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar - Light beige container, Brown Terracotta icon button, Brown text */}
        <div className="grid grid-cols-4 gap-2 pt-1.5">
          <Link
            href={manageUrl}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-clay-100 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 transition-colors duration-150 group text-center"
            title="Kelola Usaha"
          >
            <div className="w-8 h-8 rounded-xl bg-terracotta group-hover:bg-terracotta-600 shadow-xs flex items-center justify-center text-white border border-terracotta-600 transition-colors duration-150">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-bold text-clay-900 group-hover:text-terracotta transition-colors duration-150">Kelola</span>
          </Link>

          <Link
            href={`${manageUrl}?tab=posts`}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-clay-100 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 transition-colors duration-150 group text-center"
            title="Tambah Pos Jualan"
          >
            <div className="w-8 h-8 rounded-xl bg-terracotta group-hover:bg-terracotta-600 shadow-xs flex items-center justify-center text-white border border-terracotta-600 transition-colors duration-150">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-bold text-clay-900 group-hover:text-terracotta transition-colors duration-150">Pos Baru</span>
          </Link>

          <Link
            href="/kelola-usaha/ulasan"
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-clay-100 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 transition-colors duration-150 group text-center"
            title="Daftar Review"
          >
            <div className="w-8 h-8 rounded-xl bg-terracotta group-hover:bg-terracotta-600 shadow-xs flex items-center justify-center text-white border border-terracotta-600 transition-colors duration-150 relative">
              <ShieldCheck className="w-4 h-4 text-white" />

            </div>
            <span className="text-[11px] font-bold text-clay-900 group-hover:text-terracotta transition-colors duration-150">Ulasan</span>
          </Link>

          <Link
            href="/kelola-usaha/setelan?tab=owner"
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-clay-100 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 transition-colors duration-150 group text-center"
            title="Setelan Akun Pemilik"
          >
            <div className="w-8 h-8 rounded-xl bg-terracotta group-hover:bg-terracotta-600 shadow-xs flex items-center justify-center text-white border border-terracotta-600 transition-colors duration-150">
              <UserRound className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-bold text-clay-900 group-hover:text-terracotta transition-colors duration-150">Akun</span>
          </Link>
        </div>

        {/* Readiness Progress Bar Widget */}
        <div className="pt-2 border-t border-sand-border" data-purpose="spending-progress-bar">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-clay-800">Tingkat Buka Hari Ini</span>
            <span className="text-[11px] font-semibold text-clay-400">{readinessPercent}% Siap</span>
          </div>
          <div className="relative w-full h-3 bg-clay-100 rounded-full overflow-hidden flex items-center">
            <div
              style={{ width: `${readinessPercent}%` }}
              className="h-full bg-terracotta rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="font-extrabold text-clay-900">{openCount} pos buka</span>
            <span className="text-[10px] text-clay-400">
              {postCount - openCount} pos belum buka
            </span>
          </div>
        </div>
      </section>

      {/* Operasional & Bantuan Widget */}
      <section
        style={{ backgroundColor: '#261912' }}
        className="bg-clay-800 text-white !text-white p-3.5 sm:p-4 rounded-3xl shadow-soft relative overflow-hidden"
      >
        <div className="relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-terracotta-200 !text-terracotta-200 uppercase">
            JADWAL AKTIF
          </span>
          <h4 className="text-xs sm:text-sm font-bold mt-1 text-white !text-white leading-snug">
            Status jam operasional mengikuti WIB
          </h4>
          <p className="text-[11px] text-clay-200 !text-clay-200 mt-1 leading-relaxed">
            Perubahan jam buka dapat dilakukan lewat menu Kelola Usaha kapan saja.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={manageUrl}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-terracotta hover:bg-terracotta-600 text-white !text-white transition shadow-sm"
            >
              Atur Jadwal
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white !text-white border border-white/20 transition"
            >
              Cek Katalog
            </Link>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
      </section>
    </aside>
  );
}
