import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap, TileLayer } from 'leaflet';
import { Check, Expand, LocateFixed, MapPin, MapPinOff, RefreshCw } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import { type BusinessCardData, type Location } from '@/types/catalog';
import { watchTiles, type TileStatus } from './tile-status';
import { addBusinessMarkers } from './marker-layers';
import 'leaflet/dist/leaflet.css';

type Props = { pins: BusinessCardData[]; location: Location | null; radius: number | 'unlimited'; tileUrl: string; selectedId: number | null; onSelect: (id: number) => void; listHref?: string };

export default function DiscoveryMap({ pins, location, radius, tileUrl, selectedId, onSelect, listHref = '/jelajah' }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const layers = useRef<LayerGroup | null>(null);
  const tiles = useRef<TileLayer | null>(null);
  const selection = useRef({ selectedId, onSelect });
  selection.current = { selectedId, onSelect };
  const retried = useRef(false);
  const retryBusy = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [tileStatus, setTileStatus] = useState<TileStatus>('loading');
  const [failed, setFailed] = useState(false);
  const [hasTiles, setHasTiles] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [importVersion, setImportVersion] = useState(0);
  const [fitVersion, setFitVersion] = useState(0);

  useEffect(() => {
    let disposed = false;
    let unwatch: (() => void) | undefined;
    let frame = 0;
    setReady(false); setFailed(false); setHasTiles(false); setTileStatus('loading');
    const notify = (status: TileStatus, progress: { loaded: number }) => {
      if (disposed) return;
      setTileStatus(status);
      if (progress.loaded) setHasTiles(true);
      if (status !== 'loading') retryBusy.current = false;
      if (status === 'ready' && retried.current) {
        retried.current = false;
        setRecovered(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setRecovered(false), 3000);
      }
    };
    import('leaflet').then(L => {
      if (disposed || !container.current) return;
      leaflet.current = L;
      const instance = L.map(container.current, { zoomControl: false, scrollWheelZoom: false, zoomAnimation: !matchMedia('(prefers-reduced-motion: reduce)').matches }).setView([-7.365, 112.72], 12);
      map.current = instance;
      L.control.zoom({ position: 'bottomright', zoomInTitle: 'Perbesar peta', zoomOutTitle: 'Perkecil peta' }).addTo(instance);
      const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
      tiles.current = tileLayer;
      unwatch = watchTiles(tileLayer, notify);
      tileLayer.addTo(instance);
      layers.current = L.layerGroup().addTo(instance);
      const invalidate = () => { if (!disposed && map.current) map.current.invalidateSize(); };
      frame = requestAnimationFrame(invalidate);
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 350);
      setReady(true);
    }).catch(() => { if (!disposed) { retryBusy.current = false; setFailed(true); setTileStatus('error'); } });
    return () => {
      disposed = true; cancelAnimationFrame(frame); unwatch?.(); clearTimeout(toastTimer.current);
      map.current?.remove(); map.current = null; layers.current = null; tiles.current = null;
    };
  }, [tileUrl, importVersion]);

  useEffect(() => {
    if (!ready || !container.current || !map.current) return;
    const instance = map.current;
    const ro = new ResizeObserver(() => {
      instance.invalidateSize();
    });
    ro.observe(container.current);
    return () => ro.disconnect();
  }, [ready]);

  useEffect(() => {
    const L = leaflet.current, instance = map.current;
    if (!ready || !L || !instance) return;
    const bounds = L.latLngBounds([]);
    pins.forEach(pin => bounds.extend([pin.post.latitude, pin.post.longitude]));
    if (location) {
      bounds.extend([location.latitude, location.longitude]);
    }
    if (pins.length === 0 && location && radius !== 'unlimited') {
      bounds.extend(L.latLng(location.latitude, location.longitude).toBounds(radius * 1000));
    }
    if (bounds.isValid()) {
      instance.fitBounds(bounds, { padding: [54, 54], maxZoom: 15, animate: false });
    } else {
      instance.setView([-7.365, 112.72], 12);
    }
  }, [ready, pins, location, radius, fitVersion]);

  useEffect(() => {
    const L = leaflet.current, instance = map.current, group = layers.current;
    if (!ready || !L || !instance || !group) return;
    const draw = () => {
      const focused = document.activeElement?.id;
      group.clearLayers();
      addBusinessMarkers(L, group, pins, selectedId, id => selection.current.onSelect(id));
      if (location) {
        const origin = L.marker([location.latitude, location.longitude], {
          icon: L.divIcon({ className: 'discovery-origin-icon', html: '<span><i class="origin-pulse"></i></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
          title: 'Titik pencarian: ' + location.label,
          zIndexOffset: 800,
        }).addTo(group);
        origin.getElement()?.setAttribute('aria-label', 'Titik pencarian: ' + location.label);
        const label = document.createElement('span');
        label.textContent = 'Titik pencarian: ' + location.label;
        origin.bindTooltip(label, { direction: 'top', offset: [0, -14], className: 'origin-tooltip' });
        if (radius !== 'unlimited') {
          L.circle([location.latitude, location.longitude], {
            radius: radius * 1000,
            color: '#cbb8aa',
            weight: 1.5,
            dashArray: '6 8',
            fillColor: '#b74a2b',
            fillOpacity: 0.03,
            interactive: false,
            className: 'discovery-radius',
          }).addTo(group);
        }
      }
      if (focused?.startsWith('nearasa-map-pin-')) document.getElementById(focused)?.focus();
    };
    draw(); instance.on('zoomend', draw);
    return () => { instance.off('zoomend', draw); };
  }, [ready, pins, location, radius, selectedId]);

  useEffect(() => {
    if (!ready) return;
    const selected = pins.find(pin => pin.post.id === selectedId);
    if (selected && map.current) map.current.setView([selected.post.latitude, selected.post.longitude], Math.max(map.current.getZoom(), 15), { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches, duration: 0.35 });
  }, [ready, selectedId, pins]);

  const retry = () => {
    if (retryBusy.current || tileStatus === 'loading') return;
    retryBusy.current = true; retried.current = true; setRecovered(false); setTileStatus('loading');
    if (failed) setImportVersion(value => value + 1);
    else tiles.current?.redraw();
  };
  const covered = !hasTiles && tileStatus !== 'ready';
  return <div className={'discovery-map-frame' + (covered ? ' map-is-covered' : '')} data-map-status={tileStatus} aria-busy={tileStatus === 'loading'}>
    <div ref={container} className="discovery-map-canvas" role="region" aria-label="Peta UMKM NEARASA" inert={covered} />
    {!covered && <div className="discovery-map-actions"><button type="button" onClick={() => setFitVersion(value => value + 1)} aria-label="Tampilkan semua titik" title="Tampilkan semua titik"><Expand size={19} /></button>{location && <button type="button" aria-label="Ke titik pencarian" title="Ke titik pencarian" onClick={() => map.current?.setView([location.latitude, location.longitude], 14, { animate: false })}><LocateFixed size={19} /></button>}</div>}
    {tileStatus === 'loading' && covered && <Skeleton />}
    {tileStatus === 'loading' && <span className="consumer-sr-only" role="status">Memuat peta. Daftar usaha tetap tersedia.</span>}
    {tileStatus === 'error' && <div className={'discovery-map-recovery' + (hasTiles ? ' partial-map-error' : '')} role="status">
      <MapPinOff size={hasTiles ? 22 : 42} aria-hidden="true" /><div><h2>{hasTiles ? 'Sebagian peta belum termuat' : 'Peta belum bisa dimuat'}</h2><p>Coba lagi atau lanjutkan lewat daftar usaha.</p></div>
      <div className="map-recovery-actions"><button type="button" className="button" onClick={retry}><RefreshCw size={16} aria-hidden="true" />Coba muat ulang</button><Link href={listHref} className="button button-outline">Lihat daftar</Link></div>
    </div>}
    {recovered && tileStatus === 'ready' && <p className="map-recovered-toast" role="status"><Check size={18} aria-hidden="true" />Peta sudah dimuat</p>}
    {covered && <span className="map-fallback-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></span>}
    {!covered && <div className="discovery-map-legend" aria-label="Keterangan peta"><span><MapPin size={13} aria-hidden="true" />Tempat kuliner</span>{location && <span><i className="legend-origin" />Titik pencarian</span>}</div>}
  </div>;
}
