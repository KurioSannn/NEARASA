import { Head, Link, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Eye,
  Heart,
  History as HistoryIcon,
  Map,
  MessageCircle,
} from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import ConsumerPhoto from '@/components/ConsumerPhoto';
import { PostFacts } from '@/components/DiscoveryResultCard';
import { businessCover } from '@/types/business-images';
import { cardKey, rupiah, type HistoryCard } from '@/types/catalog';
import { activityDateLabel, businessDetailUrl, menuPriceRange } from '@/types/consumer-pages';

const activities = {
  profile_view: ['Profil dilihat', Eye],
  menu_open: ['Menu dibuka', BookOpen],
  map_click: ['Peta dibuka', Map],
  whatsapp_click: ['WhatsApp dibuka', MessageCircle],
  favorite: ['Usaha disimpan', Heart],
} as const;

function HistoryEntry({ business }: { business: HistoryCard }) {
  const { url } = usePage();
  const activity = business.activity ? activities[business.activity.type] : null;
  const Icon = activity?.[1];
  const date = activityDateLabel(business.activity?.at);
  const range = menuPriceRange(business.menus);

  return (
    <article className="consumer-history-entry-wrap">
      <Link
        className="consumer-history-entry"
        href={businessDetailUrl(business, url)}
        aria-label={`Buka pos ${business.name}, ${business.post.name}`}
      >
        <div className="consumer-history-cover">
          <ConsumerPhoto src={businessCover(business)} alt={`Foto ${business.name}`} />
        </div>

        <div className="consumer-history-body">
          {activity && (
            <div className="consumer-history-activity">
              {Icon && <Icon size={13} aria-hidden="true" />}
              <span className="activity-label">{activity[0]}</span>
              {date && (
                <>
                  <span className="activity-dot" aria-hidden="true">
                    ·
                  </span>
                  <time dateTime={business.activity!.at!} className="activity-time">
                    {date}
                  </time>
                </>
              )}
            </div>
          )}

          <div className="consumer-history-title-row">
            <h3 className="consumer-history-title">{business.name}</h3>
            <span className="consumer-history-post-badge">{business.post.name}</span>
          </div>

          <div className="consumer-history-facts-wrap">
            <PostFacts business={business} address distance={false} />
          </div>

          <div className="consumer-history-price">
            <span className="price-tag-label">{range?.label ?? 'Daftar menu'}</span>
            <strong className="price-tag-value">
              {range
                ? `${rupiah(range.min)}${range.min !== range.max ? ` – ${rupiah(range.max)}` : ''}`
                : 'Belum tersedia'}
            </strong>
          </div>
        </div>

        <div className="consumer-history-action" aria-hidden="true">
          <span>Buka Usaha</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </div>
      </Link>
    </article>
  );
}

export default function History({ businesses }: { businesses: HistoryCard[] }) {
  const activity = businesses.filter(business => business.activity?.type !== 'favorite');
  const saved = businesses.filter(business => business.activity?.type === 'favorite');

  return (
    <>
      <Head title="Riwayat Penjelajahan" />
      <div className="consumer-collection-page">
        <div className="collection-back-wrap">
          <Link className="collection-back-pill" href="/akun">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Kembali ke akun</span>
          </Link>
        </div>

        <header className="collection-page-heading">
          <span className="collection-page-kicker">Aktivitas & Jejak</span>
          <h1>Riwayat Penjelajahan</h1>
          <p>
            Warung dan pos jualan kuliner yang baru saja kamu lihat di NEARASA. Jadwal buka dan harga selalu mengikuti kondisi
            terbaru.
          </p>
        </header>

        {businesses.length ? (
          <div className="history-sections-stack">
            {activity.length > 0 && (
              <section className="consumer-history-section" aria-labelledby="history-activity-title">
                <div className="history-section-header">
                  <h2 id="history-activity-title">Aktivitas Terakhir</h2>
                  <p>Warung makan dan pos jualan yang baru saja kamu buka atau jelajahi.</p>
                </div>
                <div className="consumer-history-list">
                  {activity.map(business => (
                    <HistoryEntry business={business} key={cardKey(business)} />
                  ))}
                </div>
              </section>
            )}

            {saved.length > 0 && (
              <section className="consumer-history-section" aria-labelledby="history-saved-title">
                <div className="history-section-header">
                  <h2 id="history-saved-title">Dari Warung Favoritmu</h2>
                  <p>Tempat kuliner tersimpan yang baru-baru ini kamu tandai.</p>
                </div>
                <div className="consumer-history-list">
                  {saved.map(business => (
                    <HistoryEntry business={business} key={cardKey(business)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <section className="collection-empty">
            <HistoryIcon size={34} aria-hidden="true" />
            <h2>Belum Ada Jejak Penjelajahan</h2>
            <p>
              Pos yang kamu lihat dan warung makan yang disimpan akan otomatis muncul di sini agar mudah kamu temukan kembali.
            </p>
            <Link className="button" href="/jelajah">
              Mulai Jelajah Kuliner
            </Link>
          </section>
        )}
      </div>
    </>
  );
}

History.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
