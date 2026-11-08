import type { BusinessCardData, MenuItem } from './catalog';

export function groupBusinessLocations<T extends BusinessCardData>(cards: T[]): T[][] {
  const groups = new Map<number, T[]>();
  for (const card of cards) {
    const group = groups.get(card.id) ?? [];
    if (!group.some(item => item.post.id === card.post.id)) group.push(card);
    groups.set(card.id, group);
  }
  return [...groups.values()];
}

export function menuPriceRange(menus: MenuItem[]) {
  const food = menus.filter(menu => menu.group !== 'Minuman');
  const priced = (food.length ? food : menus).map(menu => menu.price).filter(price => Number.isFinite(price) && price > 0);
  if (!priced.length) return null;
  return { label: food.length ? 'Harga makanan' : 'Harga minuman', min: Math.min(...priced), max: Math.max(...priced) };
}

export function businessDetailUrl(business: Pick<BusinessCardData, 'slug' | 'post'>, from: string) {
  return `/usaha/${business.slug}?${new URLSearchParams({ post: String(business.post.id), from })}`;
}

// Return links stay internal. The destination controller independently validates its nested origin.
export function publicOwnerBackUrl(value: string | null) {
  if (!value || value.length > 4096 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/jelajah';
  try {
    const base = 'https://nearasa.invalid';
    const url = new URL(value, base);
    if (url.origin !== base || !/^\/usaha\/[a-z0-9-]+$/.test(url.pathname)) return '/jelajah';
    const query = new URLSearchParams();
    const post = url.searchParams.get('post');
    if (post && /^[1-9][0-9]*$/.test(post) && Number.isSafeInteger(Number(post))) query.set('post', post);
    const from = url.searchParams.get('from');
    if (from && from.startsWith('/') && !from.startsWith('//') && !from.includes('\\')) {
      const origin = new URL(from, base);
      const catalog = ['/', '/jelajah', '/peta'].includes(origin.pathname);
      const account = ['/favorit', '/riwayat'].includes(origin.pathname) || /^\/pemilik\/[1-9][0-9]*$/.test(origin.pathname);
      if (origin.origin === base && (catalog || account)) {
        const keys = catalog ? ['q', 'group', 'category', 'max_price', 'radius', ...(origin.pathname === '/peta' ? ['business', 'post'] : [])] : [];
        const safe = new URLSearchParams();
        for (const key of keys) { const item = origin.searchParams.get(key); if (item !== null) safe.set(key, item); }
        query.set('from', origin.pathname + (safe.size ? `?${safe}` : ''));
      }
    }
    return url.pathname + (query.size ? `?${query}` : '');
  } catch { return '/jelajah'; }
}

export function activityDateLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date) + ' WIB';
}
