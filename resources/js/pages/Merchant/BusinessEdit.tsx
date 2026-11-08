import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Eye, Store } from 'lucide-react';
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
    setActive(tab); setSelectedPostId(post);
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
      event.preventDefault(); setLeavingFor({ url: event.detail.visit.url.href, logout });
    });
    return () => { window.removeEventListener('beforeunload', preventExit); remove(); };
  }, [hasDraft]);
  return <><div className="owner-workspace"><header className="owner-page-heading"><div><h1>Kelola usaha</h1></div></header>
    <div className="owner-business-context"><div><label htmlFor="owner-business-select">Usaha yang dikelola</label><div className="owner-business-picker"><img src={businessCover(business)} alt="" width={44} height={44} /><select id="owner-business-select" value={business.slug} onChange={event => router.get(managementUrl(event.target.value), {}, { preserveState: false })}>{merchantNavigation.businesses.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></div></div>{business.status === 'published' ? <Link className="owner-text-link" href={`/usaha/${business.slug}${postId ? `?post=${postId}` : ''}`}><Eye size={19} aria-hidden="true" />Lihat publik<ArrowRight size={16} aria-hidden="true" /></Link> : <span className="owner-caption">Draf · belum tampil di pencarian</span>}</div>
    <div className="owner-work-tabs" role="tablist" aria-label="Bagian Kelola usaha">{tabs.map((tab, index) => <button type="button" role="tab" id={`owner-tab-${tab.key}`} aria-controls={`owner-panel-${tab.key}`} aria-selected={active === tab.key} tabIndex={active === tab.key ? 0 : -1} key={tab.key} onClick={() => changeContext(tab.key)} onKeyDown={event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); changeContext(tabs[next].key); document.getElementById(`owner-tab-${tabs[next].key}`)?.focus({ preventScroll: true });
    }}>{tab.label}{tab.drafts.some(key => drafts[key]) && <span className="owner-draft-dot"><span className="profile-sr-only">Belum disimpan</span></span>}</button>)}</div>
    <div className="owner-work-panels">
      <section role="tabpanel" id="owner-panel-daily" aria-labelledby="owner-tab-daily" hidden={active !== 'daily'}><DailyOperations operations={operations} selectedPostId={postId} onSelectPost={post => changeContext('daily', post)} onRoutine={() => { changeContext('posts'); setHoursRequest(value => value + 1); }} onDirty={reportDirty} /></section>
      <section role="tabpanel" id="owner-panel-menus" aria-labelledby="owner-tab-menus" hidden={active !== 'menus'}><MenuSection business={business} onDirty={reportDirty} /></section>
      <section role="tabpanel" id="owner-panel-posts" aria-labelledby="owner-tab-posts" hidden={active !== 'posts'}><PostsSection business={business} selectedPostId={postId} requestHours={hoursRequest} onDirty={reportDirty} /></section>
      <section role="tabpanel" id="owner-panel-profile" aria-labelledby="owner-tab-profile" hidden={active !== 'profile'}><nav className="owner-subnav" aria-label="Informasi profil">{[['about', 'Tentang usaha'], ['contact', 'Kontak & tautan']].map(([key, label]) => <button key={key} type="button" aria-pressed={profilePart === key} onClick={() => setProfilePart(key)}>{label}{(key === 'about' ? drafts.about : drafts.contact) && <span className="owner-draft-dot"><span className="profile-sr-only">Belum disimpan</span></span>}</button>)}</nav><div hidden={profilePart !== 'about'}><AboutSection business={business} onDirty={reportDirty} /></div><div hidden={profilePart !== 'contact'}><ContactSection business={business} onDirty={reportDirty} /></div></section>
      <section role="tabpanel" id="owner-panel-media" aria-labelledby="owner-tab-media" hidden={active !== 'media'}><nav className="owner-subnav" aria-label="Foto dan kabar">{[['photos', 'Foto & berkas'], ['updates', 'Kabar usaha']].map(([key, label]) => <button key={key} type="button" aria-pressed={mediaPart === key} onClick={() => setMediaPart(key)}>{label}{(key === 'photos' ? drafts.media || drafts.gallery : drafts.updates) && <span className="owner-draft-dot"><span className="profile-sr-only">Belum disimpan</span></span>}</button>)}</nav><div hidden={mediaPart !== 'photos'}><MediaSection business={business} onDirty={reportDirty} /></div><div hidden={mediaPart !== 'updates'}><UpdatesSection business={business} onDirty={reportDirty} /></div></section>
    </div>
  </div>{leavingFor && <Dialog title="Tinggalkan perubahan yang belum disimpan?" onClose={() => setLeavingFor(null)}><div className="profile-confirm"><p>Ada draf yang belum disimpan. Kembali untuk menyimpannya, atau buang draf dan lanjutkan.</p><div className="profile-confirm-actions"><button className="profile-secondary" type="button" onClick={() => setLeavingFor(null)}>Kembali mengedit</button><button className="profile-danger" type="button" onClick={() => { allowNavigation.current = true; const destination = leavingFor; setLeavingFor(null); if (destination.logout) router.post(destination.url); else router.visit(destination.url); }}>Buang draf & lanjutkan</button></div></div></Dialog>}</>;
}

export default function BusinessEdit(props: Props) {
  return <><Head title={props.business ? `Kelola ${props.business.name}` : 'Kelola usaha'} />{props.business ? <BusinessWorkspace key={props.business.id} {...props} business={props.business} /> : <><header className="owner-page-heading"><h1>Kelola usaha</h1></header><div className="owner-panel owner-empty"><Store size={32} aria-hidden="true" /><h2>Belum ada usaha terhubung</h2><p>Akun UMKM uji menyediakan usaha contoh. Pendaftaran usaha baru belum tersedia.</p><Link href="/akun" className="owner-button owner-button-secondary">Buka akun</Link></div></>}</>;
}
BusinessEdit.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
