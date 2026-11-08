export const serviceChoices = [['dine_in', 'Makan di tempat'], ['takeaway', 'Bungkus'], ['pickup', 'Ambil sendiri'], ['delivery', 'Pengantaran']] as const;
export const facilityChoices = [['wifi', 'Wi-Fi'], ['outdoor_seating', 'Tempat duduk luar'], ['toilet', 'Toilet'], ['prayer_room', 'Musala'], ['motorcycle_parking', 'Parkir motor'], ['car_parking', 'Parkir mobil'], ['wheelchair_access', 'Akses kursi roda'], ['child_seating', 'Kursi anak']] as const;
export const paymentChoices = [['cash', 'Tunai'], ['qris', 'QRIS'], ['debit_card', 'Kartu debit'], ['credit_card', 'Kartu kredit'], ['bank_transfer', 'Transfer bank']] as const;
export const socialChoices = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['x', 'X'], ['linkedin', 'LinkedIn'], ['pinterest', 'Pinterest']] as const;
export const actionChoices = [['menu', 'Tautan daftar menu'], ['ordering', 'Pesan langsung'], ['reservation', 'Reservasi'], ['gofood', 'GoFood'], ['grabfood', 'GrabFood'], ['shopeefood', 'ShopeeFood']] as const;
export const photoKinds = [['storefront', 'Tampak tempat'], ['food', 'Makanan & minuman'], ['atmosphere', 'Suasana'], ['other', 'Lainnya']] as const;
export const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export type WeeklyHours = { weekday: number; opens_at: string; closes_at: string; all_day?: boolean };
export type SpecialHours = { date: string; is_closed: boolean; all_day: boolean; opens_at: string | null; closes_at: string | null };
export type GalleryPhoto = { id: number; photo: string; caption: string; kind: string };
export type BusinessUpdate = { id: number; type: 'update' | 'offer' | 'event'; title: string; body: string; photo: string | null; starts_on: string | null; ends_on: string | null; cta_label: string | null; cta_url: string | null; is_published: boolean };
export type ProfileInfo = { business_category: string | null; additional_categories: string[]; opened_on: string | null; phone: string | null; whatsapp: string | null; contact_email: string | null; website: string | null; social_links: Record<string, string>; action_links: Record<string, string>; logo: string | null; menu_pdf: string | null; gallery: GalleryPhoto[]; updates: BusinessUpdate[] };
export type TodayHours = { opens_at: string; closes_at: string; closes_tomorrow: boolean };
export type PostInfo = { service_options: string[]; facilities: string[]; payment_methods: string[]; service_area: string | null; operating_status: 'operating' | 'temporarily_closed' | 'permanently_closed'; closure_note: string | null; special_hours: SpecialHours[]; hours_updated_at?: string | null; today_hours?: TodayHours | null };
export type MerchantMenu = { id: number; name: string; description: string; group: string; category: string; price: number; photo: string | null; sold_out: boolean; availability?: { post_id: number; sold_out: boolean }[] };
export type MerchantPost = PostInfo & { id: number; name: string; address: string; landmark: string; latitude: number; longitude: number; schedules: WeeklyHours[]; closed_dates: string[] };
export type MerchantBusiness = ProfileInfo & { id: number; slug: string; name: string; description: string; kind: string; photo: string; status: string; is_demo: boolean; menus: MerchantMenu[]; posts: MerchantPost[] };
