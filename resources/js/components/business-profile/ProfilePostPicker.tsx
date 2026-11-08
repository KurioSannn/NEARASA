import { ChevronDown, MapPin } from 'lucide-react';
import type { SellingPost } from '@/types/catalog';
import { postHoursUpdateLabel } from './profile-utils';

export default function ProfilePostPicker({ posts, post, onSelect, pending = false }: { posts: SellingPost[]; post?: SellingPost; onSelect: (id: number) => void; pending?: boolean }) {
  const updated = postHoursUpdateLabel(post?.hours_updated_at);
  return <div className="profile-post-picker" aria-busy={pending}>
    <div className="profile-post-select"><MapPin size={22} aria-hidden="true" /><div><label htmlFor="profile-selling-post">Pos kunjungan</label>
      <select id="profile-selling-post" value={post?.id ?? ''} disabled={pending || posts.length < 2} onChange={event => onSelect(Number(event.target.value))}>{posts.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
    </div>{posts.length > 1 && <ChevronDown size={16} aria-hidden="true" />}</div>
    {updated && <small className="profile-hours-updated">Jam diperbarui {updated} WIB</small>}
    <span className="consumer-sr-only" role="status">{pending ? 'Memuat informasi pos. Informasi sebelumnya tetap ditampilkan.' : ''}</span>
  </div>;
}
