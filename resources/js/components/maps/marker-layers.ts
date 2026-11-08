import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import { allMenusSoldOut, type BusinessCardData } from '@/types/catalog';

type Leaflet = typeof import('leaflet');

function nearbyGroups(pins: BusinessCardData[], map: LeafletMap): BusinessCardData[][] {
  const points = pins.map(pin => map.latLngToLayerPoint([pin.post.latitude, pin.post.longitude]));
  const parents = pins.map((_, index) => index);
  const root = (index: number): number => {
    while (parents[index] !== index) index = parents[index];
    return index;
  };
  for (let a = 0; a < pins.length; a++) {
    for (let b = a + 1; b < pins.length; b++) {
      if (Math.abs(points[a].x - points[b].x) < 48 && Math.abs(points[a].y - points[b].y) < 52) parents[root(b)] = root(a);
    }
  }
  const groups = new Map<number, BusinessCardData[]>();
  pins.forEach((pin, index) => { const key = root(index); groups.set(key, [...(groups.get(key) ?? []), pin]); });
  return [...groups.values()];
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

export function addBusinessMarkers(L: Leaflet, map: LeafletMap, layer: LayerGroup, pins: BusinessCardData[], selectedId: number | null, onSelect: (id: number) => void) {
  const single = (pin: BusinessCardData) => {
    const selected = pin.post.id === selectedId;
    const body = document.createElement('span');
    const soldOut = allMenusSoldOut(pin);
    body.textContent = String(pins.findIndex(item => item.post.id === pin.post.id) + 1);
    const label = `Pilih ${pin.name}, ${pin.post.name}${soldOut ? ', semua menu habis' : ''}`;
    const marker = L.marker([pin.post.latitude, pin.post.longitude], {
      icon: L.divIcon({ className: `discovery-pin ${pin.is_open ? 'pin-open' : 'pin-closed'} ${soldOut ? 'pin-sold-out' : ''} ${selected ? 'pin-selected' : ''}`, html: body, iconSize: [38, 44], iconAnchor: [19, 44] }),
      title: label, keyboard: true, riseOnHover: true, zIndexOffset: selected ? 1000 : 0,
    }).addTo(layer);
    activation(marker, label, () => onSelect(pin.post.id));
    const element = marker.getElement();
    if (element) element.id = `nearasa-map-pin-${pin.post.id}`;
    element?.setAttribute('aria-pressed', String(selected));
    const tooltip = document.createElement('span');
    tooltip.textContent = `${pin.name} · ${pin.post.name}`;
    marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -43] });
  };
  const selected = pins.find(pin => pin.post.id === selectedId);
  for (const group of nearbyGroups(pins.filter(pin => pin.post.id !== selectedId), map)) {
    if (group.length === 1) { single(group[0]); continue; }
    const bounds = L.latLngBounds(group.map(pin => [pin.post.latitude, pin.post.longitude]));
    const label = `Lihat ${group.length} pos jualan di area ini`;
    const body = document.createElement('span');
    const count = document.createElement('strong');
    count.textContent = String(group.length);
    const caption = document.createElement('small');
    caption.textContent = 'pos';
    body.append(count, caption);
    const marker = L.marker(bounds.getCenter(), { icon: L.divIcon({ className: 'discovery-cluster', html: body, iconSize: [48, 48], iconAnchor: [24, 24] }), title: label, keyboard: true }).addTo(layer);
    activation(marker, label, () => {
      const colocated = bounds.getNorthEast().equals(bounds.getSouthWest());
      if (!colocated && map.getZoom() < 18 && map.getBoundsZoom(bounds, false, L.point(140, 140)) > map.getZoom()) {
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 18, animate: false });
        return;
      }
      const choices = document.createElement('div');
      choices.className = 'map-cluster-choices';
      const heading = document.createElement('strong');
      heading.textContent = 'Pilih pos jualan';
      choices.append(heading);
      group.forEach(pin => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${pin.name} · ${pin.post.name}`;
        button.addEventListener('click', () => { map.closePopup(); onSelect(pin.post.id); });
        choices.append(button);
      });
      L.popup({ minWidth: 160, maxWidth: Math.min(280, Math.max(160, map.getSize().x - 68)) }).setLatLng(bounds.getCenter()).setContent(choices).openOn(map);
      choices.querySelector('button')?.focus();
    });
  }
  if (selected) single(selected);
}
