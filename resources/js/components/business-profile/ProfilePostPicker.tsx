import { ChevronDown, MapPin } from 'lucide-react';
import type { SellingPost } from '@/types/catalog';
import { postHoursUpdateLabel } from './profile-utils';

export default function ProfilePostPicker({
  posts,
  post,
  onSelect,
  pending = false,
}: {
  posts: SellingPost[];
  post?: SellingPost;
  onSelect: (id: number) => void;
  pending?: boolean;
}) {
  const updated = postHoursUpdateLabel(post?.hours_updated_at);

  if (posts.length <= 1) {
    return (
      <div className="profile-post-picker single-post" aria-busy={pending}>
        <div className="profile-post-badge">
          <MapPin size={18} className="post-pin-icon" aria-hidden="true" />
          <div className="post-badge-content">
            <span className="post-badge-label">Pos Penjualan</span>
            <strong className="post-badge-name">{post?.name ?? 'Gerai Utama'}</strong>
          </div>
        </div>
        {updated && <small className="profile-hours-updated">Jadwal diperbarui {updated} WIB</small>}
      </div>
    );
  }

  return (
    <div className="profile-post-picker" aria-busy={pending}>
      <div className="profile-post-select">
        <MapPin size={18} className="post-pin-icon" aria-hidden="true" />
        <div className="post-select-content">
          <label htmlFor="profile-selling-post">Pilih Cabang / Pos ({posts.length})</label>
          <select
            id="profile-selling-post"
            value={post?.id ?? ''}
            disabled={pending}
            onChange={event => onSelect(Number(event.target.value))}
          >
            {posts.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <ChevronDown size={16} className="post-select-chevron" aria-hidden="true" />
      </div>
      {updated && <small className="profile-hours-updated">Jadwal diperbarui {updated} WIB</small>}
      <span className="consumer-sr-only" role="status">
        {pending ? 'Memuat informasi pos. Informasi sebelumnya tetap ditampilkan.' : ''}
      </span>
    </div>
  );
}
