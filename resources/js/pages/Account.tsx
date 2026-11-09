import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Compass, Heart, History, LogOut, Mail, Store, UserCheck, UserRound } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import Dialog from '@/components/Dialog';
import Button from '@/components/Button';
import type { SharedProps } from '@/types/catalog';

export default function Account({
  ownedCount,
  favoriteCount,
  publicName,
  publicProfileAvailable = false,
}: {
  ownedCount: number;
  favoriteCount: number;
  publicName: string;
  publicProfileAvailable?: boolean;
}) {
  const { auth } = usePage<SharedProps>().props;
  const [logoutPending, setLogoutPending] = useState(false);
  const [leaving, setLeaving] = useState<{ url: string; logout: boolean } | null>(null);
  const allowNavigation = useRef(false);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const form = useForm({ public_name: publicName });
  const name = auth.user?.public_name || auth.user?.name || 'Akun';

  useEffect(() => {
    if (form.errors.public_name) errorSummary.current?.focus();
  }, [form.errors.public_name]);

  useEffect(() => {
    if (!form.isDirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const remove = router.on('before', event => {
      const logout = event.detail.visit.method === 'post' && event.detail.visit.url.pathname === '/keluar';
      if (event.detail.visit.method !== 'get' && !logout) return;
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }
      event.preventDefault();
      setLeaving({ url: event.detail.visit.url.href, logout });
    });
    window.addEventListener('beforeunload', unload);
    return () => {
      remove();
      window.removeEventListener('beforeunload', unload);
    };
  }, [form.isDirty]);

  const shortcuts = [
    {
      href: '/kelola-usaha',
      title: 'Kelola Usaha',
      description: ownedCount ? `${ownedCount} usaha kuliner terhubung` : 'Daftarkan usaha kulinermu',
      badge: ownedCount > 0 ? `${ownedCount} Usaha` : null,
      icon: Store,
    },
    {
      href: '/favorit',
      title: 'Tempat Favorit',
      description: favoriteCount ? `${favoriteCount} kuliner tersimpan` : 'Belum ada kuliner tersimpan',
      badge: favoriteCount > 0 ? `${favoriteCount} Tempat` : null,
      icon: Heart,
    },
    {
      href: '/riwayat',
      title: 'Riwayat Penjelajahan',
      description: 'Temukan kembali kuliner yang pernah kamu buka',
      badge: null,
      icon: History,
    },
  ];

  return (
    <>
      <Head title="Pengaturan Akun" />
      <div className="consumer-account-page">
        <div className="collection-back-wrap">
          <Link className="collection-back-pill" href="/jelajah">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Kembali ke jelajah</span>
          </Link>
        </div>

        <header className="collection-page-heading">
          <span className="account-section-kicker">Profil & Preferensi</span>
          <h1>Akun Pengguna</h1>
          <p>Kelola identitas publik dan akses cepat penjelajahan kuliner lokalmu.</p>
        </header>

        <div className="consumer-account-grid">
          {/* Kartu 1: Profil & Identitas Publik */}
          <section className="consumer-account-card profile-card" aria-labelledby="account-info-title">
            <div className="consumer-profile-hero">
              <span className="consumer-public-avatar" aria-hidden="true">
                {name.charAt(0).toLocaleUpperCase('id-ID')}
              </span>
              <div className="consumer-profile-titles">
                <div className="consumer-profile-role-row">
                  <span className="account-role-badge">
                    <UserCheck size={12} aria-hidden="true" />
                    <span>{ownedCount > 0 ? 'Pemilik Usaha UMKM' : 'Pencinta Kuliner'}</span>
                  </span>
                </div>
                <h2 id="account-info-title">{name}</h2>
                <p className="consumer-profile-email">
                  <Mail size={13} aria-hidden="true" />
                  <span>{auth.user?.email}</span>
                </p>
              </div>
            </div>

            <form
              className="consumer-name-form"
              aria-busy={form.processing}
              onSubmit={event => {
                event.preventDefault();
                form.patch('/akun/nama-publik', {
                  preserveScroll: true,
                  onSuccess: page => {
                    const value =
                      typeof page.props.publicName === 'string'
                        ? page.props.publicName
                        : form.data.public_name.trim();
                    form.setData('public_name', value);
                    form.setDefaults({ public_name: value });
                  },
                });
              }}
            >
              <div className="name-form-heading">
                <h3>Nama Publik</h3>
                <p>Nama yang terlihat oleh pengguna lain saat kamu menulis ulasan kuliner.</p>
              </div>

              <div className="consumer-name-field-group">
                <input
                  id="account-public-name"
                  className="text-input consumer-input"
                  autoComplete="nickname"
                  required
                  maxLength={80}
                  disabled={form.processing}
                  value={form.data.public_name}
                  onChange={event => form.setData('public_name', event.target.value)}
                  aria-invalid={Boolean(form.errors.public_name)}
                  aria-describedby={form.errors.public_name ? 'account-name-error' : undefined}
                  placeholder="Masukkan nama tampilanmu"
                />
                <Button type="submit" disabled={form.processing || !form.isDirty} className="consumer-save-btn">
                  {form.processing ? 'Menyimpan…' : 'Simpan nama'}
                </Button>
              </div>

              {form.errors.public_name && (
                <p ref={errorSummary} id="account-name-error" tabIndex={-1} className="consumer-field-error" role="alert">
                  {form.errors.public_name}
                </p>
              )}
              {form.recentlySuccessful && !form.isDirty && (
                <p className="consumer-save-success" role="status">
                  Nama publik berhasil diperbarui.
                </p>
              )}
              {form.isDirty && (
                <p className="consumer-unsaved" role="status">
                  Perubahan nama belum disimpan.
                </p>
              )}
            </form>

            <div className="consumer-card-footer">
              {publicProfileAvailable && auth.user && (
                <Link href={`/pemilik/${auth.user.id}`} className="account-public-link">
                  <UserRound size={15} aria-hidden="true" />
                  <span>Lihat profil usaha publik</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}

              <button
                type="button"
                className="consumer-logout-inline"
                disabled={logoutPending || form.processing}
                onClick={() =>
                  router.post(
                    '/keluar',
                    {},
                    { onStart: () => setLogoutPending(true), onFinish: () => setLogoutPending(false) }
                  )
                }
              >
                <LogOut size={15} aria-hidden="true" />
                <span>{logoutPending ? 'Keluar…' : 'Keluar akun'}</span>
              </button>
            </div>
          </section>

          {/* Kartu 2: Akses Cepat */}
          <section className="consumer-account-card shortcuts-card" aria-labelledby="account-shortcuts-title">
            <div className="shortcuts-card-header">
              <h2 id="account-shortcuts-title">Akses Cepat</h2>
              <p>Kelola usaha atau lihat tempat kuliner yang telah kamu simpan.</p>
            </div>

            <div className="consumer-shortcut-grid">
              {shortcuts.map(({ href, title, description, badge, icon: Icon }) => (
                <Link href={href} key={href} className="consumer-shortcut-tile">
                  <div className="shortcut-tile-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div className="shortcut-tile-body">
                    <div className="shortcut-tile-title-row">
                      <h3>{title}</h3>
                      {badge && <span className="shortcut-badge">{badge}</span>}
                    </div>
                    <p>{description}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="consumer-explore-callout">
              <div className="explore-callout-copy">
                <strong>Ingin cari makanan baru?</strong>
                <p>Temukan warung dan kedai lokal terdekat di sekitarmu.</p>
              </div>
              <Link href="/jelajah" className="button button-accent explore-callout-btn">
                <Compass size={17} aria-hidden="true" />
                <span>Mulai Jelajah</span>
              </Link>
            </div>
          </section>
        </div>

        {leaving && (
          <Dialog title="Tinggalkan perubahan nama?" onClose={() => setLeaving(null)}>
            <p className="consumer-confirm-copy">Nama publik yang kamu ubah belum disimpan.</p>
            <div className="consumer-confirm-actions">
              <button className="button button-outline" type="button" onClick={() => setLeaving(null)}>
                Kembali mengedit
              </button>
              <button
                className="button consumer-danger"
                type="button"
                onClick={() => {
                  allowNavigation.current = true;
                  const destination = leaving;
                  setLeaving(null);
                  if (destination.logout) router.post(destination.url);
                  else router.visit(destination.url);
                }}
              >
                Buang perubahan & lanjutkan
              </button>
            </div>
          </Dialog>
        )}
      </div>
    </>
  );
}

Account.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
