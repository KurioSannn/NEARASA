import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Eye, FileText, Info, MapPin, MessageCircle, Store, UserRound } from 'lucide-react';
import MerchantLayout from '@/layouts/MerchantLayout';
import { merchantDate, type DailyOperation } from '@/components/merchant/DailyOperations';
import { businessCover } from '@/types/business-images';
import type { SharedProps } from '@/types/catalog';
import { managementUrl, operationStatus, type ClosureReport, type MerchantNavigation, type MerchantStatistics, type OwnedBusiness } from '@/types/merchant';

type DashboardProps = { businesses: OwnedBusiness[]; operations: DailyOperation[]; statistics: MerchantStatistics; reports: ClosureReport[]; merchantNavigation: MerchantNavigation };
const metrics = [
  { key: 'profile_view', label: 'Profil dilihat', icon: Eye },
  { key: 'menu_open', label: 'Menu dibuka', icon: BookOpen },
  { key: 'map_click', label: 'Klik peta', icon: MapPin },
  { key: 'whatsapp_click', label: 'Klik WhatsApp', icon: MessageCircle },
] as const;
const number = (value: number) => value.toLocaleString('id-ID');

function Interactions({ statistics }: { statistics: MerchantStatistics }) {
  const maximum = Math.max(1, ...metrics.map(({ key }) => statistics.totals[key]));
  const empty = metrics.every(({ key }) => statistics.totals[key] === 0);
  return <section className="owner-panel owner-interactions" aria-labelledby="owner-interaction-title"><header className="owner-panel-heading"><div><h2 id="owner-interaction-title">Interaksi di NEARASA</h2><p>{statistics.days} hari terakhir · seluruh usaha</p></div></header>
    <dl className="owner-metric-bars">{metrics.map(({ key, label, icon: Icon }) => <div key={key}><dt><Icon size={19} aria-hidden="true" />{label}</dt><dd><span className="owner-bar" aria-hidden="true"><span style={{ width: `${statistics.totals[key] / maximum * 100}%` }} /></span><strong>{number(statistics.totals[key])}</strong></dd></div>)}</dl>
    {empty && <p className="owner-inline-hint"><Info size={16} aria-hidden="true" />Belum ada interaksi tercatat dalam periode ini.</p>}
    <details className="owner-disclosure owner-metric-help"><summary><Info size={16} aria-hidden="true" />Cara menghitung<ChevronDown size={16} aria-hidden="true" /></summary><div><p>Profil dilihat saat detail pos dibuka; menu dibuka saat pelanggan membuka rincian menu. Klik peta dan WhatsApp dicatat saat tombol tersebut ditekan.</p><p>Aktivitas pada usaha sendiri dikecualikan. Pengulangan jenis interaksi di pos yang sama dalam 30 menit dihitung sekali per akun yang masuk, atau per sesi tamu.</p><p>Angka ini adalah interaksi aplikasi, bukan penjualan, kunjungan fisik, atau pelanggan unik.</p></div></details>
    {statistics.by_post.length > 0 && <details className="owner-disclosure"><summary>Rincian per pos<ChevronDown size={16} aria-hidden="true" /></summary><ul className="owner-stat-posts">{statistics.by_post.map(post => <li key={post.post_id}><strong>{post.business_name}<span>{post.post_name}</span></strong><dl>{metrics.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{number(post[key])}</dd></div>)}</dl></li>)}</ul></details>}
  </section>;
}

