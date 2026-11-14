import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import type { Map as LeafletMap } from 'leaflet';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import { type BusinessCardData, type Location } from '@/types/catalog';
import { addBusinessMarkers } from '@/components/maps/marker-layers';
import { watchTiles, type TileStatus } from '@/components/maps/tile-status';
import 'leaflet/dist/leaflet.css';

interface HomeMapPreviewProps {
  businesses: BusinessCardData[];
  location: Location | null;
  tileUrl: string;
}

export default function HomeMapPreview({ businesses, location, tileUrl }: HomeMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileStatus, setTileStatus] = useState<TileStatus>('loading');

  const validPins = useMemo(() => businesses.filter(
    b => Number.isFinite(b.post?.latitude) && Number.isFinite(b.post?.longitude)
  ), [businesses]);

  useEffect(() => {
    let disposed = false;
    let mapInstance: LeafletMap | null = null;
    let stopWatching: (() => void) | undefined;
    let frame = 0;
    setTileStatus('loading');

    import('leaflet')
      .then(L => {
        if (disposed || !containerRef.current) return;

        const defaultLat = location?.latitude ?? (validPins[0]?.post.latitude ?? -7.4478);
        const defaultLng = location?.longitude ?? (validPins[0]?.post.longitude ?? 112.7183);

        mapInstance = L.map(containerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 13,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          dragging: !matchMedia('(max-width: 767px)').matches,
          attributionControl: false,
        });
        const tiles = L.tileLayer(tileUrl, { maxZoom: 19 });
        stopWatching = watchTiles(tiles, status => {
          if (!disposed) setTileStatus(status);
        });
        tiles.addTo(mapInstance);

        const markerLayer = L.layerGroup().addTo(mapInstance);
        const previewPins = validPins.slice(0, 30);

        if (previewPins.length > 0) {
          addBusinessMarkers(L, markerLayer, previewPins, null, () => {
            router.visit('/peta');
          });

          const bounds = L.latLngBounds(
            previewPins.map(p => [p.post.latitude, p.post.longitude] as [number, number])
          );

          if (location) {
            bounds.extend([location.latitude, location.longitude]);
          }

          mapInstance.fitBounds(bounds, {
            padding: [28, 28],
            maxZoom: 14,
          });
        }

        if (location) {
          const userIcon = L.divIcon({
            className: 'home-map-user-beacon-wrapper',
            html: `
              <div class="home-map-user-beacon">
                <div class="user-beacon-dot"></div>
                <div class="user-beacon-pulse"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([location.latitude, location.longitude], {
            icon: userIcon,
            title: `Lokasimu: ${location.label}`,
            zIndexOffset: 3000,
          }).addTo(markerLayer);
        }

        frame = requestAnimationFrame(() => {
          if (!disposed) mapInstance?.invalidateSize();
        });
      })
      .catch(() => {
        if (!disposed) setTileStatus('error');
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stopWatching?.();
      mapInstance?.remove();
    };
  }, [tileUrl, location, validPins]);

  return (
    <div className="home-map-preview-wrap" data-map-status={tileStatus} aria-busy={tileStatus === 'loading'}>
      <div
        ref={containerRef}
        className="home-map-preview-canvas"
        role="region"
        aria-label="Peta interaktif kuliner terdekat"
        inert={tileStatus !== 'ready'}
      />

      {tileStatus === 'loading' && (
        <div className="home-map-preview-loading" aria-hidden="true">
          <Skeleton />
        </div>
      )}

      {tileStatus === 'error' && (
        <div className="home-map-preview-fallback" role="status">
          <MapPin size={28} aria-hidden="true" />
          <p>Peta belum bisa dimuat.</p>
          <Link href="/jelajah" className="button button-outline">Lihat daftar kuliner</Link>
        </div>
      )}

      <div className="home-map-preview-tag" aria-hidden="true">
        <span className="preview-tag-indicator" />
        <strong>{location ? location.label : 'Area Sidoarjo & Sekitarnya'}</strong>
        <span className="preview-tag-count">&middot; {Math.min(validPins.length, 8)} pos di peta</span>
      </div>

      <a className="home-map-preview-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        © OpenStreetMap contributors
      </a>
      <Link href="/peta" className="home-map-preview-cta" aria-label="Buka peta kuliner interaktif penuh">
        <span>Buka Peta Penuh</span>
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
