import { Link, useForm, usePage } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '@/components/Button';
import { type Business, type PostReviews, type PublicOwner, type SellingPost, type SharedProps } from '@/types/catalog';
import { ProfilePhoto } from './ProfilePhotos';
import { profileLoginUrl } from './profile-utils';

function ReviewForm({ business, post, reviews, onCancel, onSaved }: { business: Business; post: SellingPost; reviews?: PostReviews; onCancel: () => void; onSaved: () => void }) {
  const form = useForm<{ rating: number; comment: string; photo: File | null }>({ rating: reviews?.own?.rating ?? 0, comment: reviews?.own?.comment ?? '', photo: null });
  const photoInput = useRef<HTMLInputElement>(null);
  const clearPhoto = () => { form.setData('photo', null); form.clearErrors('photo'); if (photoInput.current) photoInput.current.value = ''; };
  return <form className="consumer-form review-form" encType="multipart/form-data" aria-busy={form.processing} onSubmit={event => {
    event.preventDefault();
    form.post(`/usaha/${business.slug}/pos/${post.id}/ulasan`, { preserveScroll: true, forceFormData: true, onSuccess: () => { form.reset('photo'); if (photoInput.current) photoInput.current.value = ''; onSaved(); } });
  }}>
    <h3>{reviews?.own ? 'Perbarui penilaianmu' : 'Beri penilaian untuk pos ini'}</h3>
    <p className="profile-section-intro">{post.name}. Bintang wajib; cerita dan foto boleh menyusul.</p>
    <fieldset className="review-rating-field"><legend>Penilaian <span aria-hidden="true">*</span></legend><div className="review-star-choices">{[1, 2, 3, 4, 5].map(star => <label key={star} className={form.data.rating >= star ? 'is-selected' : ''}><input type="radio" name={`rating-${post.id}`} value={star} required checked={form.data.rating === star} disabled={form.processing} onChange={() => form.setData('rating', star)} /><Star size={25} aria-hidden="true" /><span className="consumer-sr-only">{star} bintang</span></label>)}</div><span className="review-rating-description" aria-live="polite">{form.data.rating ? `${form.data.rating} dari 5 bintang` : 'Pilih 1 sampai 5 bintang'}</span>{form.errors.rating && <p className="form-error" role="alert">{form.errors.rating}</p>}</fieldset>
    <label htmlFor={`review-comment-${post.id}`}>Ceritamu <span>(opsional)</span></label><textarea id={`review-comment-${post.id}`} maxLength={2000} rows={4} value={form.data.comment} disabled={form.processing} onChange={event => form.setData('comment', event.target.value)} placeholder="Apa yang ingin kamu ceritakan tentang pos ini?" />
    {form.errors.comment && <p className="form-error" role="alert">{form.errors.comment}</p>}
    <label htmlFor={`review-photo-${post.id}`}>Foto <span>(opsional)</span></label><input ref={photoInput} id={`review-photo-${post.id}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={form.processing} onChange={event => form.setData('photo', event.target.files?.[0] ?? null)} /><p className="consumer-field-hint">JPG, PNG, atau WebP, maksimal 2 MB.</p>
    {form.data.photo && <button type="button" className="text-button review-clear-photo" disabled={form.processing} onClick={clearPhoto}>Batalkan pilihan foto</button>}
    {reviews?.own?.photo && !form.data.photo && <ProfilePhoto src={reviews.own.photo} alt="Foto pada ulasanmu" className="review-photo" />}
    {form.errors.photo && <p className="form-error" role="alert">{form.errors.photo}</p>}
    <div className="profile-review-form-actions"><Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan ulasan…' : reviews?.own ? 'Simpan perubahan ulasan' : 'Kirim ulasan'}</Button><button type="button" className="button button-outline" disabled={form.processing} onClick={onCancel}>Batal</button></div>
    {form.recentlySuccessful && <p className="consumer-success" role="status">Ulasanmu untuk {post.name} sudah tersimpan.</p>}
  </form>;
}

export default function ProfileReviews({ business, post, reviews, owner }: { business: Business; post?: SellingPost; reviews?: PostReviews; owner?: PublicOwner | null }) {
  const { props: { auth }, url } = usePage<SharedProps>();
  const [writing, setWriting] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!post) return <p className="profile-section-intro">Pos jualan belum tersedia.</p>;
  const isOwner = Boolean(auth.user && owner?.id === auth.user.id);
  const items = reviews?.items ?? [];
  const rating = reviews?.rating;
  const hasReviews = Boolean(items.length > 0 && rating?.count && rating.average !== null);
  const loginUrl = profileLoginUrl(business.slug, post.id, url);

  return (
    <div className="profile-reviews">
      <header className="profile-reviews-heading">
        <div>
          <h2>Ulasan Pengunjung</h2>
          <p className="profile-section-intro">Pengalaman bersantap langsung di {post.name}</p>
        </div>
        {!isOwner && !writing && (
          auth.user ? (
            <Button
              type="button"
              onClick={() => { setWriting(true); setSaved(false); }}
            >
              {reviews?.own ? 'Perbarui Ulasan' : 'Tulis Ulasan'}
            </Button>
          ) : (
            <Link href={loginUrl} className="button button-outline">
              Masuk untuk Menulis
            </Link>
          )
        )}
      </header>

      {/* Review Score Summary (Only displayed when actual reviews exist) */}
      {hasReviews && (
        <div className="profile-review-summary">
          <div className="review-score-big">
            {rating?.average?.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
          </div>
          <div className="review-score-info">
            <div className="review-stars-row" aria-label={`Nilai ${rating?.average} dari 5 bintang`}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  size={15}
                  key={star}
                  className={rating?.average && Math.round(rating.average) >= star ? 'is-filled' : ''}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="review-count-text">Berdasarkan {rating?.count} ulasan pelanggan</span>
          </div>
        </div>
      )}

      {saved && (
        <p className="consumer-success" role="status">
          Ulasanmu untuk {post.name} sudah tersimpan.
        </p>
      )}

      {writing && auth.user && !isOwner && (
        <ReviewForm
          key={post.id}
          business={business}
          post={post}
          reviews={reviews}
          onCancel={() => setWriting(false)}
          onSaved={() => { setWriting(false); setSaved(true); }}
        />
      )}

      {items.length > 0 ? (
        <div className="review-list">
          {items.map(review => {
            const date = new Date(review.created_at);
            const createdLabel = Number.isNaN(date.getTime())
              ? null
              : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date);
            return (
              <article className="review-item" key={review.id}>
                <header className="review-author">
                  <span className="profile-review-avatar" aria-hidden="true">
                    {review.author.charAt(0).toLocaleUpperCase('id-ID')}
                  </span>
                  <div>
                    <strong>{review.author}</strong>
                    {createdLabel && <time dateTime={review.created_at}>{createdLabel}</time>}
                  </div>
                </header>
                <div className="review-stars-row" aria-label={review.rating + ' dari 5 bintang'}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      size={14}
                      key={star}
                      className={review.rating >= star ? 'is-filled' : ''}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {review.comment && <p className="profile-preserve-lines review-comment-text">{review.comment}</p>}
                {review.photo && <ProfilePhoto src={review.photo} alt={'Foto ulasan ' + review.author} className="review-photo" />}
              </article>
            );
          })}
        </div>
      ) : (
        !writing && (
          <div className="profile-reviews-empty">
            <h3>Belum Ada Ulasan di Pos Ini</h3>
            <p>
              Punya cerita tentang cita rasa atau pelayanan di {post.name}? Jadilah yang pertama memberikan ulasan untuk membantu penikmat kuliner lain.
            </p>
            {!isOwner && (
              auth.user ? (
                <button
                  type="button"
                  className="button button-write-first"
                  onClick={() => { setWriting(true); setSaved(false); }}
                >
                  Tulis Ulasan Pertama
                </button>
              ) : (
                <Link href={loginUrl} className="button button-write-first">
                  Masuk untuk Menulis Ulasan
                </Link>
              )
            )}
          </div>
        )
      )}

      {isOwner && (
        <p className="profile-section-intro profile-owner-notice">
          Kamu mengelola usaha ini. Ulasan berasal dari akun konsumen lain.
        </p>
      )}
    </div>
  );
}
