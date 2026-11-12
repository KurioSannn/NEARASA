import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { businessCover } from '@/types/business-images';
import { managementUrl, type OwnedBusiness } from '@/types/merchant';

export default function BusinessList({ businesses }: { businesses: OwnedBusiness[] }) {
  return <section className="dash-card dash-businesses" aria-labelledby="dash-business-title">
    <header className="dash-card-heading"><h2 id="dash-business-title">Usaha kamu</h2><span className="owner-count">{businesses.length}</span></header>
    {businesses.length ? <ul>{businesses.map(business => <li key={business.id}>
      <Link href={managementUrl(business.slug)} aria-label={`Kelola ${business.name}`}>
        <img src={businessCover(business)} alt="" width={44} height={44} loading="lazy" />
        <span><strong>{business.name}</strong><small>{business.kind} · {business.menu_items_count ?? 0} menu · {business.selling_posts_count ?? 0} pos</small></span>
        {business.status !== 'published' && <em>Draf</em>}
      </Link>
    </li>)}</ul>
    : <div className="dash-calm"><Store size={28} aria-hidden="true" /><h3>Belum ada usaha terhubung</h3><p>Akun UMKM uji menyediakan usaha contoh untuk dicoba. Pendaftaran usaha baru belum tersedia.</p><Link href="/akun" className="owner-button owner-button-secondary">Buka akun</Link></div>}
  </section>;
}
