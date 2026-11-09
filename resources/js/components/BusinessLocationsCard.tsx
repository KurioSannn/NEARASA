import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import { FavoriteControl } from './DiscoveryResultCard';
import ConsumerPhoto from './ConsumerPhoto';
import { businessKindLabel, postDayHours } from './business-profile/profile-utils';
import { businessCover } from '@/types/business-images';
import { allMenusSoldOut, distanceLabel, rupiah, type BusinessCardData } from '@/types/catalog';
import { businessDetailUrl, menuPriceRange } from '@/types/consumer-pages';

export default function BusinessLocationsCard({ locations }: { locations: BusinessCardData[] }) {
  const { url } = usePage();
  const business = locations[0];
  const range = menuPriceRange(business.menus);

  return (
    <article className="business-locations-card">
      <div className="business-locations-cover">
        <ConsumerPhoto src={businessCover(business)} />
        <FavoriteControl business={business} />
        <span className="business-locations-badge">
          {business.business_category || businessKindLabel(business.kind)}
        </span>
      </div>

      <div className="business-locations-body">
        <div className="business-locations-header-row">
          <h3>
            <Link href={businessDetailUrl(business, url)}>{business.name}</Link>
          </h3>
          <span className="business-locations-count">
            {locations.length} {locations.length > 1 ? 'lokasi' : 'pos'}
          </span>
        </div>

        <div className="business-locations-price">
          <div>
            <span className="price-label">{range?.label ?? 'Patokan harga'}</span>
            <strong className="price-value">
              {range
                ? `${rupiah(range.min)}${range.min !== range.max ? ` – ${rupiah(range.max)}` : ''}`
                : 'Menu bervariasi'}
            </strong>
          </div>
          <Link href={businessDetailUrl(business, url)} className="business-view-link">
            <span>Buka Usaha</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="business-locations-branches">
          <span className="branches-title">Cabang & Pos Jualan:</span>
          <ul className="business-location-rows">
            {locations.map(location => (
              <li key={location.post.id}>
                <Link
                  href={businessDetailUrl(location, url)}
                  className="location-row-link"
                  aria-label={`Kunjungi ${business.name}, ${location.post.name}`}
                >
                  <div className="location-row-main">
                    <div className="location-row-name-bar">
                      <strong className="location-row-name">{location.post.name}</strong>
                      <span className={`location-pill ${location.is_open ? 'is-open' : 'is-closed'}`}>
                        {location.is_open ? 'BUKA' : 'TUTUP'}
                      </span>
                    </div>

                    <div className="location-row-meta">
                      <span className="meta-hours">
                        <Clock3 size={12} aria-hidden="true" />
                        <span>{postDayHours(location.post) ?? 'Jadwal hari ini'}</span>
                      </span>
                      <span className="meta-address">
                        <MapPin size={12} aria-hidden="true" />
                        <span>
                          {location.post.address}
                          {location.distance !== null && ` · ${distanceLabel(location.distance)}`}
                        </span>
                      </span>
                    </div>

                    {allMenusSoldOut(location) && (
                      <span className="location-sold-note">Menu habis di pos ini</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
