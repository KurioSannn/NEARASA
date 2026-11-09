import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { allMenusSoldOut, distanceLabel, matchedMenu, menuSoldOut, rupiah, type BusinessCardData, type SharedProps } from '@/types/catalog';
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
  const hasRating = Boolean(business.rating && business.rating.average !== null && business.rating.count > 0);
  const isTopRated = Boolean(business.rating && business.rating.average !== null && business.rating.average >= 4.5);

  return (
    <article className={`business-card ${row ? 'card-row' : ''} ${soldOut ? 'card-sold-out' : ''}`}>
      {/* Top Header: Title & Circular Action Button (Ruang Edit style) */}
      <div className="card-top">
        <div className="card-heading-wrap">
          <h3 className="card-name">
            <Link href={detailUrl}>{business.name}</Link>
          </h3>
          <p className="card-sub-info">
            <span className="card-post-name">{business.post.name}</span>
            {business.distance !== null ? (
              <span className="card-distance-dot">· {distanceLabel(business.distance)}</span>
            ) : business.kind ? (
              <span className="card-distance-dot">· {business.kind}</span>
            ) : null}
          </p>
        </div>

        <div className="card-top-actions">
          {!row && (
            <button
              type="button"
              className={`card-heart-btn ${saved ? 'is-saved' : ''}`}
              aria-pressed={saved}
              onClick={() => toggleFavorite(business.slug, business.id)}
              aria-label={`${saved ? 'Hapus' : 'Simpan'} ${business.name}${saved ? ' dari' : ' ke'} favorit`}
            >
              <Heart size={16} aria-hidden="true" />
            </button>
          )}
          <Link
            className="card-arrow-btn"
            href={detailUrl}
            aria-label={`Buka menu ${business.name}, ${business.post.name}`}
          >
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Middle: Inner Framed Image (Ruang Edit & Starbucks style) */}
      <div className="card-photo-wrap">
        <Link href={detailUrl} tabIndex={-1} aria-hidden="true" className="card-photo-link">
          <img
            className="card-photo"
            src={businessCover(business)}
            alt={`Foto tempat ${business.name}`}
            loading="lazy"
            width="600"
            height="400"
          />
        </Link>
        <div className="card-photo-badges">
          {soldOut ? (
            <span className="card-status-badge is-soldout">Habis</span>
          ) : isTopRated ? (
            <span className="card-status-badge is-popular">
              <Star size={11} fill="currentColor" aria-hidden="true" />
              Favorit
            </span>
          ) : business.is_open ? (
            <span className="card-status-badge is-open">Buka</span>
          ) : (
            <span className="card-status-badge is-closed">Tutup</span>
          )}
        </div>
      </div>

      {/* Bottom: Culinary Highlights & Bold Price (Starbucks style) */}
      <div className="card-bottom">
        <div className="card-culinary-info">
          {menu ? (
            <p className="card-menu-line">
              <span className="card-menu-kicker">Menu:</span>
              <strong className="card-menu-title">{menu.name}</strong>
              {menuSoldOut(menu, business.post.id) && <span className="card-menu-soldout"> (Habis)</span>}
            </p>
          ) : (
            <p className="card-menu-line">
              <span className="card-menu-title">Menu harian UMKM</span>
            </p>
          )}
          <div className="card-meta-details">
            <span className="card-schedule-tag">{business.post.day_schedule?.label || postStatus(business.post)}</span>
            {hasRating && (
              <span className="card-rating-tag">
                <Star size={11} fill="#d97706" color="#d97706" aria-hidden="true" />
                <strong>{business.rating?.average?.toFixed(1)}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="card-pricing">
          <span className="card-price-kicker">Mulai</span>
          <strong className="card-price-value">{rupiah(menu ? menu.price : business.min_price)}</strong>
        </div>
      </div>
    </article>
  );
}
