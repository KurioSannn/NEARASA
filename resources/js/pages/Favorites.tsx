import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Heart, Info } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import BusinessLocationsCard from '@/components/BusinessLocationsCard';
import { groupBusinessLocations } from '@/types/consumer-pages';
import type { BusinessCardData } from '@/types/catalog';

export default function Favorites({ businesses, savedCount, unavailableCount = 0 }: { businesses: BusinessCardData[]; savedCount?: number; unavailableCount?: number }) {
  const groups = groupBusinessLocations(businesses);
  const total = savedCount ?? groups.length;
  return <><Head title="Favorit" /><div className="consumer-collection-page"><Link className="collection-back" href="/akun"><ArrowLeft size={17} aria-hidden="true" />Kembali ke akun</Link><header className="collection-page-heading"><h1>Favorit</h1><p>{total} usaha tersimpan. Pilih lokasi jualan untuk melihat menunya.</p></header>
    {unavailableCount > 0 && <p className="collection-notice"><Info size={17} aria-hidden="true" />{unavailableCount} usaha tersimpan belum dapat ditampilkan di katalog saat ini.</p>}
    {groups.length ? <section aria-labelledby="saved-businesses-title"><h2 className="profile-sr-only" id="saved-businesses-title">Usaha tersimpan</h2><div className="business-location-grid">{groups.map(locations => <BusinessLocationsCard key={locations[0].id} locations={locations} />)}</div></section> : <section className="collection-empty"><Heart size={34} aria-hidden="true" /><h2>{total ? 'Belum ada favorit yang bisa ditampilkan' : 'Belum ada usaha tersimpan'}</h2><p>{total ? 'Usaha tersimpanmu belum tersedia di katalog. Kamu tetap bisa menemukan pilihan lain.' : 'Ketuk hati pada usaha yang menarik. Temukan lagi pilihanmu di sini.'}</p><Link className="button" href="/jelajah">Jelajah makanan</Link></section>}
  </div></>;
}
Favorites.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
