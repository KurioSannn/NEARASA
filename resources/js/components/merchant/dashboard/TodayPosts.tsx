import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import type { DailyOperation } from '@/components/merchant/DailyOperations';
import { businessCover } from '@/types/business-images';
import { managementUrl, operationStatus, type OwnedBusiness } from '@/types/merchant';

type Props = { businesses: OwnedBusiness[]; operations: DailyOperation[]; manageUrl: string };

function hoursLabel({ post }: DailyOperation) {
  const hours = post.today_hours;
  return hours ? `${hours.opens_at.slice(0, 5)}–${hours.closes_at.slice(0, 5)}${hours.closes_tomorrow ? ' besok' : ''}` : post.schedule_today?.label ?? 'Belum diatur';
}

export default function TodayPosts({ businesses, operations, manageUrl }: Props) {
  return <section className="dash-card dash-today" id="pos-hari-ini" aria-labelledby="dash-today-title">
    <header className="dash-card-heading"><div><h2 id="dash-today-title">Ringkasan pos hari ini</h2><p>Status mengikuti jadwal dan jam khusus pemilik · WIB</p></div></header>
    {operations.length ? <div className="dash-table">
      <div className="dash-table-head" aria-hidden="true"><span>Usaha</span><span>Pos jualan</span><span>Jam hari ini (WIB)</span><span>Status</span><span /></div>
      <ul>{operations.map(operation => {
        const business = businesses.find(item => item.id === operation.business_id);
        const status = operationStatus(operation.post);
        const tone = status.open ? ' is-open' : operation.post.operating_status === 'temporarily_closed' ? ' is-warning' : '';
        return <li key={operation.post.id}>
          <div className="dash-table-business">{business && <img src={businessCover(business)} alt="" width={44} height={44} loading="lazy" />}<strong>{operation.business_name}</strong></div>
          <span>{operation.post.name}</span>
          <div className="dash-table-hours"><span className="profile-sr-only">Jam hari ini: </span>{hoursLabel(operation)}{operation.post.today_hours && <small>Jam khusus</small>}</div>
          <span className={`owner-status${tone}`}><span aria-hidden="true" />{status.label}</span>
          <Link href={managementUrl(operation.business_slug, operation.post.id)} className="owner-button owner-button-secondary dash-table-action" aria-label={`Kelola ${operation.business_name}, ${operation.post.name}`}>Kelola</Link>
        </li>;
      })}</ul>
    </div> : <div className="dash-calm"><Store size={30} aria-hidden="true" /><h3>{businesses.length ? 'Belum ada pos jualan' : 'Belum ada usaha terhubung'}</h3><p>{businesses.length ? 'Tambahkan pos melalui tab Pos & jadwal di Kelola usaha.' : 'Tambahkan usaha terlebih dahulu agar pos jualan muncul di sini.'}</p>{businesses.length > 0 && <Link href={`${manageUrl}?tab=posts`} className="owner-button owner-button-secondary">Tambah pos jualan</Link>}</div>}
  </section>;
}
