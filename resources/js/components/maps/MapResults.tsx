import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { FavoriteControl, MenuMatch, PostFacts, PostRating } from '@/components/DiscoveryResultCard';
import { allMenusSoldOut, catalogUrl, defaultFilters, distanceLabel, type BusinessCardData, type Filters } from '@/types/catalog';
import EmptyCatalog from '@/components/EmptyCatalog';
import { businessCover } from '@/types/business-images';

type ResultsProps = { pins: BusinessCardData[]; selectedId: number | null; onSelect: (id: number) => void; onLocation: () => void; filters?: Filters; onFilter?: () => void };

export function MapResults({ pins, selectedId, onSelect, filters = defaultFilters, onFilter }: ResultsProps) {
  const [expanded, setExpanded] = useState(false);
  return <section className={'map-results' + (expanded ? ' results-expanded' : '')} aria-labelledby="map-results-title">
    <header className="map-results-heading"><div><h2 id="map-results-title">Lokasi pilihan</h2><p aria-live="polite">{pins.length} lokasi · {new Set(pins.map(pin => pin.id)).size} usaha</p></div>
      <button type="button" className="map-results-toggle" aria-controls="map-result-content" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Tutup daftar peta' : 'Buka daftar peta'}<ChevronDown size={18} aria-hidden="true" /></button>
    </header>
    <div id="map-result-content" className="map-result-content">{pins.length ? <ul className="map-result-list">{pins.map((pin, index) => <li key={pin.post.id} className={selectedId === pin.post.id ? 'selected-result-row' : ''}>
      <button type="button" id={'nearasa-map-result-' + pin.post.id} className={'map-result-select' + (selectedId === pin.post.id ? ' is-selected' : '') + (allMenusSoldOut(pin) ? ' map-result-sold-out' : '')} aria-pressed={selectedId === pin.post.id} aria-controls={selectedId === pin.post.id ? 'selected-map-business' : undefined} aria-label={'Ringkasan ' + pin.name + ', ' + pin.post.name} onClick={() => onSelect(pin.post.id)}>
        <span className="map-result-photo"><img src={businessCover(pin)} alt="" loading="lazy" width="110" height="110" /><span className="map-result-number">{index + 1}</span></span>
        <div className="map-result-copy"><strong>{pin.name}</strong><span>{pin.post.name}</span><PostFacts business={pin} /><MenuMatch business={pin} /><PostRating business={pin} /></div>
      </button><FavoriteControl business={pin} />
    </li>)}</ul> : <EmptyCatalog filters={filters} base="/peta" compact onFilter={onFilter} />}</div>
  </section>;
}

export function MapSelection({ pin, filters, onClose, outsideSearch = false }: { pin: BusinessCardData; filters: Filters; onClose: () => void; outsideSearch?: boolean }) {
  const originParams = new URLSearchParams(catalogUrl(filters, '/peta').split('?')[1]);
  originParams.set('business', pin.slug); originParams.set('post', String(pin.post.id));
  const origin = '/peta?' + originParams;
  const detail = '/usaha/' + pin.slug + '?' + new URLSearchParams({ post: String(pin.post.id), from: origin });
  return <section id="selected-map-business" tabIndex={-1} className={'map-selected' + (allMenusSoldOut(pin) ? ' map-selected-sold-out' : '')} aria-label="Ringkasan usaha terpilih" key={pin.post.id}>
    <button className="map-selected-close icon-button" type="button" aria-label="Tutup ringkasan usaha" onClick={onClose}><X size={18} /></button>
    {outsideSearch && <p className="map-destination-note">Titik dari profil usaha · di luar hasil filter</p>}
    <div className="map-selected-identity"><img src={businessCover(pin)} alt="" width="90" height="90" /><div><h2>{pin.name}</h2><p>{pin.post.name}</p><PostFacts business={pin} distance={false} /><PostRating business={pin} /></div></div>
    <p className="map-selected-address"><MapPin size={15} aria-hidden="true" />{pin.post.address}</p>
    {pin.post.landmark && <p className="map-selected-landmark">{pin.post.landmark}</p>}
    <div className="map-selected-footer"><div><MenuMatch business={pin} />{pin.distance !== null && <span className="selected-distance">{distanceLabel(pin.distance)} · garis lurus</span>}</div><Link className="button" href={detail}>Lihat profil usaha<ChevronRight size={18} aria-hidden="true" /></Link></div>
  </section>;
}
