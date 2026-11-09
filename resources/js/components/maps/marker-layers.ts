import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import { allMenusSoldOut, type BusinessCardData } from '@/types/catalog';

type Leaflet = typeof import('leaflet');

function formatShortPrice(pin: BusinessCardData): string {
  const price = pin.min_price || pin.matched_menu?.price || 0;
  if (!price) return '';
  if (price >= 1000) {
    const k = price / 1000;
    return Number.isInteger(k) ? `${k}rb` : `${k.toFixed(1).replace('.', ',')}rb`;
  }
  return String(price);
}

function getPinIconSvg(pin: BusinessCardData): string {
  const category = pin.matched_menu?.category || '';
  const group = pin.matched_menu?.group || '';
  if (category === 'Kopi' || group === 'Minuman') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 12h1a2 2 0 0 1 0 4h-1"/></svg>';
  }
  if (category === 'Pizza') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-9 18a1.5 1.5 0 0 0 1.3 2.2h15.4a1.5 1.5 0 0 0 1.3-2.2L12 2Z"/><path d="M9 16h6"/><path d="M10.5 11h3"/></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v10"/><path d="M15 15v7"/><path d="M6 2v20"/><path d="M9 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/></svg>';
}

function activation(marker: Marker, label: string, action: () => void) {
  marker.on('click', action);
  const element = marker.getElement();
  element?.setAttribute('aria-label', label);
  element?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    action();
  });
}

export function addBusinessMarkers(
  L: Leaflet,
  _map: LeafletMap,
  layer: LayerGroup,
  pins: BusinessCardData[],
  selectedId: number | null,
  onSelect: (id: number) => void
) {
  // Proximity-based offset to prevent pins within ~400m from colliding
  const placedPins: { lat: number; lng: number }[] = [];

  pins.forEach(pin => {
    let lat = pin.post.latitude;
    let lng = pin.post.longitude;

    // Detect nearby pins placed previously
    let nearbyCount = 0;
    for (const placed of placedPins) {
      const dLat = Math.abs(lat - placed.lat);
      const dLng = Math.abs(lng - placed.lng);
      if (dLat < 0.0035 && dLng < 0.005) {
        nearbyCount++;
      }
    }

    if (nearbyCount > 0) {
      // Alternate offsets so nearby pins form a clean, legible cluster
      const angle = nearbyCount * (Math.PI * 0.65);
      const distance = 0.0016 * Math.ceil(nearbyCount / 2);
      lat += Math.sin(angle) * distance;
      lng += Math.cos(angle) * distance * 1.3;
    }

    placedPins.push({ lat, lng });

    const selected = pin.post.id === selectedId;
    const soldOut = allMenusSoldOut(pin);
    const shortPrice = formatShortPrice(pin);

    const pinHtml = `
      <div class="culinary-pin ${pin.is_open ? 'pin-open' : 'pin-closed'} ${soldOut ? 'pin-sold-out' : ''} ${selected ? 'pin-selected' : ''}">
        <div class="culinary-pin-disc">
          ${getPinIconSvg(pin)}
          ${pin.is_open ? '<span class="culinary-pin-dot" aria-hidden="true"></span>' : ''}
        </div>
        <div class="culinary-pin-pointer" aria-hidden="true"></div>
      </div>
    `.trim();

    const label = `${pin.name}, ${pin.post.name} · ${pin.is_open ? 'Buka' : 'Tutup'}${shortPrice ? ` · Mulai Rp ${shortPrice}` : ''}${soldOut ? ', semua menu habis' : ''}`;
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'culinary-pin-wrapper',
        html: pinHtml,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
      }),
      title: label,
      keyboard: true,
      riseOnHover: true,
      zIndexOffset: selected ? 2000 : 100,
    }).addTo(layer);

    activation(marker, label, () => onSelect(pin.post.id));
    const element = marker.getElement();
    if (element) element.id = `nearasa-map-pin-${pin.post.id}`;
    element?.setAttribute('aria-pressed', String(selected));

    const tooltip = document.createElement('span');
    tooltip.innerHTML = `<strong>${pin.name}</strong>${pin.matched_menu ? `<small> · ${pin.matched_menu.name}${shortPrice ? ` (${shortPrice})` : ''}</small>` : ''}`;
    marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -42], className: 'culinary-tooltip' });
  });
}
