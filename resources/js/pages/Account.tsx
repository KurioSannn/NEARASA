import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronRight, Compass, Heart, History, LogOut, Store, UserRound } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import Dialog from '@/components/Dialog';
import Button from '@/components/Button';
import type { SharedProps } from '@/types/catalog';

export default function Account({ ownedCount, favoriteCount, publicName, publicProfileAvailable = false }: { ownedCount: number; favoriteCount: number; publicName: string; publicProfileAvailable?: boolean }) {
  const { auth } = usePage<SharedProps>().props;
  const [logoutPending, setLogoutPending] = useState(false);
  const [leaving, setLeaving] = useState<{ url: string; logout: boolean } | null>(null);
  const allowNavigation = useRef(false);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const form = useForm({ public_name: publicName });
  const name = auth.user?.public_name || auth.user?.name || 'Akun';
  useEffect(() => { if (form.errors.public_name) errorSummary.current?.focus(); }, [form.errors.public_name]);
  useEffect(() => {
    if (!form.isDirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const remove = router.on('before', event => {
      const logout = event.detail.visit.method === 'post' && event.detail.visit.url.pathname === '/keluar';
      if (event.detail.visit.method !== 'get' && !logout) return;
      if (allowNavigation.current) { allowNavigation.current = false; return; }
      event.preventDefault(); setLeaving({ url: event.detail.visit.url.href, logout });
    });
    window.addEventListener('beforeunload', unload);
    return () => { remove(); window.removeEventListener('beforeunload', unload); };
  }, [form.isDirty]);
  return <><Head title="Akun" /><div className="consumer-account-page"><header className="collection-page-heading"><h1>Akun</h1></header><div className="consumer-account-grid"><section className="consumer-account-info" aria-labelledby="account-info-title"><h2 id="account-info-title">Informasi akun</h2><div className="consumer-account-identity"><span className="consumer-public-avatar" aria-hidden="true">{name.charAt(0).toLocaleUpperCase('id-ID')}</span><div><h3>{name}</h3><span>Email akun</span><p>{auth.user?.email}</p></div></div>
    <form className="consumer-name-form" aria-busy={form.processing} onSubmit={event => {
      event.preventDefault(); form.patch('/akun/nama-publik', { preserveScroll: true, onSuccess: page => { const value = typeof page.props.publicName === 'string' ? page.props.publicName : form.data.public_name.trim(); form.setData('public_name', value); form.setDefaults({ public_name: value }); } });
    }}><h2>Nama publik</h2><p>Nama yang terlihat oleh pengguna lain, termasuk pada ulasanmu.</p><label htmlFor="account-public-name">Nama publik</label><div className="consumer-name-controls"><input id="account-public-name" className="text-input" autoComplete="nickname" required maxLength={80} disabled={form.processing} value={form.data.public_name} onChange={event => form.setData('public_name', event.target.value)} aria-invalid={Boolean(form.errors.public_name)} aria-describedby={form.errors.public_name ? 'account-name-error' : undefined} /><Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan…' : 'Simpan nama'}</Button></div>{form.errors.public_name && <p ref={errorSummary} id="account-name-error" tabIndex={-1} className="consumer-field-error" role="alert">{form.errors.public_name}</p>}{form.recentlySuccessful && !form.isDirty && <p className="consumer-save-success" role="status">Nama publik tersimpan.</p>}{form.isDirty && <p className="consumer-unsaved" role="status">Perubahan nama belum disimpan.</p>}</form>
    {publicProfileAvailable && auth.user && <Link href={`/pemilik/${auth.user.id}`} className="collection-text-link"><UserRound size={17} aria-hidden="true" />Lihat profil publik<ChevronRight size={16} aria-hidden="true" /></Link>}
    </section><section className="consumer-account-shortcuts" aria-labelledby="account-shortcuts-title"><h2 id="account-shortcuts-title">Akses cepat</h2><div className="consumer-shortcut-list">{[
      { href: '/kelola-usaha', title: 'Kelola usaha', description: ownedCount ? `${ownedCount} usaha terhubung ke akunmu` : 'Belum ada usaha terhubung', icon: Store },
      { href: '/favorit', title: 'Favorit', description: `${favoriteCount} usaha tersimpan`, icon: Heart },
      { href: '/riwayat', title: 'Riwayat penjelajahan', description: 'Temukan lagi pilihan yang pernah kamu lihat', icon: History },
    ].map(({ href, title, description, icon: Icon }) => <Link href={href} key={href}><Icon size={27} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div><ChevronRight size={19} aria-hidden="true" /></Link>)}</div><Link href="/jelajah" className="consumer-shortcut-explore"><Compass size={21} aria-hidden="true" /><span>Jelajah makanan</span><ChevronRight size={18} aria-hidden="true" /></Link></section></div>
    <div className="consumer-account-exit"><button type="button" disabled={logoutPending || form.processing} onClick={() => router.post('/keluar', {}, { onStart: () => setLogoutPending(true), onFinish: () => setLogoutPending(false) })}><LogOut size={18} aria-hidden="true" />{logoutPending ? 'Keluar…' : 'Keluar akun'}</button></div>
    {leaving && <Dialog title="Tinggalkan perubahan nama?" onClose={() => setLeaving(null)}><p className="consumer-confirm-copy">Nama publik yang kamu ubah belum disimpan.</p><div className="consumer-confirm-actions"><button className="button button-outline" type="button" onClick={() => setLeaving(null)}>Kembali mengedit</button><button className="button consumer-danger" type="button" onClick={() => { allowNavigation.current = true; const destination = leaving; setLeaving(null); if (destination.logout) router.post(destination.url); else router.visit(destination.url); }}>Buang perubahan & lanjutkan</button></div></Dialog>}
  </div></>;
}
Account.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
