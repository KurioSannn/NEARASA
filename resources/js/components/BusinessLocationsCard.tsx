import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Clock3, MapPin } from 'lucide-react';
import { FavoriteControl } from './DiscoveryResultCard';
import ConsumerPhoto from './ConsumerPhoto';
import { businessKindLabel, postDayHours, postStatus } from './business-profile/profile-utils';
import { businessCover } from '@/types/business-images';
import { allMenusSoldOut, distanceLabel, rupiah, type BusinessCardData } from '@/types/catalog';
import { businessDetailUrl, menuPriceRange } from '@/types/consumer-pages';

export default function BusinessLocationsCard({ locations }: { locations: BusinessCardData[] }) {
  const { url } = usePage();
  const business = locations[0];
  const range = menuPriceRange(business.menus);
  return <article className="business-locations-card"><div className="business-locations-cover"><ConsumerPhoto src={businessCover(business)} /><FavoriteControl business={business} /></div><div className="business-locations-body"><h3><Link href={businessDetailUrl(business, url)}>{business.name}</Link></h3><p className="business-locations-kind">{business.business_category || businessKindLabel(business.kind)}</p><div className="business-locations-price"><div><span>{range?.label ?? 'Daftar menu'}</span><strong>{range ? `${rupiah(range.min)}${range.min !== range.max ? `–${rupiah(range.max)}` : ''}` : 'Belum tersedia'}</strong></div><span className="business-locations-count">{locations.length} lokasi jualan</span></div>
    <ul className="business-location-rows">{locations.map(location => <li key={location.post.id}><Link href={businessDetailUrl(location, url)} aria-label={`Lihat ${business.name}, ${location.post.name}`}><MapPin size={20} aria-hidden="true" /><div><strong>{location.post.name}</strong><span><Clock3 size={13} aria-hidden="true" />{postDayHours(location.post) ?? 'Jam belum ditambahkan'}</span><small>{location.post.address}{location.distance !== null && ` · ${distanceLabel(location.distance)}`}</small><span className={`location-row-status${location.is_open ? ' is-open' : ''}`}><i aria-hidden="true" />{postStatus(location.post)}{allMenusSoldOut(location) && ' · Menu habis'}</span></div><ChevronRight size={18} aria-hidden="true" /></Link></li>)}</ul>
  </div></article>;
}
