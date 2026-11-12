import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Eye, Store } from 'lucide-react';
import MerchantLayout from '@/layouts/MerchantLayout';
import Dialog from '@/components/Dialog';
import type { MerchantBusiness } from '@/types/business-profile';
import { businessCover } from '@/types/business-images';
import { managementUrl, type MerchantNavigation } from '@/types/merchant';
import AboutSection from '@/components/merchant/AboutSection';
import ContactSection from '@/components/merchant/ContactSection';
import MediaSection from '@/components/merchant/MediaSection';
import MenuSection from '@/components/merchant/MenuSection';
import PostsSection from '@/components/merchant/PostsSection';
import UpdatesSection from '@/components/merchant/UpdatesSection';
import DailyOperations, { type DailyOperation } from '@/components/merchant/DailyOperations';

const tabs = [
  { key: 'daily', label: 'Operasional', drafts: ['daily'] },
  { key: 'menus', label: 'Menu & harga', drafts: ['menus'] },
  { key: 'posts', label: 'Pos & jadwal', drafts: ['posts', 'hours', 'services'] },
  { key: 'profile', label: 'Profil usaha', drafts: ['about', 'contact'] },
  { key: 'media', label: 'Foto & kabar', drafts: ['media', 'gallery', 'updates'] },
] as const;
type TabKey = typeof tabs[number]['key'];
type Props = { business: MerchantBusiness | null; operations: DailyOperation[]; merchantNavigation: MerchantNavigation };

