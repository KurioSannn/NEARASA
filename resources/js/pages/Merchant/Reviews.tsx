import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/layouts/MerchantLayout';
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
          <div className="owner-reports-controls">
            <label className="flex items-center gap-3">
              <span>Usaha</span>
              <select className="rounded-xl border border-sand-border bg-white p-2" value={businessId ?? ''} onChange={event => {
                const business = event.currentTarget.value;
                router.get('/kelola-usaha/ulasan', business ? { business } : {});
              }}>
                <option value="">Semua usaha</option>
                {merchantNavigation.businesses.map(business => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </label>
            <span>{reviews.total} ulasan</span>
          </div>
          {reviews.data.length > 0 ? (
            <ul className="owner-report-list">
              {reviews.data.map(review => (
                <li key={review.id} className="owner-report p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold">{review.author}</h2>
                      <p>{review.business_name} · {review.post_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-terracotta">{review.rating}/5 bintang</p>
                      <time className="owner-caption" dateTime={review.created_at}>{merchantDate(review.created_at)}</time>
                    </div>
                  </div>
                  {review.comment && <p className="mt-2 whitespace-pre-wrap break-words">{review.comment}</p>}
                  {review.photo && <img className="mt-3 max-h-48 max-w-full rounded-xl object-contain" src={review.photo} alt="Foto dari pelanggan" loading="lazy" />}
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
