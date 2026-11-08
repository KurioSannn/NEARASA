import type { MerchantPost, SpecialHours, WeeklyHours } from '@/types/business-profile';

export type PostEditorMode = 'location' | 'hours' | 'services' | 'new';
export type PostDraft = {
  name: string; address: string; landmark: string; latitude: string; longitude: string;
  service_area: string; operating_status: MerchantPost['operating_status']; closure_note: string;
  schedules: WeeklyHours[]; special_hours: SpecialHours[];
  service_options: string[]; facilities: string[]; payment_methods: string[];
};
export type PostFieldsProps = { data: PostDraft; errors: Record<string, unknown>; setData: <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => void };

export function postDraft(post: MerchantPost | null): PostDraft {
  return {
    name: post?.name ?? '', address: post?.address ?? '', landmark: post?.landmark ?? '',
    latitude: post ? String(post.latitude) : '', longitude: post ? String(post.longitude) : '',
    service_area: post?.service_area ?? '', operating_status: post?.operating_status ?? 'operating', closure_note: post?.closure_note ?? '',
    schedules: post ? post.schedules.map(slot => ({ ...slot, all_day: Boolean(slot.all_day) })) : [{ weekday: 1, opens_at: '08:00', closes_at: '17:00', all_day: false }],
    special_hours: post?.special_hours?.length ? post.special_hours.map(slot => ({ ...slot })) : (post?.closed_dates ?? []).map(date => ({ date, is_closed: true, all_day: false, opens_at: null, closes_at: null })),
    service_options: [...(post?.service_options ?? [])], facilities: [...(post?.facilities ?? [])], payment_methods: [...(post?.payment_methods ?? [])],
  };
}
