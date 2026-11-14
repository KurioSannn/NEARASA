import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Plus,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
} from 'lucide-react';
import MerchantLayout from '@/layouts/MerchantLayout';
import AboutSection from '@/components/merchant/AboutSection';
import ContactSection from '@/components/merchant/ContactSection';
import Dialog from '@/components/Dialog';
import type { MerchantBusiness } from '@/types/business-profile';
import { businessCover } from '@/types/business-images';
import { managementUrl, type MerchantNavigation, type OwnedBusiness } from '@/types/merchant';
import type { SharedProps } from '@/types/catalog';

type SettingsProps = {
  business: MerchantBusiness | null;
  businesses: OwnedBusiness[];
  publicName: string;
  publicProfileAvailable: boolean;
  merchantNavigation: MerchantNavigation;
};

type SettingsTab = 'store' | 'owner';

export default function Settings({
  business,
  businesses,
  publicName,
  publicProfileAvailable,
}: SettingsProps) {
  const { props: { auth }, url } = usePage<SharedProps>();
  const user = auth.user;

  const query = new URLSearchParams((url || '').split('?')[1] ?? '');
  const initialTab: SettingsTab = query.get('tab') === 'owner' ? 'owner' : 'store';

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, boolean>>({});
  const [leavingFor, setLeavingFor] = useState<{ url: string; logout: boolean } | null>(null);
  const allowNavigation = useRef(false);

  // Owner avatar & account states
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [logoutPending, setLogoutPending] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm({
    name: user?.name || '',
    public_name: publicName || '',
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const reportDirty = useCallback(
    (key: string, dirty: boolean) =>
      setDrafts((previous) => (previous[key] === dirty ? previous : { ...previous, [key]: dirty })),
    []
  );

  const hasStoreDraft = Boolean(drafts.about || drafts.contact);
  const hasOwnerDraft = profileForm.isDirty || passwordForm.isDirty;
  const hasDraft = hasStoreDraft || hasOwnerDraft;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!hasDraft) return;
    const preventExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventExit);
    const remove = router.on('before', (event) => {
      const logout = event.detail.visit.method === 'post' && event.detail.visit.url.pathname === '/keluar';
      if (event.detail.visit.method !== 'get' && !logout) return;
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }
      event.preventDefault();
      setLeavingFor({ url: event.detail.visit.url.href, logout });
    });
    return () => {
      window.removeEventListener('beforeunload', preventExit);
      remove();
    };
  }, [hasDraft]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));

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
      onError: (errors) => {
        setAvatarPreview(null);
        setAvatarError(Object.values(errors)[0] || 'Gagal mengunggah foto profil.');
      },
    });
  };

  const handleAvatarDelete = () => {
    setAvatarError('');
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
      onSuccess: (page) => {
        const nextPublic = typeof page.props.publicName === 'string' ? page.props.publicName : profileForm.data.public_name;
        profileForm.setData('public_name', nextPublic);
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

  const displayName = profileForm.data.name || user?.name || 'Pemilik';
  const currentAvatarSrc = avatarPreview || user?.avatar;

  return (
    <>
      <Head title="Setelan Mitra & Toko" />
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <header className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-clay-900">
              Setelan Mitra & Toko
            </h1>
            <p className="text-xs text-clay-700 font-medium mt-1 max-w-2xl">
              Kelola informasi profil usaha, kontak toko, identitas publik pemilik, dan keamanan akunmu di satu tempat.
            </p>
          </div>
          <Link
            href="/kelola-usaha/daftar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-terracotta hover:bg-terracotta-600 text-white !text-white shadow-pill transition-colors duration-150 shrink-0"
          >
            <Plus className="w-4 h-4 text-white !text-white" aria-hidden="true" />
            <span className="text-white !text-white">Tambah Usaha Baru</span>
          </Link>
        </header>

        {/* Main 2-Tab Switcher */}
        <nav aria-label="Kategori setelan" className="flex items-center justify-center sm:justify-start pb-1">
          <div className="flex flex-col sm:flex-row items-center justify-center bg-white/95 p-1.5 sm:p-1 rounded-2xl sm:rounded-full border border-sand-border shadow-sm gap-1 w-full sm:w-fit">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'store'}
              onClick={() => setActiveTab('store')}
              className={`w-full sm:w-auto justify-center px-4 py-2 rounded-xl sm:rounded-full text-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'store'
                  ? 'font-bold bg-terracotta text-white !text-white shadow-pill'
                  : 'font-semibold text-clay-800 hover:text-terracotta hover:bg-[#fdeee9]'
              }`}
            >
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Profil & Kontak Toko</span>
              {hasStoreDraft && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'store' ? 'bg-amber-300' : 'bg-amber-500'}`} />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'owner'}
              onClick={() => setActiveTab('owner')}
              className={`w-full sm:w-auto justify-center px-4 py-2 rounded-xl sm:rounded-full text-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'owner'
                  ? 'font-bold bg-terracotta text-white !text-white shadow-pill'
                  : 'font-semibold text-clay-800 hover:text-terracotta hover:bg-[#fdeee9]'
              }`}
            >
              <UserRound className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Akun Pemilik & Keamanan</span>
              {hasOwnerDraft && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'owner' ? 'bg-amber-300' : 'bg-amber-500'}`} />
              )}
            </button>
          </div>
        </nav>

        {/* TAB 1: Profil & Kontak Toko (Opsi 2) */}
        <div hidden={activeTab !== 'store'} className="flex flex-col gap-6">
          {business ? (
            <>
              {/* Active Business Switcher Card */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand-border shadow-soft flex flex-col items-center text-center md:flex-row md:items-center md:text-left justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0 w-full md:w-auto">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-sand-surface border border-sand-border shadow-sm flex-none">
                    <img src={businessCover(business)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col items-center sm:items-start min-w-0">
                    <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider">
                      Toko yang Diatur
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 flex-wrap">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                          className="flex items-center gap-2 bg-clay-50/90 hover:bg-[#fdeee9] text-clay-900 text-sm font-extrabold rounded-xl px-3.5 py-2 border border-sand-border hover:border-terracotta-300 cursor-pointer transition-all focus:ring-2 focus:ring-terracotta/20 outline-none shadow-xs"
                          aria-expanded={businessDropdownOpen}
                        >
                          <span>{business.name}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-clay-500 transition-transform duration-200 ${
                              businessDropdownOpen ? 'rotate-180 text-terracotta' : ''
                            }`}
                          />
                        </button>

                        {businessDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setBusinessDropdownOpen(false)} />
                            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 min-w-[220px] bg-white border border-sand-border rounded-2xl shadow-xl p-1.5 z-50 space-y-1 text-left">
                              {businesses.map((item) => {
                                const isSelected = item.slug === business.slug;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      setBusinessDropdownOpen(false);
                                      if (!isSelected) {
                                        router.get(
                                          '/kelola-usaha/setelan',
                                          { usaha: item.slug },
                                          { preserveScroll: true, preserveState: false }
                                        );
                                      }
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                                      isSelected
                                        ? 'bg-terracotta-50 text-terracotta font-extrabold border border-terracotta-200'
                                        : 'text-clay-800 font-semibold hover:bg-[#fdeee9] hover:text-terracotta border border-transparent'
                                    }`}
                                  >
                                    <span>{item.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {business.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif Publik
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draf
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-2.5 flex-wrap w-full md:w-auto">
                  <Link
                    href={managementUrl(business.slug)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-[#fdeee9] text-clay-800 hover:text-terracotta border border-sand-border transition-colors duration-150 shadow-xs"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
                    <span>Buka Operasional & Menu</span>
                  </Link>
                  {business.status === 'published' && (
                    <Link
                      href={`/usaha/${business.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-terracotta-50 text-terracotta hover:bg-terracotta hover:text-white border border-terracotta-200 transition-colors duration-150 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Lihat Publik</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* About & Contact Sections */}
              <AboutSection key={`about-${business.id}`} business={business} onDirty={reportDirty} />
              <ContactSection key={`contact-${business.id}`} business={business} onDirty={reportDirty} />
            </>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-soft flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-terracotta-50 text-terracotta flex items-center justify-center">
                <Store className="w-8 h-8" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-extrabold text-clay-900">Belum ada usaha terhubung</h2>
              <p className="text-sm text-clay-600 max-w-md">
                Daftarkan warung makan atau tokomu terlebih dahulu untuk mengatur profil, cerita usaha, dan kontak pelanggan.
              </p>
              <Link
                href="/kelola-usaha/daftar"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-terracotta text-white !text-white shadow-pill hover:bg-terracotta-600 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-white !text-white" />
                <span>Daftarkan Usaha Pertama</span>
              </Link>
            </div>
          )}
        </div>

        {/* TAB 2: Akun Pemilik & Keamanan (Opsi 1) */}
        <div hidden={activeTab !== 'owner'} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Owner Profile & Security (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Card 1: Profil Publik Pemilik */}
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-border shadow-soft space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 pb-4 border-b border-sand-border text-center sm:text-left">
                <div>
                  <h2 className="text-lg font-extrabold text-clay-900">Profil Publik Pemilik</h2>
                  <p className="text-xs text-clay-600 mt-0.5">
                    Identitas ini ditampilkan pada halaman profil pemilik dan daftar usahamu.
                  </p>
                </div>
                {publicProfileAvailable && user && (
                  <Link
                    href={`/pemilik/${user.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-terracotta-50 text-terracotta hover:bg-terracotta hover:text-white border border-terracotta-200 transition-colors shrink-0"
                  >
                    <span>Lihat Halaman Pemilik</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

              {/* Avatar Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-clay-50/70 border border-sand-border text-center sm:text-left">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-terracotta-100 text-terracotta flex items-center justify-center font-extrabold text-xl ring-2 ring-terracotta/30 shrink-0">
                  {currentAvatarSrc ? (
                    <img src={currentAvatarSrc} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-bold text-clay-900">Foto Profil Pemilik</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      disabled={avatarPending}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-[#fdeee9] text-clay-800 hover:text-terracotta border border-sand-border transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
                      <span>{avatarPending ? 'Mengunggah…' : 'Ganti Foto'}</span>
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        disabled={avatarPending}
                        onClick={handleAvatarDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  {avatarError && <p className="text-xs text-rose-600 font-medium">{avatarError}</p>}
                </div>
              </div>

              {/* Profile Name Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      id="owner-name"
                      type="text"
                      required
                      maxLength={255}
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-semibold text-clay-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 outline-none"
                    />
                    {profileForm.errors.name && (
                      <p className="text-xs text-rose-600 mt-1">{profileForm.errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="owner-public-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                      Nama Publik Pemilik
                    </label>
                    <input
                      id="owner-public-name"
                      type="text"
                      maxLength={80}
                      placeholder="Contoh: Ibu Ani"
                      value={profileForm.data.public_name}
                      onChange={(e) => profileForm.setData('public_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-semibold text-clay-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 outline-none"
                    />
                    {profileForm.errors.public_name && (
                      <p className="text-xs text-rose-600 mt-1">{profileForm.errors.public_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                  {profileForm.wasSuccessful ? (
                    <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Profil pemilik tersimpan.
                    </span>
                  ) : (
                    <span className="text-[11px] text-clay-500">Ditampilkan sebagai identitas pengelola toko.</span>
                  )}
                  <button
                    type="submit"
                    disabled={profileForm.processing || !profileForm.isDirty}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-terracotta hover:bg-terracotta-600 text-white !text-white shadow-pill disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {profileForm.processing ? 'Menyimpan…' : 'Simpan Profil Pemilik'}
                  </button>
                </div>
              </form>
            </section>

            {/* Card 2: Keamanan & Kata Sandi */}
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-border shadow-soft space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 pb-4 border-b border-sand-border text-center sm:text-left">
                <div>
                  <h2 className="text-lg font-extrabold text-clay-900">Keamanan & Kata Sandi</h2>
                  <p className="text-xs text-clay-600 mt-0.5">
                    Perbarui kata sandi masuk atau kelola sesi akunmu.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="truncate max-w-[180px]">{user?.email}</span>
                </span>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="settings-current-password" className="block text-xs font-bold text-clay-800 mb-1.5">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      id="settings-current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.data.current_password}
                      onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-semibold text-clay-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-500 hover:text-terracotta"
                      aria-label="Toggle kata sandi saat ini"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.errors.current_password && (
                    <p className="text-xs text-rose-600 mt-1">{passwordForm.errors.current_password}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings-new-password" className="block text-xs font-bold text-clay-800 mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        id="settings-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-semibold text-clay-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-500 hover:text-terracotta"
                        aria-label="Toggle kata sandi baru"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.errors.password && (
                      <p className="text-xs text-rose-600 mt-1">{passwordForm.errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="settings-confirm-password" className="block text-xs font-bold text-clay-800 mb-1.5">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        id="settings-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-semibold text-clay-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-500 hover:text-terracotta"
                        aria-label="Toggle konfirmasi sandi"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                  {passwordForm.wasSuccessful ? (
                    <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Kata sandi diperbarui.
                    </span>
                  ) : (
                    <span className="text-[11px] text-clay-500 inline-flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Minimal 8 karakter.
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={passwordForm.processing || !passwordForm.isDirty}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-terracotta hover:bg-terracotta-600 text-white !text-white shadow-pill disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {passwordForm.processing ? 'Memperbarui…' : 'Perbarui Kata Sandi'}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-sand-border flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-clay-600">Akhiri sesi akun pada perangkat ini</span>
                <button
                  type="button"
                  disabled={logoutPending}
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{logoutPending ? 'Keluar…' : 'Keluar Akun'}</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Daftar Usaha Terhubung (5 cols) */}
          <aside className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-sand-border shadow-soft space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border">
              <div>
                <h2 className="text-base font-extrabold text-clay-900">Usaha Terhubung</h2>
                <p className="text-[11px] text-clay-600">{businesses.length} usaha terdaftar di akun ini</p>
              </div>
              <Link
                href="/kelola-usaha/daftar"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-terracotta-50 text-terracotta hover:bg-terracotta hover:text-white border border-terracotta-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </Link>
            </div>

            {businesses.length > 0 ? (
              <ul className="space-y-3">
                {businesses.map((item) => (
                  <li
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-clay-50/70 border border-sand-border flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={businessCover(item)}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-sand-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-xs font-extrabold text-clay-900 truncate">{item.name}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status === 'published' ? 'Publik' : 'Draf'}
                          </span>
                        </div>
                        <p className="text-[11px] text-clay-600 mt-0.5">
                          {item.menu_items_count ?? 0} menu · {item.selling_posts_count ?? 0} pos jualan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-sand-border/70">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('store');
                          router.get(
                            '/kelola-usaha/setelan',
                            { usaha: item.slug },
                            { preserveScroll: true, preserveState: false }
                          );
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold bg-white hover:bg-[#fdeee9] text-clay-800 hover:text-terracotta border border-sand-border transition-colors cursor-pointer"
                      >
                        Atur Profil Toko
                      </button>
                      <Link
                        href={managementUrl(item.slug)}
                        className="flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold text-center bg-terracotta-50 hover:bg-terracotta text-terracotta hover:text-white border border-terracotta-200 transition-colors"
                      >
                        Kelola Pos & Menu
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-clay-50/70 border border-sand-border space-y-3">
                <p className="text-xs text-clay-600">Belum ada usaha kuliner yang terhubung.</p>
                <Link
                  href="/kelola-usaha/daftar"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-terracotta text-white !text-white shadow-pill"
                >
                  <Plus className="w-3.5 h-3.5 text-white !text-white" />
                  <span>Daftarkan Usaha Pertama</span>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      {leavingFor && (
        <Dialog title="Tinggalkan perubahan yang belum disimpan?" onClose={() => setLeavingFor(null)}>
          <div className="profile-confirm">
            <p>Ada perubahan yang belum disimpan. Kembali untuk menyimpannya, atau buang dan lanjutkan.</p>
            <div className="profile-confirm-actions">
              <button className="profile-secondary" type="button" onClick={() => setLeavingFor(null)}>
                Kembali mengedit
              </button>
              <button
                className="profile-danger"
                type="button"
                onClick={() => {
                  allowNavigation.current = true;
                  const destination = leavingFor;
                  setLeavingFor(null);
                  if (destination.logout) router.post(destination.url);
                  else router.visit(destination.url);
                }}
              >
                Buang perubahan & lanjutkan
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

Settings.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
