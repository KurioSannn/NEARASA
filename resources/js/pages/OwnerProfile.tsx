import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Store } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import BusinessLocationsCard from '@/components/BusinessLocationsCard';
import { groupBusinessLocations, publicOwnerBackUrl } from '@/types/consumer-pages';
import type { BusinessCardData, PublicOwner } from '@/types/catalog';

export default function OwnerProfile({ owner, businesses }: { owner: PublicOwner; businesses: BusinessCardData[] }) {
  const { url } = usePage();
  const groups = groupBusinessLocations(businesses);
  const back = publicOwnerBackUrl(new URLSearchParams(url.split('?')[1] ?? '').get('from'));
  return <><Head title={`Usaha ${owner.public_name}`} /><div className="consumer-collection-page"><Link className="collection-back" href={back}><ArrowLeft size={17} aria-hidden="true" />{back.startsWith('/usaha/') ? 'Kembali ke profil usaha' : 'Kembali jelajah'}</Link><header className="consumer-owner-heading"><span className="consumer-public-avatar" aria-hidden="true">{owner.public_name.charAt(0).toLocaleUpperCase('id-ID')}</span><div><p>Pemilik usaha</p><h1>{owner.public_name}</h1><strong>{groups.length} usaha · {businesses.length} lokasi jualan</strong><p>Temukan usaha dan lokasi jualan yang dikelolanya.</p></div></header><section aria-labelledby="public-owner-businesses-title"><h2 className="collection-section-title" id="public-owner-businesses-title">Usaha yang dikelola</h2>{groups.length ? <div className="business-location-grid">{groups.map(locations => <BusinessLocationsCard key={locations[0].id} locations={locations} />)}</div> : <div className="collection-empty"><Store size={34} aria-hidden="true" /><h3>Belum ada lokasi yang dapat ditampilkan</h3><p>Lokasi usaha yang tersedia di katalog akan muncul di sini.</p><Link className="button" href="/jelajah">Lanjut menjelajah</Link></div>}</section></div></>;
}
OwnerProfile.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
