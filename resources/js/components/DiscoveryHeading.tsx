import { ChevronRight, MapPin } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useUi } from '@/layouts/CustomerLayout';
import type { SharedProps } from '@/types/catalog';

export default function DiscoveryHeading({ title }: { title: string }) {
  const { location } = usePage<SharedProps>().props;
  const { openLocation } = useUi();
  return <header className="discovery-heading">
    <h1>{title}</h1>
    <button type="button" className="discovery-origin" onClick={openLocation} aria-label={location ? 'Ubah titik pencarian: ' + location.label : 'Pilih titik pencarian'}>
      <MapPin size={21} aria-hidden="true" /><span>{location?.label ?? 'Pilih lokasi'}</span>
      <small>{location ? 'Ubah' : 'Pilih'}</small><ChevronRight size={17} aria-hidden="true" />
    </button>
  </header>;
}
