import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react';
import { merchantDate } from '@/components/merchant/DailyOperations';
import type { ClosureReport } from '@/types/merchant';

export default function AttentionPanel({ pending, report }: { pending: number; report?: ClosureReport }) {
  return <section className="dash-card dash-attention" aria-labelledby="dash-attention-title">
    <header className="dash-card-heading"><h2 id="dash-attention-title">Perlu diperiksa</h2>{pending > 0 && <span className="owner-count amber">{pending}</span>}</header>
    {report ? <article className="dash-report">
      <AlertTriangle size={22} aria-hidden="true" />
      <div><h3>Laporan pos tutup</h3><strong>{report.business_name}</strong><span>{report.post_name}</span><p>{report.note || 'Konsumen menemukan pos tutup. Periksa kondisi dan informasi pos ini.'}</p><small>{merchantDate(report.created_at)}</small></div>
      <Link href={`/kelola-usaha/laporan?status=pending#laporan-${report.id}`} className="owner-button"><FileText size={17} aria-hidden="true" />Buka laporan</Link>
      {pending > 1 && <Link href="/kelola-usaha/laporan?status=pending" className="owner-text-link">Lihat semua {pending} laporan</Link>}
    </article>
    : <div className="dash-calm"><CheckCircle2 size={30} aria-hidden="true" /><h3>Belum ada yang perlu diperiksa</h3><p>Laporan pelanggan untuk seluruh pos akan muncul di sini.</p><Link className="owner-text-link" href="/kelola-usaha/laporan">Lihat laporan</Link></div>}
    <p className="owner-inline-hint"><Info size={16} aria-hidden="true" />Laporan tidak otomatis mengubah jam atau menutup pos.</p>
  </section>;
}
