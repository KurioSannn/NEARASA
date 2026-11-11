import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import type { Map as LeafletMap } from 'leaflet';
import { ArrowUpRight, Compass, MapPin } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import { type BusinessCardData, type Location } from '@/types/catalog';
import { addBusinessMarkers } from '@/components/maps/marker-layers';
import 'leaflet/dist/leaflet.css';

interface HomeMapPreviewProps {
  businesses: BusinessCardData[];
  location: Location | null;
  tileUrl: string;
}

export default function HomeMapPreview({ businesses, location, tileUrl }: HomeMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const validPins = businesses.filter(
    b => b.post && typeof b.post.latitude === 'number' && typeof b.post.longitude === 'number'
  );

  useEffect(() => {
    let disposed = false;
    let mapInstance: LeafletMap | null = null;

    import('leaflet')
      .then(L => {
        if (disposed || !containerRef.current) return;

        // Determine initial center
        const defaultLat = location?.latitude ?? (validPins[0]?.post.latitude ?? -7.4478);
        const defaultLng = location?.longitude ?? (validPins[0]?.post.longitude ?? 112.7183);

        mapInstance = L.map(containerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 13,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          dragging: !matchMedia('(max-width: 767px)').matches, // allow light panning on desktop
          attributionControl: false,
        });
        mapRef.current = mapInstance;

        // Add tile layer
        const tiles = L.tileLayer(tileUrl, {
          maxZoom: 19,
        }).addTo(mapInstance);

        tiles.on('load', () => {
          if (!disposed) setLoaded(true);
        });

        tiles.on('tileerror', () => {
          if (!disposed && !loaded) {
            // Still mark as loaded so partial tiles show
            setLoaded(true);
          }
        });

        // Add markers layer
        const markerLayer = L.layerGroup().addTo(mapInstance);
        const previewPins = validPins.slice(0, 8);

        if (previewPins.length > 0) {
          addBusinessMarkers(L, mapInstance, markerLayer, previewPins, null, () => {
            router.visit('/peta');
          });

          // Fit bounds to embrace all pins with comfortable padding
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

        // Add user location beacon if available
        if (location) {
          const userIcon = L.divIcon({
            className: 'home-map-user-beacon-wrapper',
            html: `
              <div class="home-map-user-beacon" title="Titik Lokasimu: ${location.label}">
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

        // Invalidate size once DOM settles
        requestAnimationFrame(() => {
          if (!disposed && mapInstance) {
            mapInstance.invalidateSize();
            setLoaded(true);
          }
        });
      })
      .catch(() => {
        if (!disposed) setLoadError(true);
      });

    return () => {
      disposed = true;
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, [tileUrl, location?.latitude, location?.longitude, businesses.length]);

  return (
    <div className="home-map-preview-wrap">
      {/* Real Interactive Leaflet Canvas */}
      <div
        ref={containerRef}
        className="home-map-preview-canvas"
        role="region"
        aria-label="Peta interaktif kuliner terdekat"
        onClick={() => router.visit('/peta')}
      />

      {/* Loading Skeleton */}
      {!loaded && !loadError && (
        <div className="home-map-preview-loading" aria-hidden="true">
          <Skeleton />
          <div className="home-map-preview-loading-copy">
            <Compass className="animate-spin" size={20} />
            <span>Memuat peta kuliner riil...</span>
          </div>
        </div>
      )}

      {/* Fallback if map tiles fails to load */}
      {loadError && (
        <div className="home-map-preview-fallback">
          <MapPin size={28} />
          <p>Peta interaktif siap dijelajahi.</p>
          <Link href="/peta" className="button button-outline">
            Buka di Peta Penuh
          </Link>
        </div>
      )}

      {/* Floating Header Tag: Real Location & Count */}
      <div className="home-map-preview-tag" aria-hidden="true">
        <span className="preview-tag-indicator" />
        <strong>{location ? location.label : 'Area Sidoarjo & Sekitarnya'}</strong>
        <span className="preview-tag-count">&middot; {validPins.length} kuliner aktif</span>
      </div>

      {/* Floating Bottom Action CTA */}
      <Link href="/peta" className="home-map-preview-cta" aria-label="Buka peta kuliner interaktif penuh">
        <span>Buka Peta Penuh</span>
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
