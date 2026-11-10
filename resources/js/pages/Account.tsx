import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  History,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  UserRound,
} from 'lucide-react';
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
  const user = auth.user;
  const [logoutPending, setLogoutPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<{ url: string; logout: boolean } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowNavigation = useRef(false);

  // Profile Form (Nama Lengkap & Nama Publik)
  const profileForm = useForm({
    name: user?.name || '',
    public_name: publicName || '',
  });

  // Password Form (Ganti Kata Sandi)
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const isDirty = profileForm.isDirty || passwordForm.isDirty;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!isDirty) return;
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
  }, [isDirty]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarPending(true);
    router.post('/akun/foto', formData, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        setAvatarPending(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: () => {
        setAvatarPreview(null);
      },
    });
  };

  const handleAvatarDelete = () => {
    if (!confirm('Apakah kamu yakin ingin menghapus foto profil?')) return;
    setAvatarPending(true);
    router.delete('/akun/foto', {
      preserveScroll: true,
      onFinish: () => {
        setAvatarPending(false);
        setAvatarPreview(null);
      },
    });
  };

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    profileForm.patch('/akun/profil', {
      preserveScroll: true,
      onSuccess: page => {
        const newPublic = typeof page.props.publicName === 'string' ? page.props.publicName : profileForm.data.public_name;
        profileForm.setData('public_name', newPublic);
        profileForm.setDefaults();
      },
    });
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    passwordForm.put('/akun/sandi', {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
        passwordForm.setDefaults();
      },
    });
  };

  const handleLogout = () => {
    router.post(
      '/keluar',
      {},
      {
        onStart: () => setLogoutPending(true),
        onFinish: () => setLogoutPending(false),
      }
    );
  };

  const displayName = profileForm.data.name || user?.name || 'Akun';
  const currentAvatarSrc = avatarPreview || user?.avatar;

  return (
    <>
      <Head title="Pengaturan Akun" />
      <div className="account-workspace">
        {/* Navigation & Header */}
        <div className="collection-back-wrap">
          <Link className="collection-back-pill" href="/jelajah">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Kembali ke jelajah</span>
          </Link>
        </div>

        <header className="account-workspace-header">
          <span className="account-workspace-kicker">Akun & Preferensi</span>
          <h1>Pengaturan Akun</h1>
          <p>Kelola identitas profil, kata sandi, dan akses operasional kuliner tokomu.</p>
        </header>

        {/* Master 2-Column Grid */}
        <div className="account-layout-container">
          {/* Kolom Kiri: Settings Suite (Profil, Identitas, Email, Kata Sandi) */}
          <div className="account-settings-column">
            {/* Kartu 1: Profil & Identitas */}
            <section className="account-panel-card" aria-labelledby="profile-heading">
              <div className="account-panel-header">
                <div className="panel-header-icon-box">
                  <UserRound size={18} aria-hidden="true" />
                </div>
                <div className="panel-header-copy">
                  <h2 id="profile-heading">Profil & Identitas</h2>
                  <p>Foto profil dan nama tampilan saat berinteraksi di NEARASA.</p>
                </div>
              </div>

              {/* Avatar Studio */}
              <div className="avatar-studio-unit">
                <div className="avatar-studio-frame">
                  {currentAvatarSrc ? (
                    <img src={currentAvatarSrc} alt={displayName} className="avatar-studio-img" />
                  ) : (
                    <span className="avatar-studio-monogram" aria-hidden="true">
                      {displayName.charAt(0).toLocaleUpperCase('id-ID')}
                    </span>
                  )}
                  {avatarPending && (
                    <div className="avatar-studio-overlay" aria-label="Sedang mengunggah foto">
                      <span className="avatar-studio-spinner" />
                    </div>
                  )}
                </div>

                <div className="avatar-studio-info">
                  <span className="avatar-studio-title">Foto Profil Pengguna</span>
                  <span className="avatar-studio-specs">Format JPG, PNG, atau WebP. Maksimal 2 MB.</span>

                  <div className="avatar-studio-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="account-avatar-file"
                      accept="image/jpeg,image/png,image/webp"
                      className="visually-hidden-file-input"
                      onChange={handleAvatarChange}
                      disabled={avatarPending}
                    />
                    <label
                      htmlFor="account-avatar-file"
                      className={`btn-avatar-action upload ${avatarPending ? 'disabled' : ''}`}
                    >
                      <Camera size={14} aria-hidden="true" />
                      <span>{avatarPending ? 'Mengunggah…' : currentAvatarSrc ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </label>

                    {currentAvatarSrc && (
                      <button
                        type="button"
                        className="btn-avatar-action remove"
                        onClick={handleAvatarDelete}
                        disabled={avatarPending}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form className="account-panel-form" onSubmit={handleProfileSubmit} aria-busy={profileForm.processing}>
                <div className="form-group-item">
                  <label htmlFor="account-name" className="form-field-label">
                    Nama Lengkap
                  </label>
                  <input
                    id="account-name"
                    type="text"
                    required
                    maxLength={255}
                    className="form-control-input"
                    value={profileForm.data.name}
                    disabled={profileForm.processing}
                    onChange={e => profileForm.setData('name', e.target.value)}
                    placeholder="Nama lengkap pemilik akun"
                    aria-invalid={Boolean(profileForm.errors.name)}
                    aria-describedby={profileForm.errors.name ? 'account-name-error' : undefined}
                  />
                  {profileForm.errors.name && (
                    <p id="account-name-error" className="consumer-field-error" role="alert">
                      {profileForm.errors.name}
                    </p>
                  )}
                </div>

                <div className="form-group-item">
                  <label htmlFor="account-public-name" className="form-field-label">
                    Nama Publik di Ulasan
                  </label>
                  <input
                    id="account-public-name"
                    type="text"
                    maxLength={80}
                    className="form-control-input"
                    value={profileForm.data.public_name}
                    disabled={profileForm.processing}
                    onChange={e => profileForm.setData('public_name', e.target.value)}
                    placeholder="Contoh: Raka Kulineran"
                    aria-invalid={Boolean(profileForm.errors.public_name)}
                    aria-describedby={profileForm.errors.public_name ? 'account-public-name-error' : 'public-name-hint'}
                  />
                  <small id="public-name-hint" className="form-field-hint">
                    Nama ini yang akan muncul pada ulasan warung makan dan pos jualan yang kamu tulis.
                  </small>
                  {profileForm.errors.public_name && (
                    <p id="account-public-name-error" className="consumer-field-error" role="alert">
                      {profileForm.errors.public_name}
                    </p>
                  )}
                </div>

                <div className="panel-form-footer">
                  <Button
                    type="submit"
                    disabled={profileForm.processing || !profileForm.isDirty}
                    className="btn-panel-primary"
                  >
                    {profileForm.processing ? 'Menyimpan…' : 'Simpan Profil'}
                  </Button>

                  {profileForm.recentlySuccessful && !profileForm.isDirty && (
                    <span className="panel-feedback-pill success" role="status">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>Profil berhasil disimpan</span>
                    </span>
                  )}

                  {profileForm.isDirty && (
                    <span className="panel-feedback-pill dirty" role="status">
                      Perubahan belum disimpan
                    </span>
                  )}
                </div>
              </form>
            </section>

            {/* Kartu 2: Email & Keamanan Kata Sandi */}
            <section className="account-panel-card" aria-labelledby="security-heading">
              <div className="account-panel-header">
                <div className="panel-header-icon-box">
                  <ShieldCheck size={18} aria-hidden="true" />
                </div>
                <div className="panel-header-copy">
                  <h2 id="security-heading">Email & Keamanan</h2>
                  <p>Kredensial login dan pengaturan kata sandi akun NEARASA milikmu.</p>
                </div>
              </div>

              {/* Email Status Box */}
              <div className="email-credential-box">
                <div className="email-credential-left">
                  <div className="email-icon-circle">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                  <div className="email-info-text">
                    <span className="email-value">{user?.email}</span>
                    <span className="email-desc">Email terdaftar untuk autentikasi masuk akun</span>
                  </div>
                </div>
                <div className="email-credential-badge">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Terverifikasi</span>
                </div>
              </div>

              {/* Change Password Form */}
              <form className="account-panel-form" onSubmit={handlePasswordSubmit} aria-busy={passwordForm.processing}>
                <div className="form-group-item">
                  <label htmlFor="current-password" className="form-field-label">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="form-control-input password-field"
                      value={passwordForm.data.current_password}
                      disabled={passwordForm.processing}
                      onChange={e => passwordForm.setData('current_password', e.target.value)}
                      placeholder="Masukkan kata sandi lama"
                      aria-invalid={Boolean(passwordForm.errors.current_password)}
                      aria-describedby={passwordForm.errors.current_password ? 'current-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showCurrentPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    </button>
                  </div>
                  {passwordForm.errors.current_password && (
                    <p id="current-password-error" className="consumer-field-error" role="alert">
                      {passwordForm.errors.current_password}
                    </p>
                  )}
                </div>

                <div className="form-group-item">
                  <label htmlFor="new-password" className="form-field-label">
                    Kata Sandi Baru
                  </label>
                  <div className="password-split-row">
                    <div className="password-input-wrapper">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="form-control-input password-field"
                        value={passwordForm.data.password}
                        disabled={passwordForm.processing}
                        onChange={e => passwordForm.setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                        aria-invalid={Boolean(passwordForm.errors.password)}
                        aria-describedby={passwordForm.errors.password ? 'new-password-error' : undefined}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Sembunyikan kata sandi baru' : 'Tampilkan kata sandi baru'}
                      >
                        {showNewPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                      </button>
                    </div>

                    <div className="password-input-wrapper">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        className="form-control-input password-field"
                        value={passwordForm.data.password_confirmation}
                        disabled={passwordForm.processing}
                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                        placeholder="Ulangi sandi baru"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi sandi' : 'Tampilkan konfirmasi sandi'}
                      >
                        {showConfirmPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                  {passwordForm.errors.password && (
                    <p id="new-password-error" className="consumer-field-error" role="alert">
                      {passwordForm.errors.password}
                    </p>
                  )}
                </div>

                <div className="panel-form-footer">
                  <Button
                    type="submit"
                    disabled={passwordForm.processing || !passwordForm.isDirty}
                    className="btn-panel-primary"
                  >
                    {passwordForm.processing ? 'Memperbarui…' : 'Perbarui Kata Sandi'}
                  </Button>

                  {passwordForm.recentlySuccessful && (
                    <span className="panel-feedback-pill success" role="status">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>Kata sandi berhasil diperbarui</span>
                    </span>
                  )}
                </div>
              </form>
            </section>
          </div>

          {/* Kolom Kanan: Culinary Hub (Aktivitas, Kelola Usaha, Favorit & Sesi) */}
          <div className="account-hub-column">
            {/* Kartu 3: Aktivitas & Operasional */}
            <section className="account-panel-card hub-card" aria-labelledby="activity-heading">
              <div className="account-panel-header">
                <div className="panel-header-icon-box terracotta">
                  <Store size={18} aria-hidden="true" />
                </div>
                <div className="panel-header-copy">
                  <h2 id="activity-heading">Aktivitas & Kelola</h2>
                  <p>Operasional usaha kuliner dan daftar tempat langgananmu.</p>
                </div>
              </div>

              <div className="hub-blocks-list">
                {/* 1. Kelola Usaha */}
                <div className="hub-feature-item">
                  <div className="hub-feature-top">
                    <span className="hub-feature-badge terracotta">
                      <UserCheck size={11} aria-hidden="true" />
                      <span>{ownedCount > 0 ? `${ownedCount} Usaha Terhubung` : 'Mitra Kuliner'}</span>
                    </span>
                  </div>
                  <h3 className="hub-feature-title">Kelola Usaha Kuliner</h3>
                  <p className="hub-feature-desc">
                    Pantau jam operasional aktual WIB, kelola status buka, ketersediaan menu masakan, dan perbarui foto warung.
                  </p>
                  <div className="hub-feature-actions">
                    <Link href="/kelola-usaha" className="hub-btn primary">
                      <span>Buka Dasbor Usaha</span>
                    </Link>
                    {publicProfileAvailable && user && (
                      <Link href={`/pemilik/${user.id}`} className="hub-link-secondary">
                        <span>Lihat Profil Usaha Publik</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="hub-separator" />

                {/* 2. Warung Favorit */}
                <div className="hub-feature-item">
                  <div className="hub-feature-top">
                    <span className="hub-feature-badge rose">
                      <Heart size={11} aria-hidden="true" />
                      <span>{favoriteCount > 0 ? `${favoriteCount} Tempat Tersimpan` : 'Koleksi Kosong'}</span>
                    </span>
                  </div>
                  <h3 className="hub-feature-title">Warung Favorit</h3>
                  <p className="hub-feature-desc">
                    Akses cepat ke daftar warung makan, pedagang, dan kedai langganan yang sudah kamu simpan.
                  </p>
                  <div className="hub-feature-actions">
                    <Link href="/favorit" className="hub-btn secondary">
                      <span>Buka Koleksi Favorit</span>
                    </Link>
                  </div>
                </div>

                <div className="hub-separator" />

                {/* 3. Riwayat Jelajah */}
                <div className="hub-feature-item">
                  <div className="hub-feature-top">
                    <span className="hub-feature-badge amber">
                      <History size={11} aria-hidden="true" />
                      <span>Jelajah Terkini</span>
                    </span>
                  </div>
                  <h3 className="hub-feature-title">Riwayat Jelajah</h3>
                  <p className="hub-feature-desc">
                    Temukan kembali warung makan atau pos jualan kuliner yang baru saja kamu kunjungi.
                  </p>
                  <div className="hub-feature-actions">
                    <Link href="/riwayat" className="hub-btn secondary">
                      <span>Lihat Riwayat</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Kartu 4: Status Sesi & Keluar Akun */}
            <section className="account-panel-card session-panel-card" aria-label="Sesi akun">
              <div className="session-status-row">
                <div className="session-indicator-dot" aria-hidden="true" />
                <div className="session-status-text">
                  <strong>Sesi Masuk Aktif</strong>
                  <span>Terhubung aman sebagai {displayName}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-session-logout"
                disabled={logoutPending || profileForm.processing || passwordForm.processing}
                onClick={handleLogout}
              >
                <LogOut size={14} aria-hidden="true" />
                <span>{logoutPending ? 'Keluar akun…' : 'Keluar dari Akun'}</span>
              </button>
            </section>
          </div>
        </div>

        {/* Modal Konfirmasi Batal Perubahan */}
        {leaving && (
          <Dialog title="Tinggalkan perubahan akun?" onClose={() => setLeaving(null)}>
            <p className="consumer-confirm-copy">Perubahan profil atau kata sandi yang kamu masukkan belum disimpan.</p>
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
