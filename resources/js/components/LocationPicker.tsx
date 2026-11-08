import { router, useForm } from '@inertiajs/react';
import { AlertCircle, ChevronDown, LocateFixed, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Dialog from './Dialog';
import LocationMap from './LocationMap';
import Button from './Button';
import type { Location } from '@/types/catalog';

export default function LocationPicker({ location, areas, tileUrl, onClose }: { location: Location | null; areas: Location[]; tileUrl: string; onClose: () => void }) {
  const draft = (point: Location) => ({ ...point, latitude: String(point.latitude), longitude: String(point.longitude) });
  const form = useForm(draft(location ?? areas[0]));
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);
  const cancelLocate = () => { request.current++; setLocating(false); };
  const select = (latitude: number, longitude: number) => { cancelLocate(); form.setData(draft({ latitude, longitude, label: 'Titik pilihan di peta' })); };
  const locate = () => {
    setGpsError('');
    if (!navigator.geolocation) { setGpsError('Perangkat ini belum mendukung lokasi otomatis. Pilih area atau titik di peta.'); return; }
    setLocating(true);
    const id = ++request.current;
    navigator.geolocation.getCurrentPosition(position => {
      if (id !== request.current) return;
      form.setData(draft({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'Lokasi saya' })); setLocating(false);
    }, error => {
      if (id !== request.current) return;
      setGpsError(error.code === 1 ? 'Izin lokasi belum diberikan. Kamu bisa memilih area atau titik di peta.' : 'Lokasi belum ditemukan. Coba lagi atau pilih titik secara manual.');
      setLocating(false);
    }, { timeout: 12000, maximumAge: 60000 });
  };
  return <Dialog title="Pilih lokasi pencarian" onClose={onClose} wide>
    <form className="search-origin-form" onSubmit={event => { event.preventDefault(); form.post('/lokasi', { preserveScroll: true, onSuccess: onClose }); }}>
      <p className="dialog-intro">Pilih titik untuk mencari makanan di sekitarmu.</p>
      <div className="location-grid"><div className="location-controls">
        <button type="button" className="gps-button" onClick={locate} disabled={locating}><LocateFixed size={21} aria-hidden="true" /><span>{locating ? 'Mencari lokasi…' : 'Gunakan lokasi saya'}</span></button>
        {gpsError && <div className="gps-feedback" role="alert"><AlertCircle size={20} aria-hidden="true" /><p>{gpsError}</p></div>}
        <h3>Atau pilih area</h3><div className="area-list">{areas.map(area => <button key={area.label} type="button" aria-pressed={form.data.label === area.label} onClick={() => { cancelLocate(); form.setData(draft(area)); }}><MapPin size={18} aria-hidden="true" /><span>{area.label}</span><span className="radio-dot" /></button>)}</div>
        <label className="field-label" htmlFor="location-label">Nama titik pencarian</label><input className="text-input" id="location-label" value={form.data.label} maxLength={120} required onChange={event => { cancelLocate(); form.setData('label', event.target.value); }} />
        <details className="coordinate-disclosure"><summary><ChevronDown size={16} aria-hidden="true" />Koordinat manual</summary>
          <div className="coordinate-fields"><label>Latitude<input className="text-input" type="number" min="-90" max="90" step="any" required value={form.data.latitude} onInvalid={event => { event.currentTarget.closest('details')!.open = true; }} onChange={event => { cancelLocate(); form.setData('latitude', event.target.value); }} /></label><label>Longitude<input className="text-input" type="number" min="-180" max="180" step="any" required value={form.data.longitude} onInvalid={event => { event.currentTarget.closest('details')!.open = true; }} onChange={event => { cancelLocate(); form.setData('longitude', event.target.value); }} /></label></div>
        </details>
      </div><div className="location-map-column"><p className="location-map-helper"><MapPin size={17} aria-hidden="true" />Ketuk peta atau geser pin untuk memilih titik.</p><LocationMap latitude={form.data.latitude === '' ? (location ?? areas[0]).latitude : Number(form.data.latitude)} longitude={form.data.longitude === '' ? (location ?? areas[0]).longitude : Number(form.data.longitude)} tileUrl={tileUrl} onSelect={select} /></div></div>
      {Object.entries(form.errors).map(([key, error]) => <p className="form-error" key={key} role="alert">{error}</p>)}
      <div className="dialog-footer">{location && <button className="text-button" type="button" disabled={form.processing} onClick={() => router.delete('/lokasi', { preserveScroll: true, onSuccess: onClose })}>Hapus titik pencarian</button>}<Button type="submit" disabled={form.processing || locating}>{form.processing ? 'Menyimpan…' : 'Gunakan titik ini'}</Button></div>
    </form>
  </Dialog>;
}
