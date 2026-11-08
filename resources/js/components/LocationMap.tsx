import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { MapPin } from 'lucide-react';
import Skeleton from './Skeleton';
import { watchTiles, type TileStatus } from './maps/tile-status';
import 'leaflet/dist/leaflet.css';

export default function LocationMap({ latitude, longitude, tileUrl, onSelect }: { latitude: number; longitude: number; tileUrl: string; onSelect?: (latitude: number, longitude: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const selectRef = useRef(onSelect);
  const pointRef = useRef({ latitude, longitude });
  const [status, setStatus] = useState<TileStatus>('loading');
  const [hasTiles, setHasTiles] = useState(false);
  selectRef.current = onSelect;
  pointRef.current = { latitude, longitude };
  useEffect(() => {
    let disposed = false;
    let unwatch: (() => void) | undefined;
    let frame = 0;
    setStatus('loading');
    setHasTiles(false);
    import('leaflet').then(L => {
      if (disposed || !container.current) return;
      const point = pointRef.current;
      const map = L.map(container.current, { scrollWheelZoom: false }).setView([point.latitude, point.longitude], 15);
      mapRef.current = map;
      const tiles = L.tileLayer(tileUrl, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
      unwatch = watchTiles(tiles, (next, progress) => { if (!disposed) { setStatus(next); if (progress.loaded) setHasTiles(true); } });
      tiles.addTo(map);
      const icon = L.divIcon({ className: 'map-pin-icon', html: '<span></span>', iconSize: [28, 36], iconAnchor: [14, 36] });
      const marker = L.marker([point.latitude, point.longitude], { icon, draggable: Boolean(selectRef.current), title: 'Titik pilihan', keyboard: true }).addTo(map);
      markerRef.current = marker;
      const update = (lat: number, lng: number) => { marker.setLatLng([lat, lng]); selectRef.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6))); };
      map.on('click', event => { if (selectRef.current) update(event.latlng.lat, event.latlng.lng); });
      marker.on('dragend', () => { const point = marker.getLatLng(); update(point.lat, point.lng); });
      frame = requestAnimationFrame(() => { if (!disposed) map.invalidateSize(); });
    }).catch(() => { if (!disposed) setStatus('error'); });
    return () => { disposed = true; cancelAnimationFrame(frame); unwatch?.(); mapRef.current?.remove(); mapRef.current = null; markerRef.current = null; };
  }, [tileUrl]);
  useEffect(() => { markerRef.current?.setLatLng([latitude, longitude]); mapRef.current?.setView([latitude, longitude]); }, [latitude, longitude]);
  const covered = !hasTiles && status !== 'ready';
  return <div className={'map-wrap' + (covered ? ' location-map-covered' : '')} data-map-status={status}>
    <div className="location-map" ref={container} role="region" aria-label="Peta lokasi" aria-busy={status === 'loading'} inert={covered} />
    {status === 'loading' && !hasTiles && <Skeleton />}
    {status === 'loading' && <span className="consumer-sr-only" role="status">Memuat peta lokasi.</span>}
    {status === 'error' && <p className="map-message" role="status"><MapPin size={17} aria-hidden="true" />{hasTiles ? 'Sebagian peta belum termuat. ' : 'Peta belum bisa dimuat. '}{onSelect ? 'Kamu tetap bisa memilih area atau mengisi koordinat manual.' : 'Alamat dan jadwal tetap tersedia.'}</p>}
    {covered && <span className="map-fallback-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></span>}
  </div>;
}
