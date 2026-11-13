import { Link } from '@inertiajs/react';
import { ArrowUpRight, ChevronRight, Map, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import LocationMap from '@/components/LocationMap';
import { mapPostUrl, type Business, type SellingPost } from '@/types/catalog';
import { trackInteraction, whatsappUrl } from './profile-utils';

export function ProfileVisitActions({ business, post }: { business: Business; post?: SellingPost }) {
  const whatsapp = whatsappUrl(business.whatsapp);
  if (!post && !whatsapp) return null;
  return (
    <div className="profile-visit-actions">
      {post && (
        <Link
          className="button profile-action-map-btn"
          href={mapPostUrl(business.slug, post.id)}
          onClick={() => trackInteraction(business.id, post.id, 'map_click')}
        >
          <Map size={17} aria-hidden="true" />
          <span>Buka di peta</span>
        </Link>
      )}
      {whatsapp && (
        <a
          className="button button-outline profile-action-wa-btn"
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (post) trackInteraction(business.id, post.id, 'whatsapp_click');
          }}
        >
          <MessageCircle size={17} aria-hidden="true" />
          <span>WhatsApp</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function useWideContext() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const query = matchMedia('(min-width: 1024px)');
    const update = () => setWide(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);
  return wide;
}

export default function ProfileVisitCard({
  post,
  mapTiles,
  onLocation,
}: {
  post?: SellingPost;
  mapTiles: string;
  onLocation: () => void;
}) {
  const wide = useWideContext();
  if (!post) return null;
  return (
    <aside className="visit-card" aria-label="Informasi pos jualan">
      <div className="profile-context-heading">
        <span className="profile-context-icon">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <div className="profile-context-titles">
          <h3>{post.name}</h3>
          <p>{post.address}</p>
        </div>
      </div>
      {post.landmark && (
        <p className="profile-visit-landmark">
          <Navigation size={15} aria-hidden="true" />
          <span className="profile-preserve-lines">{post.landmark}</span>
        </p>
      )}
      {wide && (
        <div className="profile-context-map">
          <LocationMap latitude={post.latitude} longitude={post.longitude} tileUrl={mapTiles} />
        </div>
      )}
      <button type="button" className="profile-context-link" onClick={onLocation}>
        <span>Lihat lokasi & jadwal lengkap</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}
