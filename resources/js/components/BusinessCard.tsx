import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react';
import { allMenusSoldOut, distanceLabel, matchedMenu, menuSoldOut, ratingLabel, rupiah, type BusinessCardData, type SharedProps } from '@/types/catalog';
import { postStatus } from '@/components/business-profile/profile-utils';
import { useUi } from '@/layouts/CustomerLayout';
import { businessCover } from '@/types/business-images';

export default function BusinessCard({ business, row = false }: { business: BusinessCardData; row?: boolean }) {
  const { toggleFavorite } = useUi();
  const { url, props } = usePage<SharedProps>();
  const saved = props.auth.favorites.includes(business.id);
  const detailUrl = `/usaha/${business.slug}?${new URLSearchParams({ post: String(business.post.id), from: url })}`;
  const menu = matchedMenu(business);
  const soldOut = allMenusSoldOut(business);
  return <article className={`business-card ${row ? 'card-row' : ''} ${soldOut ? 'card-sold-out' : ''}`}>
    <div className="card-photo-wrap"><Link href={detailUrl} tabIndex={-1} aria-hidden="true"><img className="card-photo" src={businessCover(business)} alt="" loading="lazy" width="600" height="420" /></Link>
      {!row && <button type="button" className={`favorite-button ${saved ? 'is-saved' : ''}`} aria-pressed={saved} onClick={() => toggleFavorite(business.slug, business.id)} aria-label={`${saved ? 'Hapus' : 'Simpan'} ${business.name}${saved ? ' dari' : ' ke'} favorit`}><Heart size={19} aria-hidden="true" /></button>}
      {business.distance !== null && <span className="distance-tag"><MapPin size={13} aria-hidden="true" />{distanceLabel(business.distance)}</span>}
    </div>
    <div className="card-body"><div className="card-name-row"><h3><Link href={detailUrl}>{business.name}</Link></h3>{row && <span className={`open-dot ${business.is_open ? 'open' : ''}`} aria-label={postStatus(business.post)} />}</div>
      <p className="card-post-name">{business.post.name}</p>
      <p className={`card-status ${business.is_open ? 'open' : ''}`}><span className="status-dot" aria-hidden="true" />{postStatus(business.post)}</p>
      <p className="card-rating"><Star size={12} aria-hidden="true" />{ratingLabel(business.rating)}</p>
      {soldOut && <p className="card-stock-label">Semua menu habis</p>}
      <div className="card-bottom"><span className={`card-price-pair ${menu && menuSoldOut(menu, business.post.id) ? 'is-sold-out' : ''}`}>
        {menu ? <><span className="card-matched-menu">{menu.name}{menuSoldOut(menu, business.post.id) && <span className="card-menu-habis"> · Habis</span>}</span><span className="price-tag">{rupiah(menu.price)}</span></> : <span className="card-matched-menu">Menu belum tersedia</span>}
      </span><Link className="card-arrow" href={detailUrl} aria-label={`Lihat ${business.name}, ${business.post.name}`}><ArrowUpRight size={23} aria-hidden="true" /></Link></div>
    </div>
  </article>;
}
