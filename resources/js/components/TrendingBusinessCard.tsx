import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Star } from 'lucide-react';
import { distanceLabel, matchedMenu, rupiah, type BusinessCardData, type SharedProps } from '@/types/catalog';
import { businessCover } from '@/types/business-images';

interface TrendingCardProps {
  business: BusinessCardData;
  isHighlighted?: boolean;
}

export default function TrendingBusinessCard({
  business,
  isHighlighted = false,
}: TrendingCardProps) {
  const { url } = usePage<SharedProps>();
  const detailUrl = `/usaha/${business.slug}?${new URLSearchParams({
    post: String(business.post.id),
    from: url,
  })}`;

  const menu = matchedMenu(business);
  const price = menu ? menu.price : business.min_price;

  return (
    <article
      className={`trending-order-card ${isHighlighted ? 'is-highlighted' : ''}`}
      aria-label={`${business.name}, ${business.post.name}`}
    >
      {/* Left Column: Information */}
      <div className="trending-card-info">
        {business.business_category && <div className="trending-card-kicker">{business.business_category}</div>}

        {/* Title */}
        <h3 className="trending-card-title">
          <Link href={detailUrl}>{business.name}</Link>
        </h3>

        {/* Sub-info: Menu or Kind + Rating, Pos name + Distance */}
        <div className="trending-card-facts">
          <p className="trending-fact-primary">
            <span>{menu ? menu.name : business.kind}</span>
            {business.rating && business.rating.average !== null && (
              <span className="trending-rating-tag">
                <Star size={11} fill="currentColor" color="currentColor" aria-hidden="true" />
                <strong>{business.rating.average.toFixed(1)}</strong>
              </span>
            )}
          </p>
          <p className="trending-fact-secondary">
            <span>{business.post.name}</span>
            {business.distance !== null && (
              <span> &middot; {distanceLabel(business.distance)}</span>
            )}
          </p>
        </div>

        {/* Bottom Row: Price & Action */}
        <div className="trending-card-bottom">
          <div className="trending-card-price-box">
            <span className="trending-price-kicker">Mulai</span>
            <strong className="trending-card-price">{rupiah(price)}</strong>
          </div>

          <Link
            href={detailUrl}
            className="trending-card-cta"
            aria-label={`Buka menu ${business.name}, ${business.post.name}`}
          >
            <span>Menu</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Right Column: Rectangular Photo (Kotak Membulat) */}
      <div className="trending-card-photo-col">
        <Link href={detailUrl} tabIndex={-1} aria-hidden="true" className="trending-photo-wrap">
          <img
            src={businessCover(business)}
            alt={`Foto ${business.name}`}
            loading="lazy"
            width="220"
            height="200"
            className="trending-photo-img"
          />
          <span className={`trending-photo-status ${business.is_open ? 'is-open' : 'is-closed'}`}>
            {business.is_open ? 'Buka terjadwal' : 'Di luar jadwal'}
          </span>
        </Link>
      </div>
    </article>
  );
}
