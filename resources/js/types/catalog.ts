import type { PostInfo, ProfileInfo, WeeklyHours } from './business-profile';

export type Location = { latitude: number; longitude: number; label: string };
export type Filters = { q: string; group: string | null; category: string | null; max_price: number | null; radius: number | 'unlimited' };
export type MenuAvailability = { post_id: number; sold_out: boolean };
export type MenuItem = { id: number; name: string; description?: string | null; group: string; category: string; price: number; photo: string | null; sold_out: boolean; availability?: MenuAvailability[] };
export type SellingPost = Partial<PostInfo> & { id: number; name: string; address: string; landmark: string; latitude: number; longitude: number; is_open: boolean; distance: number | null; schedules: WeeklyHours[]; closed_dates?: string[]; rating?: Rating; day_schedule?: { label: string; source: string } };
export type Rating = { average: number | null; count: number };
export type PublicOwner = { id: number; public_name: string };
export type HistoryCard = BusinessCardData & { activity?: { type: 'profile_view' | 'menu_open' | 'map_click' | 'whatsapp_click' | 'favorite'; at: string | null } };
export type Review = { id: number; author: string; rating: number; comment: string | null; photo: string | null; created_at: string };
export type OwnReview = Pick<Review, 'id' | 'rating' | 'comment' | 'photo'>;
export type PostReviews = { post_id: number; rating: Rating; items: Review[]; own: OwnReview | null };
export type BusinessCardData = { id: number; slug: string; name: string; kind: string; business_category?: string | null; photo: string; is_demo: boolean; menus: MenuItem[]; min_price: number; is_open: boolean; distance: number | null; post: SellingPost; all_sold_out?: boolean; matched_menu?: MenuItem | null; rating?: Rating };
export type Business = Partial<ProfileInfo> & { id: number; slug: string; name: string; description: string; kind: string; photo: string; is_demo: boolean; whatsapp: string | null; menus: MenuItem[]; posts: SellingPost[] };
export type Options = { groups: string[]; categories: string[]; areas: Location[] };
export type AccountUser = { id: number; name: string; email: string; is_demo: boolean; public_name?: string | null };
export interface SharedProps extends Record<string, unknown> { location: Location | null; options: Options; errors: Record<string, string>; mapTiles: string; auth: { user: AccountUser | null; favorites: number[] }; flash: { success: string | null } }
export type CatalogProps = SharedProps & { businesses: BusinessCardData[]; filters: Filters; recommendations?: BusinessCardData[] };
export type MapCatalogProps = SharedProps & { pins: BusinessCardData[]; focus: BusinessCardData | null; filters: Filters; selectedPostId: number | null };
export const defaultFilters: Filters = { q: '', group: null, category: null, max_price: null, radius: 5 };
export const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export const distanceLabel = (value: number) => value < 1 ? `${Math.round(value * 1000)} m` : `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} km`;
export const ratingLabel = (rating?: Rating) => rating && rating.count > 0 && rating.average !== null ? `${rating.average.toLocaleString('id-ID', { maximumFractionDigits: 1 })} · ${rating.count} ulasan` : 'Belum ada ulasan';
export const cardKey = (business: BusinessCardData) => `${business.id}-${business.post.id}`;
export const menuSoldOut = (menu: MenuItem, postId?: number) => menu.availability?.find(item => item.post_id === postId)?.sold_out ?? menu.sold_out;
export const allMenusSoldOut = (business: BusinessCardData) => business.all_sold_out ?? (business.menus.length > 0 && business.menus.every(menu => menuSoldOut(menu, business.post.id)));
export const matchedMenu = (business: BusinessCardData) => business.matched_menu ?? business.menus.find(menu => !menuSoldOut(menu, business.post.id)) ?? business.menus[0] ?? null;
export function catalogUrl(filters: Partial<Filters>, base = '/jelajah') {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== null && value !== '' && value !== undefined) params.set(key, String(value)); });
  return `${base}${params.size ? `?${params}` : ''}`;
}
export function mapPostUrl(slug: string, postId: number) {
  return `/peta?${new URLSearchParams({ radius: 'unlimited', business: slug, post: String(postId) })}`;
}
