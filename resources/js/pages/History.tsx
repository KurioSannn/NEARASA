import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ChevronRight, Heart, History as HistoryIcon, Map, MessageCircle, Eye } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import ConsumerPhoto from '@/components/ConsumerPhoto';
import { PostFacts } from '@/components/DiscoveryResultCard';
import { businessCover } from '@/types/business-images';
import { cardKey, rupiah, type HistoryCard } from '@/types/catalog';
import { activityDateLabel, businessDetailUrl, menuPriceRange } from '@/types/consumer-pages';

const activities = { profile_view: ['Profil dilihat', Eye], menu_open: ['Menu dibuka', BookOpen], map_click: ['Peta dibuka', Map], whatsapp_click: ['WhatsApp dibuka', MessageCircle], favorite: ['Usaha disimpan', Heart] } as const;
function HistoryEntry({ business }: { business: HistoryCard }) {
  const { url } = usePage();
  const activity = business.activity ? activities[business.activity.type] : null;
  const Icon = activity?.[1];
  const date = activityDateLabel(business.activity?.at);
  const range = menuPriceRange(business.menus);
  return <Link className="consumer-history-entry" href={businessDetailUrl(business, url)}><ConsumerPhoto src={businessCover(business)} /><div className="consumer-history-body">{activity && <p className="consumer-history-activity">{Icon && <Icon size={19} aria-hidden="true" />}<span>{activity[0]}{date && <time dateTime={business.activity!.at!}>{date}</time>}</span></p>}<h3>{business.name}</h3><p className="consumer-history-post">{business.post.name}</p><PostFacts business={business} address /><div className="consumer-history-price"><span>{range?.label ?? 'Daftar menu'}</span><strong>{range ? `${rupiah(range.min)}${range.min !== range.max ? `–${rupiah(range.max)}` : ''}` : 'Belum tersedia'}</strong></div></div><ChevronRight className="consumer-history-arrow" size={23} aria-hidden="true" /></Link>;
}

export default function History({ businesses }: { businesses: HistoryCard[] }) {
  const activity = businesses.filter(business => business.activity?.type !== 'favorite');
  const saved = businesses.filter(business => business.activity?.type === 'favorite');
  return <><Head title="Riwayat penjelajahan" /><div className="consumer-collection-page"><Link className="collection-back" href="/akun"><ArrowLeft size={17} aria-hidden="true" />Kembali ke akun</Link><header className="collection-page-heading"><h1>Riwayat penjelajahan</h1><p>Aktivitasmu di NEARASA. Informasi usaha mengikuti kondisi terbaru.</p></header>
    {businesses.length ? <>{activity.length > 0 && <section className="consumer-history-section" aria-labelledby="history-activity-title"><h2 id="history-activity-title">Aktivitas terakhir</h2><div className="consumer-history-list">{activity.map(business => <HistoryEntry business={business} key={cardKey(business)} />)}</div></section>}{saved.length > 0 && <section className="consumer-history-section" aria-labelledby="history-saved-title"><h2 id="history-saved-title">Dari Favoritmu</h2><p>Usaha tersimpan untuk kamu lihat lagi.</p><div className="consumer-history-list">{saved.map(business => <HistoryEntry business={business} key={cardKey(business)} />)}</div></section>}</> : <section className="collection-empty"><HistoryIcon size={34} aria-hidden="true" /><h2>Belum ada jejak penjelajahan</h2><p>Pos yang kamu lihat dan usaha yang disimpan akan muncul di sini. Riwayat ini mencatat aktivitas aplikasi, bukan kunjungan fisik.</p><Link className="button" href="/jelajah">Jelajah makanan</Link></section>}
  </div></>;
}
History.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
