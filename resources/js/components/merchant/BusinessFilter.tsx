import { ChevronDown, Store } from 'lucide-react';
import type { MerchantNavigation } from '@/types/merchant';

type Props = {
  businesses: MerchantNavigation['businesses'];
  value: number | null;
  onChange: (id: number | null) => void;
};

export default function BusinessFilter({ businesses, value, onChange }: Props) {
  return (
    <label className="owner-report-filter">
      <Store size={18} aria-hidden="true" />
      <span className="profile-sr-only">Filter usaha</span>
      <select value={value ?? ''} onChange={event => onChange(Number(event.currentTarget.value) || null)}>
        <option value="">Semua usaha ({businesses.length})</option>
        {businesses.map(business => <option key={business.id} value={business.id}>{business.name}</option>)}
      </select>
      <ChevronDown className="owner-report-filter-chevron" size={16} aria-hidden="true" />
    </label>
  );
}
