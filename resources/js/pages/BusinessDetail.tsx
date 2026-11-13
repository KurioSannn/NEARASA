import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock3, Heart, Navigation, Star, Store } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import CustomerLayout, { useUi } from '@/layouts/CustomerLayout';
import ProfileAbout from '@/components/business-profile/ProfileAbout';
import ProfileLocation from '@/components/business-profile/ProfileLocation';
import ProfileMenu from '@/components/business-profile/ProfileMenu';
import ProfilePhotos, { PhotoViewer, ProfilePhoto } from '@/components/business-profile/ProfilePhotos';
import ProfilePostPicker from '@/components/business-profile/ProfilePostPicker';
import ProfileReviews from '@/components/business-profile/ProfileReviews';
import ProfileUpdates from '@/components/business-profile/ProfileUpdates';
import ProfileVisitCard, { ProfileVisitActions } from '@/components/business-profile/ProfileVisitCard';
import { businessKindLabel, postDayHours, postIsOpen } from '@/components/business-profile/profile-utils';
import { businessCover } from '@/types/business-images';
import { distanceLabel, type Business, type PostReviews, type PublicOwner, type SharedProps } from '@/types/catalog';

type DetailTab = 'menu' | 'location' | 'about' | 'photos' | 'updates' | 'reviews';
type DetailProps = {
  business: Business;
  selectedPostId: number | null;
  backUrl: string;
  owner?: PublicOwner | null;
  reviews?: PostReviews[];
};

