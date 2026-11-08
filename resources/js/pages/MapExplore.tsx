import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import DiscoveryHeading from '@/components/DiscoveryHeading';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import CatalogToolbar from '@/components/CatalogToolbar';
import FilterPanel from '@/components/FilterPanel';
import DiscoveryMap from '@/components/maps/DiscoveryMap';
import { MapResults, MapSelection } from '@/components/maps/MapResults';
import { catalogUrl, type MapCatalogProps } from '@/types/catalog';

export default function MapExplore({ pins, focus, filters, options, location, mapTiles, selectedPostId }: MapCatalogProps) {
  const { url } = usePage();
  const { openLocation } = useUi();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selection, setSelection] = useState<{ url: string; id: number | null; source: 'marker' | 'list' | 'profile' }>({ url, id: selectedPostId, source: 'profile' });
  const mapPins = useMemo(() => focus ? [...pins, focus] : pins, [pins, focus]);
  const selectedId = selection.url === url ? selection.id : selectedPostId;
  const selected = mapPins.find(pin => pin.post.id === selectedId);
  const select = (id: number | null) => setSelection({ url, id, source: 'marker' });
  const selectResult = (id: number) => setSelection({ url, id, source: 'list' });
  useEffect(() => {
    if (selection.url !== url || !selectedId || selection.source === 'profile') return;
    if (selection.source === 'marker' && !matchMedia('(max-width: 767px)').matches) return;
    const summary = document.getElementById('selected-map-business');
    summary?.focus({ preventScroll: true });
    summary?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [selection, url, selectedId]);
  const closeSelection = () => {
    const control = document.getElementById(`nearasa-map-${selection.source === 'list' ? 'result' : 'pin'}-${selected?.post.id}`);
    select(null);
    control?.focus();
  };
  return <><Head title="Peta kuliner" /><div className="map-discovery-page">
    <DiscoveryHeading title="Peta kuliner" />
    <CatalogToolbar filters={filters} onFilter={() => setFilterOpen(true)} map count={pins.length} businessCount={new Set(pins.map(pin => pin.id)).size} />
    <div className="map-discovery-workspace"><MapResults pins={pins} selectedId={selected?.post.id ?? null} onSelect={selectResult} onLocation={openLocation} filters={filters} onFilter={() => setFilterOpen(true)} /><div className="map-stage"><DiscoveryMap pins={mapPins} location={location} radius={filters.radius} tileUrl={mapTiles} selectedId={selected?.post.id ?? null} onSelect={select} listHref={catalogUrl(filters)} />{selected && <MapSelection pin={selected} filters={filters} outsideSearch={focus?.post.id === selected.post.id} onClose={closeSelection} />}</div></div>
    <p className="map-discovery-note">Jarak garis lurus. Status mengikuti jadwal pemilik.</p>
    {filterOpen && <FilterPanel filters={filters} options={options} base="/peta" onClose={() => setFilterOpen(false)} />}
  </div></>;
}
MapExplore.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
