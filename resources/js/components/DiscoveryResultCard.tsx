import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Clock3, Heart, MapPin, Star } from 'lucide-react';
import { useUi } from '@/layouts/CustomerLayout';
import { postStatus } from '@/components/business-profile/profile-utils';
import { businessCover } from '@/types/business-images';
import { allMenusSoldOut, distanceLabel, matchedMenu, menuSoldOut, rupiah, type BusinessCardData, type SharedProps } from '@/types/catalog';

export function FavoriteControl({ business }: { business: BusinessCardData }) {
  const { props } = usePage<SharedProps>();
  const { toggleFavorite } = useUi();
  const saved = props.auth.favorites.includes(business.id);
  return <button type="button" className={'discovery-favorite' + (saved ? ' is-saved' : '')} aria-pressed={saved}
    aria-label={(saved ? 'Hapus ' : 'Simpan ') + business.name + (saved ? ' dari favorit' : ' ke favorit')}
    onClick={(e) => {
      e.stopPropagation();
      toggleFavorite(business.slug, business.id);
    }}
  >
    <Heart size={16} aria-hidden="true" />
  </button>;
}

export function PostFacts({ business, address = false, distance = true }: { business: BusinessCardData; address?: boolean; distance?: boolean }) {
  const hours = business.post.today_hours;
  const routine = business.post.day_schedule?.label;
  return <div className="discovery-facts">
    <p className={'discovery-status' + (business.is_open ? ' is-open' : '')}><span aria-hidden="true" />{postStatus(business.post)}</p>
    {hours && <p><Clock3 size={15} aria-hidden="true" /><span>{hours.opens_at.slice(0, 5).replace(':', '.')}–{hours.closes_at.slice(0, 5).replace(':', '.')} WIB{hours.closes_tomorrow ? ' (+1 hari)' : ''}</span></p>}
    {!hours && routine && <p><Clock3 size={15} aria-hidden="true" /><span>{routine.replaceAll(':', '.')}{/\d/.test(routine) ? ' WIB' : ''}</span></p>}
    {address && <p><MapPin size={15} aria-hidden="true" /><span>{business.post.address}</span></p>}
    {distance && business.distance !== null && <p><MapPin size={15} aria-hidden="true" /><span>{distanceLabel(business.distance)} dari titik pilihan</span></p>}
  </div>;
}

export function PostRating({ business }: { business: BusinessCardData }) {
  const rating = business.rating;
  const hasRating = Boolean(rating?.count && rating.average !== null);
  return <p className={'discovery-rating' + (hasRating ? ' has-rating' : '')}><Star size={16} aria-hidden="true" />
    {hasRating && rating ? <><strong>{rating.average!.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</strong><span>({rating.count} ulasan)</span></> : <span>Belum ada ulasan</span>}
  </p>;
}

export function MenuMatch({ business }: { business: BusinessCardData }) {
  const menu = matchedMenu(business);
  const soldOut = allMenusSoldOut(business);
  return <div className={'discovery-menu-match' + (soldOut ? ' is-sold-out' : '')}>
    <small>{soldOut ? 'Semua menu habis' : 'Menu yang sesuai'}</small>
    {menu ? <><span>{menu.name}{menuSoldOut(menu, business.post.id) && ' · Habis'}</span><strong>{rupiah(menu.price)}</strong></> : <span>Menu belum tersedia</span>}
  </div>;
}

export default function DiscoveryResultCard({ business, noOrigin = false }: { business: BusinessCardData; noOrigin?: boolean }) {
  const { url } = usePage();
  const detail = '/usaha/' + business.slug + '?' + new URLSearchParams({ post: String(business.post.id), from: url });
  return <article className={'discovery-result-card' + (allMenusSoldOut(business) ? ' all-sold-out' : '')}>
    <Link className="discovery-result-photo" href={detail} tabIndex={-1} aria-hidden="true">
      <img src={businessCover(business)} width="600" height="420" alt={`Foto tempat ${business.name}`} loading="lazy" />
    </Link>
    <div className="discovery-result-content">
      <div className="discovery-result-identity">
        <div className="discovery-result-title-row">
          <h2><Link href={detail}>{business.name}</Link></h2>
          <PostRating business={business} />
        </div>
        <p className="discovery-post-name">{business.post.name}</p>
        <PostFacts business={business} address={noOrigin} />
      </div>
      <div className="discovery-result-menu">
        <MenuMatch business={business} />
      </div>
    </div>
    <div className="discovery-result-actions">
      <FavoriteControl business={business} />
    </div>
  </article>;
}