export default function BusinessDetail({
  business,
  selectedPostId,
  backUrl,
  owner = null,
  reviews = [],
}: DetailProps) {
  const [tab, setTab] = useState<DetailTab>('menu');
  const [postPending, setPostPending] = useState(false);
  const [postError, setPostError] = useState('');
  const tabBar = useRef<HTMLElement>(null);
  const post = business.posts.find(item => item.id === selectedPostId) ?? business.posts[0];

  const selectPost = (id: number) => {
    if (id === post?.id || postPending) return;
    const destination = '/usaha/' + business.slug + '?' + new URLSearchParams({ post: String(id), from: backUrl });
    router.get(
      destination,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        onStart: () => {
          setPostPending(true);
          setPostError('');
        },
        onError: () => setPostError('Informasi pos belum bisa dimuat. Coba pilih kembali.'),
        onFinish: () => setPostPending(false),
      }
    );
  };

  const { toggleFavorite } = useUi();
  const { mapTiles, auth } = usePage<SharedProps>().props;
  const isSaved = auth.favorites.includes(business.id);
  const updates = business.updates ?? [];
  const postReviews = reviews.find(item => item.post_id === post?.id);
  const rating = postReviews?.rating ?? post?.rating;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'menu', label: 'Menu' },
    { key: 'location', label: 'Lokasi & jadwal' },
    { key: 'reviews', label: 'Ulasan' },
    { key: 'about', label: 'Tentang' },
  ];
  if (business.photo || business.logo || business.gallery?.length) tabs.push({ key: 'photos', label: 'Foto' });
  if (updates.length) tabs.push({ key: 'updates', label: 'Kabar' });

  const activeTab = tabs.some(item => item.key === tab) ? tab : 'menu';
  const contextual = Boolean(post && (activeTab === 'menu' || activeTab === 'reviews'));

  const showTab = (next: DetailTab, scroll = false) => {
    setTab(next);
    const tabEl = document.getElementById('profile-nav-' + next);
    tabEl?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    if (scroll) {
      tabBar.current?.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  };

  const tabKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const nextKey = tabs[next].key;
    showTab(nextKey);
    const nextEl = document.getElementById('profile-nav-' + nextKey);
    nextEl?.focus();
  };

  const favoriteButton = (
    <button
      type="button"
      className={'favorite-button' + (isSaved ? ' is-saved' : '')}
      aria-pressed={isSaved}
      aria-label={(isSaved ? 'Hapus ' : 'Simpan ') + business.name + (isSaved ? ' dari favorit' : ' ke favorit')}
      onClick={() => toggleFavorite(business.slug, business.id)}
    >
      <Heart aria-hidden="true" />
    </button>
  );

  const backLabel = backUrl.startsWith('/peta')
    ? 'Kembali ke peta'
    : backUrl.startsWith('/riwayat')
      ? 'Kembali ke riwayat'
      : backUrl.startsWith('/pemilik')
        ? 'Kembali ke profil pemilik'
        : backUrl.startsWith('/favorit')
          ? 'Kembali ke favorit'
          : 'Kembali ke jelajah';

  return (
    <PhotoViewer>
      <Head title={business.name + (post ? ' · ' + post.name : '')} />
      <div className="business-public">
        {/* Breadcrumb Navigation */}
        <div className="detail-breadcrumb">
          <Link href={backUrl} className="detail-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Hero Cover Banner */}
        {business.photo ? (
          <div className="detail-hero">
            <ProfilePhoto
              src={businessCover(business)}
              alt={'Foto sampul ' + business.name}
              className="profile-cover-photo"
              eager
            />
            <div className="detail-hero-gradient" aria-hidden="true" />
            {favoriteButton}
          </div>
        ) : (
          <div className="profile-cover-empty">
            <Store size={38} aria-hidden="true" />
            {favoriteButton}
          </div>
        )}

        {/* Profile Overview (Modern 2-Zone Layout) */}
        <header className="profile-overview" aria-busy={postPending}>
          <div className="profile-identity-zone">
            <div className="profile-name-and-logo">
              {business.logo && (
                <ProfilePhoto
                  src={business.logo}
                  alt={'Logo ' + business.name}
                  className="profile-business-logo"
                />
              )}
              <div className="profile-title-block">
                <h1>{business.name}</h1>
                <p className="profile-business-category">
                  {business.business_category || businessKindLabel(business.kind)}
                </p>
              </div>
            </div>

            <div className="profile-meta-pills">
              {post && (
                <span className={`profile-status-pill ${postIsOpen(post) ? 'is-open' : 'is-closed'}`}>
                  {postIsOpen(post) ? 'BUKA' : 'TUTUP'}
                </span>
              )}
              {post && postDayHours(post) && (
                <span className="profile-meta-chip">
                  <Clock3 size={13} aria-hidden="true" />
                  <span>{postDayHours(post)}</span>
                </span>
              )}
              <button
                type="button"
                className="profile-rating-pill"
                onClick={() => showTab('reviews', true)}
                aria-label={'Lihat ulasan ' + (post?.name ?? business.name)}
              >
                <Star size={13} className="star-icon" aria-hidden="true" />
                {rating?.count && rating.average !== null ? (
                  <>
                    <strong>{rating.average.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</strong>
                    <span>({rating.count})</span>
                  </>
                ) : (
                  <span>Belum ada ulasan</span>
                )}
              </button>
              {post?.distance != null && (
                <span className="profile-meta-chip">
                  <Navigation size={12} aria-hidden="true" />
                  <span>{distanceLabel(post.distance)}</span>
                </span>
              )}
            </div>

            {owner && (
              <Link
                className="profile-owner-link"
                href={
                  '/pemilik/' +
                  owner.id +
                  '?' +
                  new URLSearchParams({
                    from:
                      '/usaha/' +
                      business.slug +
                      '?' +
                      new URLSearchParams({ ...(post ? { post: String(post.id) } : {}), from: backUrl }),
                  })
                }
              >
                <span>Dikelola oleh <strong>{owner.public_name}</strong></span>
              </Link>
            )}
          </div>

          <div className="profile-action-zone">
            <ProfilePostPicker posts={business.posts} post={post} pending={postPending} onSelect={selectPost} />
            <ProfileVisitActions business={business} post={post} />
          </div>
        </header>

        {post?.closure_note && (
          <p className="profile-closure-note profile-preserve-lines">{post.closure_note}</p>
        )}
        {postError && (
          <p className="form-error" role="alert">
            {postError}
          </p>
        )}

        {/* Tab Navigasi Kapsul Modern (ViVa / MindFuel Harmony) */}
        <nav ref={tabBar} className="detail-tabs" role="tablist" aria-label="Informasi usaha">
          {tabs.map((item, index) => (
            <button
              type="button"
              role="tab"
              key={item.key}
              id={'profile-nav-' + item.key}
              aria-selected={activeTab === item.key}
              tabIndex={activeTab === item.key ? 0 : -1}
              onKeyDown={event => tabKeys(event, index)}
              onClick={() => showTab(item.key)}
              aria-controls="profile-detail-panel"
              className={activeTab === item.key ? 'active' : ''}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main Content Columns: Left Content + Right Sticky Visit Card */}
        <div className={'detail-columns' + (contextual ? '' : ' profile-full-width')}>
          <section
            id="profile-detail-panel"
            role="tabpanel"
            tabIndex={0}
            className={'detail-panel profile-panel-' + activeTab}
            key={'panel-' + business.id + '-' + post?.id}
            aria-labelledby={'profile-nav-' + activeTab}
            aria-busy={postPending}
          >
            {activeTab === 'menu' && <ProfileMenu business={business} post={post} />}
            {activeTab === 'location' && (
              <ProfileLocation
                posts={business.posts}
                post={post}
                onSelect={selectPost}
                mapTiles={mapTiles}
              />
            )}
            <div hidden={activeTab !== 'reviews'}>
              <ProfileReviews business={business} post={post} reviews={postReviews} owner={owner} />
            </div>
            {activeTab === 'about' && <ProfileAbout business={business} post={post} />}
            {activeTab === 'photos' && <ProfilePhotos business={business} />}
            {activeTab === 'updates' && <ProfileUpdates updates={updates} business={business} />}
          </section>

          {contextual && (
            <ProfileVisitCard
              key={'visit-' + business.id + '-' + post?.id}
              post={post}
              mapTiles={mapTiles}
              onLocation={() => showTab('location', true)}
            />
          )}
        </div>
      </div>
    </PhotoViewer>
  );
}

BusinessDetail.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