export default function Dashboard({ businesses, operations, statistics, reports, merchantNavigation }: DashboardProps) {
  const { auth } = usePage<SharedProps>().props;
  const pending = merchantNavigation.pending_reports;
  const firstReport = reports.find(report => !report.resolved_at);
  const openCount = operations.filter(operation => operation.post.is_open && operation.post.operating_status !== 'permanently_closed').length;
  const summaries = [
    { label: 'Usaha terkelola', value: businesses.length, icon: Store, href: merchantNavigation.manage_url, className: 'owner-summary-primary' },
    { label: 'Pos jualan', value: operations.length, icon: MapPin, href: `${merchantNavigation.manage_url}?tab=posts`, className: '' },
    { label: 'Buka saat ini', value: openCount, suffix: `dari ${operations.length} pos`, icon: CalendarDays, href: '#pos-hari-ini', className: '' },
    { label: 'Laporan perlu diperiksa', value: pending, icon: AlertTriangle, href: '/kelola-usaha/laporan?status=pending', className: 'owner-summary-warning' },
  ];
  return <><Head title="Dashboard pemilik" /><div className="owner-dashboard">
    <header className="owner-page-heading"><div><h1>Dashboard</h1><p>Ringkasan seluruh usahamu.</p></div>{businesses.length > 0 && <Link className="owner-button" href={merchantNavigation.manage_url}><Store size={18} aria-hidden="true" />Kelola usaha</Link>}</header>
    <div className="owner-summaries">{summaries.map(({ label, value, suffix, icon: Icon, href, className }) => <Link href={href} className={`owner-summary ${className}`} key={label}><div><Icon size={22} aria-hidden="true" /><span>{label}</span></div><strong>{number(value)}{suffix && <small>{suffix}</small>}</strong><ChevronRight className="owner-summary-arrow" size={19} aria-hidden="true" /></Link>)}</div>
    <div className="owner-dashboard-grid"><Interactions statistics={statistics} /><section className="owner-panel owner-attention" aria-labelledby="owner-attention-title"><header className="owner-panel-heading"><h2 id="owner-attention-title">Perlu diperiksa</h2>{pending > 0 && <span className="owner-count amber">{pending}</span>}</header>
      {firstReport ? <article className="owner-report-highlight"><AlertTriangle size={22} aria-hidden="true" /><div><h3>Laporan pos tutup</h3><strong>{firstReport.business_name}</strong><span>{firstReport.post_name}</span><p>{firstReport.note || 'Konsumen menemukan pos tutup. Periksa kondisi dan informasi pos ini.'}</p><small>{merchantDate(firstReport.created_at)}</small></div><Link href={`/kelola-usaha/laporan?status=pending#laporan-${firstReport.id}`} className="owner-button"><FileText size={17} aria-hidden="true" />Buka laporan</Link></article>
        : <div className="owner-calm-state"><CheckCircle2 size={30} aria-hidden="true" /><h3>Belum ada yang perlu diperiksa</h3><p>Laporan pelanggan untuk seluruh pos akan muncul di sini.</p><Link className="owner-text-link" href="/kelola-usaha/laporan">Lihat laporan<ArrowRight size={16} aria-hidden="true" /></Link></div>}
      <p className="owner-inline-hint"><Info size={16} aria-hidden="true" />Laporan tidak otomatis mengubah jam atau menutup pos.</p>
    </section></div>
    <section className="owner-panel owner-today" id="pos-hari-ini" aria-labelledby="owner-today-title"><header className="owner-panel-heading"><div><h2 id="owner-today-title">Ringkasan pos hari ini</h2><p>Status mengikuti jadwal dan jam khusus pemilik · WIB</p></div></header>
      {operations.length ? <div className="owner-post-table"><div className="owner-post-table-head" aria-hidden="true"><span>Usaha</span><span>Pos jualan</span><span>Jam hari ini (WIB)</span><span>Status</span><span /></div><ul>{operations.map(operation => {
        const business = businesses.find(item => item.id === operation.business_id);
        const status = operationStatus(operation.post);
        const hours = operation.post.today_hours;
        return <li key={operation.post.id}><div className="owner-table-business">{business && <img src={businessCover(business)} alt="" width={44} height={44} loading="lazy" />}<strong>{operation.business_name}</strong></div><span className="owner-table-post">{operation.post.name}</span><div className="owner-table-hours"><span className="profile-sr-only">Jam hari ini: </span>{hours ? `${hours.opens_at.slice(0, 5)}–${hours.closes_at.slice(0, 5)}${hours.closes_tomorrow ? ' besok' : ''}` : operation.post.schedule_today?.label ?? 'Belum diatur'}{hours && <small>Jam khusus</small>}</div><span className={`owner-status${status.open ? ' is-open' : ''}`}><span aria-hidden="true" />{status.label}</span><Link href={managementUrl(operation.business_slug, operation.post.id)} className="owner-button owner-button-secondary owner-table-action" aria-label={`Kelola ${operation.business_name}, ${operation.post.name}`}>Kelola<ChevronRight size={15} aria-hidden="true" /></Link></li>;
      })}</ul></div> : <div className="owner-empty"><Store size={30} aria-hidden="true" /><h3>{businesses.length ? 'Belum ada pos jualan' : 'Belum ada usaha terhubung'}</h3><p>{businesses.length ? 'Tambahkan pos melalui tab Pos & jadwal di Kelola usaha.' : 'Akun UMKM uji menyediakan usaha contoh untuk dicoba. Pendaftaran usaha baru belum tersedia.'}</p><Link href={businesses.length ? merchantNavigation.manage_url : '/akun'} className="owner-button owner-button-secondary">{businesses.length ? 'Kelola usaha' : 'Buka akun'}</Link></div>}
    </section>
    {auth.user && <Link href="/akun" className="owner-account-note"><UserRound size={19} aria-hidden="true" /><span>Nama publik & akun<small>Atur nama yang terlihat oleh konsumen.</small></span><ChevronRight size={18} aria-hidden="true" /></Link>}
  </div></>;
}
Dashboard.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
