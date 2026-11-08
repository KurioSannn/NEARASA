import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, FileText, Info, Store } from 'lucide-react';
import MerchantLayout from '@/layouts/MerchantLayout';
import { merchantDate } from '@/components/merchant/DailyOperations';
import { businessCover } from '@/types/business-images';
import { managementUrl, type ClosureReport, type MerchantNavigation } from '@/types/merchant';

type Props = { merchantNavigation: MerchantNavigation; filters: { status: string; business: number | null }; counts: { all: number; pending: number; resolved: number }; reports: { data: ClosureReport[]; current_page: number; last_page: number; total: number; prev_page_url: string | null; next_page_url: string | null } };
const statuses = [['all', 'Semua'], ['pending', 'Perlu diperiksa'], ['resolved', 'Sudah diperiksa']] as const;

function Report({ report, open, onToggle }: { report: ClosureReport; open: boolean; onToggle: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const resolved = Boolean(report.resolved_at);
  return <li className="owner-report" id={`laporan-${report.id}`}><div className="owner-report-summary"><img src={businessCover({ slug: report.business_slug, photo: report.business_photo, is_demo: report.business_is_demo })} alt="" width={48} height={48} loading="lazy" /><div className="owner-report-identity"><h2>{report.business_name}</h2><p>{report.post_name}</p></div><div className="owner-report-kind"><span>Pos ditemukan tutup</span><time dateTime={report.created_at}>{merchantDate(report.created_at)}</time></div><span className={`owner-status ${resolved ? 'is-open' : 'is-warning'}`}>{resolved ? <span aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}{resolved ? 'Sudah diperiksa' : 'Perlu diperiksa'}</span><button type="button" className="owner-text-link owner-report-toggle" aria-expanded={open} aria-controls={`report-detail-${report.id}`} onClick={onToggle}>{open ? 'Tutup detail' : 'Lihat detail'}<ChevronDown size={16} aria-hidden="true" /></button></div>
    {open && <div className="owner-report-detail" id={`report-detail-${report.id}`}><div><h3>Catatan pelanggan</h3><blockquote>{report.note || 'Tidak ada catatan tambahan.'}</blockquote><p className="owner-caption">Diterima {merchantDate(report.created_at)}</p>{report.resolved_at && <p className="owner-caption">Diperiksa {merchantDate(report.resolved_at)}</p>}</div><div><p className="owner-inline-hint"><Info size={18} aria-hidden="true" />Periksa kondisi pos, lalu perbarui informasi bila diperlukan. Menandai laporan tidak mengubah jam buka.</p><div className="owner-report-actions"><Link href={managementUrl(report.business_slug, report.post_id)} className="owner-button owner-button-secondary"><Store size={17} aria-hidden="true" />Kelola pos</Link>{!resolved && <button className="owner-button" type="button" disabled={processing} onClick={() => {
      setError(''); router.post(`/kelola-usaha/laporan/${report.id}/selesai`, {}, { preserveScroll: true, preserveState: true, errorBag: `report-${report.id}`, onStart: () => setProcessing(true), onError: errors => setError(Object.values(errors)[0] || 'Laporan belum ditandai. Coba lagi.'), onFinish: () => setProcessing(false) });
    }}><Check size={17} aria-hidden="true" />{processing ? 'Menyimpan…' : 'Tandai sudah diperiksa'}</button>}</div>{error && <p className="profile-field-error" role="alert">{error}</p>}</div></div>}
  </li>;
}

export default function Reports({ merchantNavigation, reports, counts, filters }: Props) {
  const [openId, setOpenId] = useState<number | null>(() => Number(window.location.hash.match(/^#laporan-(\d+)$/)?.[1]) || null);
  function filter(status = filters.status, business = filters.business) {
    router.get('/kelola-usaha/laporan', { ...(status !== 'all' ? { status } : {}), ...(business ? { business } : {}) }, { preserveScroll: true, preserveState: false });
  }
  return <><Head title="Laporan pemilik" /><div className="owner-reports-page"><header className="owner-page-heading"><div><h1>Laporan</h1><p>Periksa informasi pos dari pelanggan seluruh usahamu.</p></div></header>
    <section className="owner-panel owner-reports-panel" aria-labelledby="reports-list-title"><h2 className="profile-sr-only" id="reports-list-title">Laporan pos ditemukan tutup</h2><div className="owner-reports-controls"><label className="owner-report-filter"><Store size={19} aria-hidden="true" /><span className="profile-sr-only">Filter usaha</span><select value={filters.business ?? ''} onChange={event => filter(filters.status, Number(event.target.value) || null)}><option value="">Semua usaha</option>{merchantNavigation.businesses.map(business => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label><nav className="owner-report-status-filters" aria-label="Status laporan">{statuses.map(([key, label]) => <button key={key} type="button" aria-current={filters.status === key ? 'page' : undefined} onClick={() => filter(key)}>{label}<span className={`owner-count ${key === 'pending' ? 'amber' : key === 'resolved' ? 'mint' : ''}`}>{counts[key]}</span></button>)}</nav></div>
      {reports.data.length ? <ul className="owner-report-list">{reports.data.map(report => <Report key={report.id} report={report} open={openId === report.id} onToggle={() => setOpenId(openId === report.id ? null : report.id)} />)}</ul> : <div className="owner-empty">{filters.status === 'pending' ? <CheckCircle2 size={32} aria-hidden="true" /> : <FileText size={32} aria-hidden="true" />}<h3>{filters.status === 'pending' ? 'Tidak ada laporan yang perlu diperiksa' : 'Belum ada laporan di bagian ini'}</h3><p>Laporan pos ditemukan tutup akan muncul sesuai usaha dan status yang dipilih.</p></div>}
      {reports.last_page > 1 && <nav className="owner-pagination" aria-label="Halaman laporan">{reports.prev_page_url ? <Link href={reports.prev_page_url}><ChevronLeft size={17} aria-hidden="true" />Sebelumnya</Link> : <span />}<span>{reports.current_page} dari {reports.last_page}</span>{reports.next_page_url ? <Link href={reports.next_page_url}>Berikutnya<ChevronRight size={17} aria-hidden="true" /></Link> : <span />}</nav>}
    </section>
  </div></>;
}
Reports.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
