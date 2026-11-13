import type { SellingPost } from '@/types/catalog';
import type { SpecialHours, WeeklyHours } from '@/types/business-profile';
import { jsonRequestHeaders } from '../../types/request-headers.ts';

export function externalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export function websiteLabel(value: string) {
  try { return new URL(value).hostname.replace(/^www\./, ''); }
  catch { return value; }
}

export function whatsappUrl(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export function dateLabel(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date);
}

export function hoursLabel(hours: WeeklyHours | SpecialHours) {
  if ('is_closed' in hours && hours.is_closed) return 'Libur';
  if (hours.all_day) return 'Buka 24 jam';
  if (!hours.opens_at || !hours.closes_at) return '';
  const opens = hours.opens_at.slice(0, 5);
  const closes = hours.closes_at.slice(0, 5);
  return `${opens}–${closes}${closes < opens ? ' (+1 hari)' : ''}`;
}

export function postStatus(post: SellingPost) {
  if (post.operating_status === 'permanently_closed') return 'Tutup permanen';
  if (post.operating_status === 'temporarily_closed') return 'Tutup sementara';
  return post.is_open ? 'Buka menurut jadwal' : 'Tutup menurut jadwal';
}

export function postIsOpen(post: SellingPost) {
  return (!post.operating_status || post.operating_status === 'operating') && post.is_open;
}

export function postHoursUpdateLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(date);
}

export function trackInteraction(businessId: number, postId: number, type: 'menu_open' | 'map_click' | 'whatsapp_click', menuId?: number) {
  try {
    void fetch('/interaksi', { method: 'POST', credentials: 'same-origin', keepalive: true, headers: jsonRequestHeaders(), body: JSON.stringify({ business_id: businessId, post_id: postId, type, ...(menuId !== undefined ? { menu_id: menuId } : {}) }) }).catch(() => {});
  } catch {
    // Navigation and menu controls remain usable when analytics cannot be sent.
  }
}

export function businessKindLabel(kind: string) {
  const labels: Record<string, string> = { warung: 'Warung', ruko: 'Ruko', rombong: 'Rombong', mobil: 'Mobil jualan', lainnya: 'Lainnya' };
  return labels[kind] ?? kind;
}

export function postDayHours(post: SellingPost) {
  if (post.today_hours) {
    const hours = post.today_hours;
    return hours.opens_at.slice(0, 5).replace(':', '.') + '–' + hours.closes_at.slice(0, 5).replace(':', '.') + ' WIB' + (hours.closes_tomorrow ? ' (+1 hari)' : '');
  }
  const label = post.day_schedule?.label;
  return label ? label.replaceAll(':', '.') + (/\d/.test(label) ? ' WIB' : '') : null;
}

export function profileLoginUrl(slug: string, postId: number, currentUrl: string) {
  const query = new URLSearchParams({ post: String(postId) });
  const from = new URLSearchParams(currentUrl.split('?')[1] ?? '').get('from');
  if (from) query.set('from', from);
  return '/masuk?from=' + encodeURIComponent('/usaha/' + slug + '?' + query);
}
