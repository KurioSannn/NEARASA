export type OwnedBusiness = { id: number; slug: string; name: string; kind: string; photo: string; status: string; is_demo: boolean; menu_items_count?: number; selling_posts_count?: number };
export type MerchantNavigation = { businesses: OwnedBusiness[]; manage_url: string; pending_reports: number };
export type InteractionCounts = { profile_view: number; menu_open: number; map_click: number; whatsapp_click: number };
export type MerchantStatistics = { days: number; totals: InteractionCounts; by_post: (InteractionCounts & { post_id: number; post_name: string; business_name: string })[] };
export type ClosureReport = { id: number; post_id: number; post_name: string; business_id: number; business_name: string; business_slug: string; business_photo: string; business_is_demo: boolean; note: string | null; created_at: string; resolved_at: string | null };

export function managementUrl(slug: string, postId?: number, tab?: string) {
  const query = new URLSearchParams();
  if (postId) query.set('post', String(postId));
  if (tab && tab !== 'daily') query.set('tab', tab);
  return `/kelola-usaha/${slug}${query.size ? `?${query}` : ''}`;
}

export function operationStatus(post: { operating_status?: string; is_open?: boolean }) {
  if (post.operating_status === 'permanently_closed') return { label: 'Tutup permanen', open: false };
  if (post.is_open) return { label: 'Buka', open: true };
  return { label: post.operating_status === 'temporarily_closed' ? 'Tutup sementara' : 'Tutup', open: false };
}
