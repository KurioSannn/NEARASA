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
  const price = menu ? menu.price : business.min_price;

  return (
    <article className={`business-card ref-card-a ${row ? 'card-row' : ''} ${soldOut ? 'card-sold-out' : ''}`}>
      {/* 1. Top Framed Hero Media (Refrensi 1 Style) */}
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

        {/* Floating Top-Left Status Badge */}
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

        {/* Translucent Banner Ribbon (like 'Free Delivery until...' in Ref 1) */}
        <div className="card-photo-ribbon">
          <span>{business.post.day_schedule?.label || postStatus(business.post)}</span>
        </div>
      </div>

      {/* 2. Bottom: Title, Price & Action (Refrensi B style: title left, price+action right) */}
      <div className="card-details-block">
        <div className="card-title-row">
          <h3 className="card-name">
            <Link href={detailUrl}>{business.name}</Link>
          </h3>
        </div>

        <p className="card-sub-info">
          <span className="card-post-name">{business.post.name}</span>
          {hasRating && (
            <span className="card-rating-inline">
              <Star size={11} fill="#d97706" color="#d97706" aria-hidden="true" />
              <strong>{business.rating?.average?.toFixed(1)}</strong>
            </span>
          )}
        </p>

        {/* 3. Bottom Row: Attribute Pills left, Price+Action right (like Ref B) */}
        <div className="card-bottom-row">
          <div className="card-attribute-tags" role="group" aria-label="Karakteristik kuliner">
            {menu && (
              <span className="card-attr-pill highlighted" title={menu.name}>
                {menu.name}
                {menuSoldOut(menu, business.post.id) && ' (Habis)'}
              </span>
            )}
            {business.kind && (
              <span className="card-attr-pill">
                {business.kind}
              </span>
            )}
            {business.distance !== null && (
              <span className="card-attr-pill">
                {distanceLabel(business.distance)}
              </span>
            )}
          </div>

          <div className="card-price-action">
            <span className="card-bottom-price">{rupiah(price)}</span>
            <Link
              className="card-order-action"
              href={detailUrl}
              aria-label={`Buka menu ${business.name}, ${business.post.name}`}
            >
              <span>Menu</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
