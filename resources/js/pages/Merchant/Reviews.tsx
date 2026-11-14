import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/layouts/MerchantLayout';
import BusinessFilter from '@/components/merchant/BusinessFilter';
import { merchantDate } from '@/components/merchant/DailyOperations';
import type { MerchantNavigation } from '@/types/merchant';

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  photo: string | null;
  business_name: string;
  post_name: string;
  author: string;
  created_at: string;
};

type Props = {
  merchantNavigation: MerchantNavigation;
  businessId: number | null;
  reviews: {
    data: Review[];
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  };
};

export default function Reviews({ merchantNavigation, businessId, reviews }: Props) {
  return (
    <>
      <Head title="Ulasan pelanggan" />
      <div className="owner-reports-page">
        <header className="owner-page-heading">
          <div>
            <h1>Ulasan pelanggan</h1>
            <p>Lihat penilaian dan pengalaman pelanggan di setiap pos usahamu.</p>
          </div>
        </header>
        <section className="owner-panel owner-reports-panel" aria-label="Daftar ulasan pelanggan">
          <div className="owner-review-toolbar">
            <BusinessFilter
              businesses={merchantNavigation.businesses}
              value={businessId}
              onChange={business => router.get('/kelola-usaha/ulasan', business ? { business } : {}, { preserveScroll: true })}
            />
            <span className="owner-status neutral">{reviews.total} ulasan masuk</span>
          </div>
          {reviews.data.length > 0 ? (
            <ul className="owner-report-list">
              {reviews.data.map(review => (
                <li key={review.id} className="p-4 sm:p-5 rounded-2xl bg-clay-50/50 border border-sand-border mb-3 last:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-extrabold text-sm text-clay-900 leading-snug">{review.author}</h2>
                      <p className="text-xs text-clay-600 mt-0.5">{review.business_name} · <span className="font-semibold text-clay-800">{review.post_name}</span></p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                      <span className="font-bold text-xs text-terracotta bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full">{review.rating}/5 bintang</span>
                      <time className="text-[11px] text-clay-400 font-medium" dateTime={review.created_at}>{merchantDate(review.created_at)}</time>
                    </div>
                  </div>
                  {review.comment && <p className="mt-2.5 text-xs text-clay-800 leading-relaxed whitespace-pre-wrap break-words">{review.comment}</p>}
                  {review.photo && <img className="mt-3 max-h-48 max-w-full rounded-xl object-contain border border-sand-border shadow-2xs" src={review.photo} alt="Foto dari pelanggan" loading="lazy" />}
                </li>
              ))}
            </ul>
          ) : <div className="owner-empty"><h3>Belum ada ulasan</h3><p>Ulasan yang ditulis pelanggan di profil pos akan muncul di sini.</p></div>}
          {reviews.last_page > 1 && (
            <nav className="owner-pagination" aria-label="Halaman ulasan">
              {reviews.prev_page_url ? <Link href={reviews.prev_page_url}>Sebelumnya</Link> : <span />}
              <span>{reviews.current_page} dari {reviews.last_page}</span>
              {reviews.next_page_url ? <Link href={reviews.next_page_url}>Berikutnya</Link> : <span />}
            </nav>
          )}
        </section>
      </div>
    </>
  );
}

Reviews.layout = (page: React.ReactNode) => <MerchantLayout>{page}</MerchantLayout>;
