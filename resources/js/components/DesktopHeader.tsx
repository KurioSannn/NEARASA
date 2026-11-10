import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Heart, History, LogOut, Store, UserRound } from 'lucide-react';
import { LocationButton, useUi } from '@/layouts/CustomerLayout';
import type { SharedProps } from '@/types/catalog';

export default function DesktopHeader({ discovery = false }: { discovery?: boolean }) {
  const { url, props } = usePage<SharedProps>();
  const { openAccount } = useUi();
  const user = props.auth.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = url.split('?')[0];
  const name = (user?.public_name || user?.name || '').trim();

  useEffect(() => {
    if (!dropdownOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [url]);

  const handleAccountClick = () => {
    if (!user) {
      openAccount('Akun');
      return;
    }
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    setLogoutPending(true);
    router.post(
      '/keluar',
      {},
      {
        onFinish: () => {
          setLogoutPending(false);
          setDropdownOpen(false);
        },
      }
    );
  };

  return (
    <header className="desktop-header">
      <div className="header-inner">
        <Link href="/" className="header-brand" aria-label="NEARASA beranda">
          <img
            src="/images/logo/nearasa-logo-colored.png"
            alt="NEARASA Kuliner Lokal"
            className="brand-logo"
            width="96"
            height="40"
          />
        </Link>

        <nav aria-label="Navigasi utama">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>
            Beranda
          </Link>
          <Link
            href="/jelajah"
            aria-current={
              url.startsWith('/jelajah') || url.startsWith('/usaha/') || url.startsWith('/pemilik/')
                ? 'page'
                : undefined
            }
          >
            {discovery ? 'Jelajah' : 'Jelajah rasa'}
          </Link>
          <Link href="/peta" aria-current={url.startsWith('/peta') ? 'page' : undefined}>
            Peta
          </Link>
        </nav>

        <div className="header-actions">
          {!discovery && (
            <>
              <LocationButton />
              <span className="header-divider" />
            </>
          )}

          <button
            className="icon-button header-favorite"
            aria-label="Favorit"
            onClick={() => openAccount('Favorit')}
          >
            <Heart size={19} aria-hidden="true" />
          </button>

          <div className="account-dropdown-wrapper" ref={dropdownRef}>
            <button
              className={`account-button ${dropdownOpen ? 'account-button-active' : ''}`}
              aria-label={user ? 'Menu akun pengguna' : 'Masuk akun'}
              aria-expanded={user ? dropdownOpen : undefined}
              aria-haspopup={user ? 'true' : undefined}
              onClick={handleAccountClick}
            >
              {discovery && user ? (
                user.avatar ? (
                  <img src={user.avatar} alt={name} className="discovery-avatar-img" />
                ) : (
                  <span className="discovery-avatar" aria-hidden="true">
                    {name.charAt(0).toLocaleUpperCase('id-ID') || 'A'}
                  </span>
                )
              ) : (
                <UserRound size={19} aria-hidden="true" />
              )}
              <span className="account-label">
                {discovery ? (user ? name.split(' ')[0] : 'Masuk') : 'Akun'}
              </span>
              {discovery && user && (
                <ChevronDown
                  size={15}
                  aria-hidden="true"
                  className={`account-chevron ${dropdownOpen ? 'account-chevron-open' : ''}`}
                />
              )}
            </button>

            {user && dropdownOpen && (
              <div className="header-dropdown-menu" role="menu" aria-label="Menu akun">
                <div className="dropdown-user-header">
                  {user.avatar ? (
                    <img src={user.avatar} alt={name} className="dropdown-user-avatar-img" />
                  ) : (
                    <span className="dropdown-user-avatar" aria-hidden="true">
                      {name.charAt(0).toLocaleUpperCase('id-ID') || 'A'}
                    </span>
                  )}
                  <div className="dropdown-user-info">
                    <strong className="dropdown-user-name">{name}</strong>
                    <span className="dropdown-user-email">{user.email}</span>
                    <span className="dropdown-user-badge">
                      {user.is_demo ? 'Akun Demo UMKM' : 'Akun Pengguna'}
                    </span>
                  </div>
                </div>

                <div className="dropdown-divider" role="separator" />

                <div className="dropdown-nav-items">
                  <Link
                    href="/kelola-usaha"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="dropdown-item-icon">
                      <Store size={16} aria-hidden="true" />
                    </span>
                    <div className="dropdown-item-copy">
                      <strong>Kelola Usaha</strong>
                      <small>Dasbor operasional & pos</small>
                    </div>
                  </Link>

                  <Link
                    href="/akun"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="dropdown-item-icon">
                      <UserRound size={16} aria-hidden="true" />
                    </span>
                    <div className="dropdown-item-copy">
                      <strong>Pengaturan Akun</strong>
                      <small>Profil, nama publik & preferensi</small>
                    </div>
                  </Link>

                  <Link
                    href="/favorit"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="dropdown-item-icon">
                      <Heart size={16} aria-hidden="true" />
                    </span>
                    <div className="dropdown-item-copy">
                      <strong>Tempat Favorit</strong>
                      <small>Kuliner tersimpan</small>
                    </div>
                  </Link>

                  <Link
                    href="/riwayat"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="dropdown-item-icon">
                      <History size={16} aria-hidden="true" />
                    </span>
                    <div className="dropdown-item-copy">
                      <strong>Riwayat Jelajah</strong>
                      <small>Tempat terakhir dibuka</small>
                    </div>
                  </Link>
                </div>

                <div className="dropdown-divider" role="separator" />

                <button
                  type="button"
                  className="dropdown-logout-item"
                  role="menuitem"
                  disabled={logoutPending}
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span>{logoutPending ? 'Keluar akun…' : 'Keluar Akun'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
