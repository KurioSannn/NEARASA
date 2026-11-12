import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, LogOut, Search, Store, UserRound } from 'lucide-react';
import type { SharedProps } from '@/types/catalog';
import type { MerchantNavigation } from '@/types/merchant';

export default function TopNav({ merchantNavigation, searchQuery = '', onSearchChange }: {
  merchantNavigation: MerchantNavigation;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}) {
  const { auth } = usePage<SharedProps>().props;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pending = merchantNavigation.pending_reports;
  const user = auth.user;
  const name = user?.public_name || user?.name || 'Pemilik';
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 bg-sand-surface/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 py-3 border-b border-sand-border"
      data-purpose="top-navigation"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/kelola-usaha" className="flex items-center gap-2 group" aria-label="NEARASA">
          <img
            src="/images/logo/nearasa-logo-colored.png"
            alt="NEARASA"
            className="h-8 sm:h-9 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity duration-150"
          />
        </Link>
      </div>

      {/* Utility & Profile Area */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-clay-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            disabled={!onSearchChange}
            className="pl-9 pr-4 py-2 bg-white/90 text-xs rounded-full border border-sand-border focus:border-terracotta focus:ring-0 w-44 lg:w-56 text-clay-800 font-medium placeholder-clay-400 shadow-sm transition-all outline-none"
            placeholder="Cari usaha, pos..."
          />
        </div>

        {/* Notification Bell */}
        <Link
          href="/kelola-usaha/laporan"
          aria-label={pending > 0 ? `${pending} review perlu diperiksa` : 'Notifikasi review'}
          className="relative w-10 h-10 rounded-full bg-white border border-sand-border flex items-center justify-center text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] hover:border-terracotta-200 shadow-sm transition-colors duration-150"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {pending > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-terracotta ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile Pill */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label={`Menu akun ${name}`}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-sand-border shadow-sm cursor-pointer hover:bg-[#fdeee9] hover:border-terracotta-200 transition-colors duration-150 text-left"
          >
            <span className="w-7 h-7 rounded-full bg-terracotta-100 text-terracotta flex items-center justify-center font-bold text-xs ring-2 ring-terracotta/70">
              {initial}
            </span>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-clay-900 leading-tight truncate max-w-[100px]">{name}</span>
              <span className="text-[10px] text-terracotta-600 font-medium leading-none">Akun Pemilik</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-clay-400" aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-sand-border shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-sand-border mb-1">
                <p className="text-xs font-bold text-clay-900">{name}</p>
                <p className="text-[11px] text-clay-500 truncate">{user?.email}</p>
              </div>
              <Link
                href="/akun"
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-clay-700 hover:bg-[#fdeee9] hover:text-terracotta rounded-xl transition-colors duration-150"
                onClick={() => setProfileOpen(false)}
              >
                <UserRound className="w-4 h-4 text-clay-500" />
                <span>Pengaturan Akun</span>
              </Link>
              {merchantNavigation.businesses.some(b => b.status === 'published') && (
                <Link
                  href={`/pemilik/${user?.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-clay-700 hover:bg-[#fdeee9] hover:text-terracotta rounded-xl transition-colors duration-150"
                  onClick={() => setProfileOpen(false)}
                >
                  <Store className="w-4 h-4 text-clay-500" />
                  <span>Profil Publik</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => router.post('/keluar')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors duration-150 text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
