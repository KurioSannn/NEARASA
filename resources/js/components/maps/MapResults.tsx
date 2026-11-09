import { Link } from '@inertiajs/react';
import { ArrowUpRight, ChevronDown, Clock3, MapPin, Star, X } from 'lucide-react';
import { useState } from 'react';
import { FavoriteControl } from '@/components/DiscoveryResultCard';
import {
  allMenusSoldOut,
  catalogUrl,
  defaultFilters,
  distanceLabel,
  matchedMenu,
  rupiah,
  type BusinessCardData,
  type Filters,
} from '@/types/catalog';
import EmptyCatalog from '@/components/EmptyCatalog';
import { businessCover } from '@/types/business-images';
import { postStatus } from '@/components/business-profile/profile-utils';

type ResultsProps = {
  pins: BusinessCardData[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onLocation: () => void;
  filters?: Filters;
  onFilter?: () => void;
};

function formatHours(business: BusinessCardData): string {
  const hours = business.post.today_hours;
  const routine = business.post.day_schedule?.label;
  if (hours) {
    return `${hours.opens_at.slice(0, 5).replace(':', '.')}–${hours.closes_at.slice(0, 5).replace(':', '.')} WIB${hours.closes_tomorrow ? ' (+1 hr)' : ''}`;
  }
  if (routine) {
    return `${routine.replaceAll(':', '.')}${/\d/.test(routine) ? ' WIB' : ''}`;
  }
  return postStatus(business.post);
}

export function MapResults({
  pins,
  selectedId,
  onSelect,
  filters = defaultFilters,
  onFilter,
}: ResultsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={'map-results' + (expanded ? ' results-expanded' : '')}
      aria-labelledby="map-results-title"
    >
      <header className="map-results-heading">
        <div>
          <h2 id="map-results-title">Lokasi pilihan</h2>
          <p aria-live="polite">
            {pins.length} tempat kuliner · {new Set(pins.map(pin => pin.id)).size} usaha
          </p>
        </div>
        <button
          type="button"
          className="map-results-toggle"
          aria-controls="map-result-content"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Tutup daftar peta' : 'Buka daftar peta'}
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </header>

      <div id="map-result-content" className="map-result-content">
        {pins.length ? (
          <ul className="map-result-list">
            {pins.map(pin => {
              const isSelected = selectedId === pin.post.id;
              const soldOut = allMenusSoldOut(pin);
              const menu = matchedMenu(pin);
              const hasRating = Boolean(pin.rating && pin.rating.average !== null && pin.rating.count > 0);
              const price = menu ? menu.price : pin.min_price;

              return (
                <li
                  key={pin.post.id}
                  className={'map-result-item' + (isSelected ? ' selected-result-row' : '')}
                >
                  <button
                    type="button"
                    id={'nearasa-map-result-' + pin.post.id}
                    className={
                      'map-result-select' +
                      (isSelected ? ' is-selected' : '') +
                      (soldOut ? ' map-result-sold-out' : '')
                    }
                    aria-pressed={isSelected}
                    aria-controls={isSelected ? 'selected-map-business' : undefined}
                    aria-label={'Ringkasan ' + pin.name + ', ' + pin.post.name}
                    onClick={() => onSelect(pin.post.id)}
                  >
                    {/* Left: Framed Photo with Status Overlay */}
                    <div className="map-result-photo">
                      <img
                        src={businessCover(pin)}
                        alt={`Foto tempat ${pin.name}`}
                        loading="lazy"
                        width="100"
                        height="100"
                      />
                      <span className={'photo-status-badge' + (pin.is_open ? ' is-open' : ' is-closed')}>
                        {pin.is_open ? 'Buka' : 'Tutup'}
                      </span>
                    </div>

                    {/* Right: Clean Structured Details */}
                    <div className="map-result-copy">
                      {/* Top Row: Business Name */}
                      <div className="map-result-title-row">
                        <strong className="map-result-title">{pin.name}</strong>
                      </div>

                      {/* Sub-info: Post name & Distance with guaranteed whitespace */}
                      <p className="map-result-sub-info">
                        <span>{pin.post.name}</span>
                        {pin.distance !== null && <span> &middot; {distanceLabel(pin.distance)}</span>}
                      </p>

                      {/* Operational Facts & Rating */}
                      <div className="map-result-meta-row">
                        <span className="map-result-time">
                          <Clock3 size={11} aria-hidden="true" />
                          <span>{formatHours(pin)}</span>
                        </span>
                        {hasRating && (
                          <span className="map-result-rating-tag">
                            <Star size={11} fill="#d97706" color="#d97706" aria-hidden="true" />
                            <strong>{pin.rating?.average?.toFixed(1)}</strong>
                          </span>
                        )}
                      </div>

                      {/* Bottom: Matched Menu on Left, Confident Bold Price on Right */}
                      <div className="map-result-bottom-row">
                        <span className="map-result-menu-title" title={menu ? menu.name : undefined}>
                          <span className="menu-kicker">Menu:</span> {menu ? menu.name : 'Pilihan harian'}
                        </span>
                        <div className="map-result-price-box">
                          <span className="price-kicker">Mulai</span>
                          <strong className="price-val">{rupiah(price)}</strong>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Favorite Heart Button Sibling (No nested button) */}
                  <div className="map-result-fav-slot">
                    <FavoriteControl business={pin} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyCatalog filters={filters} base="/peta" compact onFilter={onFilter} />
        )}
      </div>
    </section>
  );
}

export function MapSelection({
  pin,
  filters,
  onClose,
  outsideSearch = false,
}: {
  pin: BusinessCardData;
  filters: Filters;
  onClose: () => void;
  outsideSearch?: boolean;
}) {
  const originParams = new URLSearchParams(catalogUrl(filters, '/peta').split('?')[1]);
  originParams.set('business', pin.slug);
  originParams.set('post', String(pin.post.id));
  const origin = '/peta?' + originParams;
  const detail = '/usaha/' + pin.slug + '?' + new URLSearchParams({ post: String(pin.post.id), from: origin });
  const menu = matchedMenu(pin);
  const soldOut = allMenusSoldOut(pin);
  const hasRating = Boolean(pin.rating && pin.rating.average !== null && pin.rating.count > 0);
  const price = menu ? menu.price : pin.min_price;

  return (
    <section
      id="selected-map-business"
      tabIndex={-1}
      className={'map-selected' + (soldOut ? ' map-selected-sold-out' : '')}
      aria-label={'Ringkasan usaha terpilih ' + pin.name}
      key={pin.post.id}
    >
      {/* Left: Square Thumbnail Frame with Favorite Heart */}
      <div className="map-selected-thumb-frame">
        <img
          src={businessCover(pin)}
          alt={`Foto tempat ${pin.name}`}
          className="map-selected-thumb-img"
          width="108"
          height="108"
        />
        <div className="map-selected-fav-wrapper">
          <FavoriteControl business={pin} />
        </div>
      </div>

      {/* Right: Content Column */}
      <div className="map-selected-info-col">
        {outsideSearch && (
          <p className="map-destination-note">Titik dari profil usaha &middot; di luar hasil filter</p>
        )}

        {/* Header: Title on Left, Close (X) on Right */}
        <div className="map-selected-head">
          <div className="map-selected-title-group">
            <h2 className="map-selected-name">{pin.name}</h2>
            <p className="map-selected-branch">
              <span>{pin.post.name}</span>
              {pin.distance !== null && <span> &middot; {distanceLabel(pin.distance)}</span>}
            </p>
          </div>

          <button
            className="map-selected-dismiss-btn"
            type="button"
            aria-label="Tutup ringkasan usaha"
            onClick={onClose}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Meta: Status, Hours & Rating */}
        <div className="map-selected-meta-row">
          <span
            className={'map-status-dot' + (soldOut ? ' is-soldout' : pin.is_open ? ' is-open' : ' is-closed')}
            aria-hidden="true"
          />
          <span className="status-label">
            {soldOut ? 'Habis' : pin.is_open ? 'Buka' : 'Tutup'}
          </span>
          <span className="meta-sep">&middot;</span>
          <Clock3 size={11} className="meta-icon" aria-hidden="true" />
          <span>{formatHours(pin)}</span>
          {hasRating && (
            <>
              <span className="meta-sep">&middot;</span>
              <Star size={11} fill="#d97706" color="#d97706" aria-hidden="true" />
              <strong>{pin.rating?.average?.toFixed(1)}</strong>
            </>
          )}
        </div>

        {/* Menu Line */}
        {menu && (
          <p className="map-selected-dish">
            <span className="dish-kicker">Menu:</span>{' '}
            <strong className="dish-title">{menu.name}</strong>
          </p>
        )}

        {/* Foot: Price & CTA Button */}
        <div className="map-selected-foot">
          <div className="map-selected-price-box">
            <span className="price-kicker">MULAI</span>
            <strong className="price-num">{rupiah(price)}</strong>
          </div>

          <Link className="map-selected-cta-btn" href={detail}>
            <span>Lihat Menu</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
