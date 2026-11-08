import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { LocateFixed } from 'lucide-react';
import LocationMap from '@/components/LocationMap';
import type { SharedProps } from '@/types/catalog';
import { TextAreaField, TextField } from './ProfileFields';
import type { PostFieldsProps } from './post-form';

export default function PostLocationFields({ data, setData, errors, locating, onLocating }: PostFieldsProps & { locating: boolean; onLocating: (value: boolean) => void }) {
  const { mapTiles, options } = usePage<SharedProps>().props;
  const [gpsError, setGpsError] = useState('');
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  const select = (latitude: number, longitude: number) => { setData('latitude', String(Number(latitude.toFixed(6)))); setData('longitude', String(Number(longitude.toFixed(6)))); };
  const hasPoint = data.latitude.trim() !== '' && data.longitude.trim() !== '' && Number.isFinite(Number(data.latitude)) && Number.isFinite(Number(data.longitude)) && Math.abs(Number(data.latitude)) <= 90 && Math.abs(Number(data.longitude)) <= 180;
  const center = options.areas[0] ?? { latitude: -7.4469, longitude: 112.7183 };
  const locate = () => {
    setGpsError('');
    if (!navigator.geolocation) { setGpsError('Perangkat ini belum mendukung GPS. Pilih pin pada peta atau isi koordinat.'); return; }
    onLocating(true); const current = ++request.current;
    navigator.geolocation.getCurrentPosition(position => { if (current !== request.current) return; select(position.coords.latitude, position.coords.longitude); onLocating(false); }, error => { if (current !== request.current) return; setGpsError(error.code === 1 ? 'Izin lokasi belum diberikan. Pilih pin pada peta atau isi koordinat secara manual.' : 'Lokasi belum ditemukan. Coba lagi atau pilih titik secara manual.'); onLocating(false); }, { timeout: 12000, maximumAge: 60000 });
  };
  return <div className="profile-form-fields"><TextField id="post-name" label="Nama pos jualan" required maxLength={120} value={data.name} onChange={event => setData('name', event.target.value)} error={errors.name} hint="Contoh: Pos depan kampus atau Cabang pusat." /><TextAreaField id="post-address" label="Alamat lengkap" required maxLength={255} value={data.address} onChange={event => setData('address', event.target.value)} error={errors.address} /><TextField id="post-landmark" label="Patokan" maxLength={255} value={data.landmark} onChange={event => setData('landmark', event.target.value)} error={errors.landmark} hint="Contoh: Samping minimarket, gerbang warna hijau." /><TextField id="post-service-area" label="Area layanan" maxLength={255} value={data.service_area} onChange={event => setData('service_area', event.target.value)} error={errors.service_area} hint="Contoh: Pengantaran di sekitar kampus, radius 3 km." />
    <div className="profile-map-heading"><h3>Titik pos di peta</h3><button type="button" className="profile-secondary" disabled={locating} onClick={locate}><LocateFixed size={17} />{locating ? 'Mencari lokasi…' : 'Gunakan lokasi saya'}</button></div>{gpsError && <p className="profile-field-error" role="status">{gpsError}</p>}<LocationMap latitude={hasPoint ? Number(data.latitude) : center.latitude} longitude={hasPoint ? Number(data.longitude) : center.longitude} tileUrl={mapTiles} onSelect={select} /><p className="profile-hint">{hasPoint ? 'Ketuk peta atau geser pin untuk memperbaiki titik. Koordinat juga dapat diisi dengan keyboard.' : 'Pin awal hanya acuan area. Ketuk peta, gunakan GPS, atau isi kedua koordinat untuk menetapkan titik pos.'}</p>
    <details className="profile-optional-group" open={!hasPoint || Boolean(errors.latitude || errors.longitude) || undefined}><summary>Isi koordinat secara manual<span>{hasPoint ? 'Titik sudah dipilih' : 'Alternatif peta dan GPS'}</span></summary><div className="profile-two-columns"><TextField id="post-latitude" label="Latitude" type="number" inputMode="decimal" min={-90} max={90} step="any" required value={data.latitude} onChange={event => setData('latitude', event.target.value)} error={errors.latitude} /><TextField id="post-longitude" label="Longitude" type="number" inputMode="decimal" min={-180} max={180} step="any" required value={data.longitude} onChange={event => setData('longitude', event.target.value)} error={errors.longitude} /></div></details>
  </div>;
}