function BusinessWorkspace({ business, operations, merchantNavigation }: Props & { business: MerchantBusiness }) {
  const { url } = usePage();
  const query = new URLSearchParams(url.split('?')[1] ?? '');
  const initialTab = tabs.find(tab => tab.key === query.get('tab'))?.key ?? 'daily';
  const [active, setActive] = useState<TabKey>(initialTab);
  const [selectedPostId, setSelectedPostId] = useState(Number(query.get('post')) || operations[0]?.post.id || 0);
  const [profilePart, setProfilePart] = useState('about');
  const [mediaPart, setMediaPart] = useState('photos');
  const [hoursRequest, setHoursRequest] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, boolean>>({});
  const [leavingFor, setLeavingFor] = useState<{ url: string; logout: boolean } | null>(null);
  const allowNavigation = useRef(false);
  const hasDraft = Object.values(drafts).some(Boolean);
  const reportDirty = useCallback((key: string, dirty: boolean) => setDrafts(previous => previous[key] === dirty ? previous : { ...previous, [key]: dirty }), []);
  const postId = operations.some(operation => operation.post.id === selectedPostId) ? selectedPostId : operations[0]?.post.id ?? 0;

  function changeContext(tab: TabKey, post = postId) {
    setActive(tab);
    setSelectedPostId(post);
    router.replace({ url: managementUrl(business.slug, post || undefined, tab), preserveScroll: true, preserveState: true });
  }

  useEffect(() => {
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    setActive(tabs.find(tab => tab.key === params.get('tab'))?.key ?? 'daily');
    const requested = Number(params.get('post'));
    if (requested && operations.some(operation => operation.post.id === requested)) setSelectedPostId(requested);
  }, [url, operations]);

  useEffect(() => {
    if (!hasDraft) return;
    const preventExit = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventExit);
    const remove = router.on('before', event => {
      const logout = event.detail.visit.method === 'post' && event.detail.visit.url.pathname === '/keluar';
      if (event.detail.visit.method !== 'get' && !logout) return;
      if (allowNavigation.current) { allowNavigation.current = false; return; }
      event.preventDefault();
      setLeavingFor({ url: event.detail.visit.url.href, logout });
    });
    return () => { window.removeEventListener('beforeunload', preventExit); remove(); };
  }, [hasDraft]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Page Header - Aligned vertically with content cards */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-clay-900">
              Kelola Usaha
            </h1>
            <p className="text-xs text-clay-700 font-medium mt-1">
              Atur jam operasional, ketersediaan menu, dan informasi profil tokomu.
            </p>
          </div>
        </div>

        {/* Usaha Context Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-sand-surface border border-sand-border shadow-sm flex-none">
              <img
                src={businessCover(business)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <label htmlFor="owner-business-select" className="text-[11px] font-bold text-clay-700 uppercase tracking-wider">
                Usaha yang Dikelola
              </label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="relative">
                  <select
                    id="owner-business-select"
                    value={business.slug}
                    onChange={(event) => router.get(managementUrl(event.target.value), {}, { preserveState: false })}
                    className="appearance-none bg-clay-50 hover:bg-clay-100/70 text-clay-900 text-sm font-extrabold rounded-xl pl-3 pr-8 py-2 border border-sand-border cursor-pointer transition focus:ring-2 focus:ring-terracotta/20 outline-none"
                  >
                    {merchantNavigation.businesses.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-clay-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

          <div className="flex items-center gap-3">
            {business.status === 'published' ? (
              <Link
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-terracotta-50 text-terracotta hover:bg-terracotta hover:text-white border border-terracotta-200 transition-colors duration-150 shadow-xs"
                href={`/usaha/${business.slug}${postId ? `?post=${postId}` : ''}`}
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>Lihat Publik</span>
              </Link>
            ) : (
              <span className="text-xs text-clay-700 font-medium">Draf · Belum tampil di pencarian</span>
            )}
          </div>
        </div>

        {/* Work Tabs Nav Pill Switcher - Compact & Proportional */}
        <nav aria-label="Bagian Kelola usaha" className="flex items-center overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center bg-white/95 p-1 rounded-full border border-sand-border shadow-sm gap-1 w-fit">
            {tabs.map((tab, index) => {
              const isSelected = active === tab.key;
              const hasDraftInTab = tab.drafts.some((key) => drafts[key]);
              return (
                <button
                  type="button"
                  role="tab"
                  id={`owner-tab-${tab.key}`}
                  aria-controls={`owner-panel-${tab.key}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  key={tab.key}
                  onClick={() => changeContext(tab.key)}
                  onKeyDown={(event) => {
                    let next = index;
                    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
                    else if (event.key === 'Home') next = 0;
                    else if (event.key === 'End') next = tabs.length - 1;
                    else return;
                    event.preventDefault();
                    changeContext(tabs[next].key);
                    document.getElementById(`owner-tab-${tabs[next].key}`)?.focus({ preventScroll: true });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-colors duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'font-bold bg-terracotta text-white !text-white shadow-pill'
                      : 'font-semibold text-clay-800 hover:text-terracotta hover:bg-[#fdeee9]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {hasDraftInTab && (
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`}
                      title="Ada draf belum disimpan"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab Panels */}
        <div className="w-full">
          <section role="tabpanel" id="owner-panel-daily" aria-labelledby="owner-tab-daily" hidden={active !== 'daily'}>
            <DailyOperations
              operations={operations}
              selectedPostId={postId}
              onSelectPost={(post) => changeContext('daily', post)}
              onRoutine={() => {
                changeContext('posts');
                setHoursRequest((value) => value + 1);
              }}
              onDirty={reportDirty}
            />
          </section>
          <section role="tabpanel" id="owner-panel-menus" aria-labelledby="owner-tab-menus" hidden={active !== 'menus'}>
            <MenuSection business={business} onDirty={reportDirty} />
          </section>
          <section role="tabpanel" id="owner-panel-posts" aria-labelledby="owner-tab-posts" hidden={active !== 'posts'}>
            <PostsSection business={business} selectedPostId={postId} requestHours={hoursRequest} onDirty={reportDirty} />
          </section>
          <section role="tabpanel" id="owner-panel-profile" aria-labelledby="owner-tab-profile" hidden={active !== 'profile'}>
            <div className="flex items-center gap-2 bg-white/95 p-1 rounded-full border border-sand-border shadow-sm w-fit mb-5">
              {[['about', 'Tentang usaha'], ['contact', 'Kontak & tautan']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={profilePart === key}
                  onClick={() => setProfilePart(key)}
                  className={`px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    profilePart === key
                      ? 'font-bold bg-terracotta text-white shadow-pill'
                      : 'font-semibold text-clay-600 hover:text-clay-900'
                  }`}
                >
                  <span>{label}</span>
                  {(key === 'about' ? drafts.about : drafts.contact) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>
            <div hidden={profilePart !== 'about'}>
              <AboutSection business={business} onDirty={reportDirty} />
            </div>
            <div hidden={profilePart !== 'contact'}>
              <ContactSection business={business} onDirty={reportDirty} />
            </div>
          </section>
          <section role="tabpanel" id="owner-panel-media" aria-labelledby="owner-tab-media" hidden={active !== 'media'}>
            <div className="flex items-center gap-2 bg-white/95 p-1 rounded-full border border-sand-border shadow-sm w-fit mb-5">
              {[['photos', 'Foto & berkas'], ['updates', 'Kabar usaha']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={mediaPart === key}
                  onClick={() => setMediaPart(key)}
                  className={`px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    mediaPart === key
                      ? 'font-bold bg-terracotta text-white shadow-pill'
                      : 'font-semibold text-clay-600 hover:text-clay-900'
                  }`}
                >
                  <span>{label}</span>
                  {(key === 'photos' ? drafts.media || drafts.gallery : drafts.updates) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>
            <div hidden={mediaPart !== 'photos'}>
              <MediaSection business={business} onDirty={reportDirty} />
            </div>
            <div hidden={mediaPart !== 'updates'}>
              <UpdatesSection business={business} onDirty={reportDirty} />
            </div>
          </section>
        </div>
      </div>

      {leavingFor && (
        <Dialog title="Tinggalkan perubahan yang belum disimpan?" onClose={() => setLeavingFor(null)}>
          <div className="profile-confirm">
            <p>Ada draf yang belum disimpan. Kembali untuk menyimpannya, atau buang draf dan lanjutkan.</p>
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
                Buang draf & lanjutkan
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default function BusinessEdit(props: Props) {
  return (
    <>
      <Head title={props.business ? `Kelola ${props.business.name}` : 'Kelola usaha'} />
      {props.business ? (
        <BusinessWorkspace key={props.business.id} {...props} business={props.business} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link
              href="/kelola-usaha"
              className="w-10 h-10 rounded-2xl bg-white border border-sand-border flex items-center justify-center text-clay-600 hover:text-clay-900 shadow-soft transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-clay-900">
              Kelola usaha
            </h1>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-soft flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-terracotta-50 text-terracotta flex items-center justify-center">
              <Store className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-extrabold text-clay-900">Belum ada usaha terhubung</h2>
            <p className="text-sm text-clay-500 max-w-md">
              Akun UMKM uji menyediakan usaha contoh. Pendaftaran usaha baru belum tersedia.
            </p>
            <Link
              href="/akun"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-terracotta text-white shadow-pill hover:bg-terracotta-600 transition"
            >
              Buka akun
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
BusinessEdit.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
