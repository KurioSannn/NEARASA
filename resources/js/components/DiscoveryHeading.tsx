import { MapPin } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useUi } from '@/layouts/CustomerLayout';
import type { SharedProps } from '@/types/catalog';

export default function DiscoveryHeading({ title }: { title: string }) {
  const { location } = usePage<SharedProps>().props;
  const { openLocation } = useUi();
  return (
    <header className="discovery-heading">
      <div className="discovery-heading-info">
        <h1>{title}</h1>
        <div className="discovery-location-row">
          <MapPin size={15} className="location-pin" aria-hidden="true" />
          <span>
            Menampilkan kuliner di sekitar <strong>{location?.label ?? 'Pilih lokasi'}</strong>
          </span>
          <button
            type="button"
            className="discovery-change-location-btn"
            onClick={openLocation}
            aria-label={location ? 'Ubah titik pencarian: ' + location.label : 'Pilih titik pencarian'}
          >
            Ubah lokasi
          </button>
        </div>
      </div>
    </header>
  );
}
