import { ChevronDown, Clock3, MapPin } from 'lucide-react';
import LocationMap from '@/components/LocationMap';
import { days, facilityChoices, paymentChoices, serviceChoices } from '@/types/business-profile';
import type { Business, SellingPost } from '@/types/catalog';
import { dateLabel, hoursLabel, postIsOpen, postStatus } from './profile-utils';
import ProfileClosedReport from './ProfileClosedReport';

function PostAmenities({ post }: { post: SellingPost }) {
  const groups = [
    { title: 'Layanan', items: serviceChoices.filter(([key]) => post.service_options?.includes(key)) },
    { title: 'Fasilitas', items: facilityChoices.filter(([key]) => post.facilities?.includes(key)) },
    { title: 'Pembayaran', items: paymentChoices.filter(([key]) => post.payment_methods?.includes(key)) },
  ].filter(group => group.items.length > 0);
  if (!groups.length && !post.service_area) return null;
  return <details className="profile-post-amenities"><summary>Layanan di pos ini<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="profile-amenities-content">{groups.map(group => <div className="profile-amenity-group" key={group.title}><h4>{group.title}</h4><ul>{group.items.map(([key, label]) => <li key={key}>{label}</li>)}</ul></div>)}
    {post.service_area && <div className="profile-service-area"><h4>Area layanan</h4><p className="profile-preserve-lines">{post.service_area}</p></div>}</div>
  </details>;
}
function PostHours({ post }: { post: SellingPost }) {
  const specialHours = [...(post.special_hours ?? [])];
  for (const date of post.closed_dates ?? []) {
    if (!specialHours.some(hours => hours.date === date)) specialHours.push({ date, is_closed: true, all_day: false, opens_at: null, closes_at: null });
  }
  specialHours.sort((a, b) => a.date.localeCompare(b.date));
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(new Date());
  const isOpen = postIsOpen(post);

  return (
    <div className="profile-hours">
      <section aria-labelledby="profile-regular-hours-title">
        <div className="profile-hours-header">
          <div>
            <h3 id="profile-regular-hours-title">Jam Buka</h3>
            <span className="profile-hours-tz">WIB · Waktu Indonesia Barat</span>
          </div>
          <span className={`profile-live-pill ${isOpen ? 'is-open' : 'is-closed'}`}>
            <span className="live-dot" aria-hidden="true" />
            {isOpen ? 'Buka Sekarang' : 'Tutup'}
          </span>
        </div>

        {post.schedules.length ? (
          <dl className="schedule-list">
            {days.slice(1).map((day, index) => {
              const isToday = day.toLocaleLowerCase('id-ID') === today.toLocaleLowerCase('id-ID');
              const sessions = post.schedules
                .filter(hours => hours.weekday === index + 1)
                .sort((a, b) => a.opens_at.localeCompare(b.opens_at));
              return (
                <div className={`schedule-row ${isToday ? 'is-today' : ''}`} key={day}>
                  <dt>
                    <span className="day-name">{day}</span>
                    {isToday && <span className="today-badge">Hari ini</span>}
                  </dt>
                  <dd>
                    {sessions.length ? (
                      sessions.map((hours, sessionIndex) => (
                        <span key={hours.opens_at + '-' + sessionIndex}>
                          {hoursLabel(hours).replaceAll(':', '.')}
                        </span>
                      ))
                    ) : (
                      <span className="is-off">Libur</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="profile-section-intro">Jadwal operasional belum diisi.</p>
        )}
      </section>

      {specialHours.length > 0 && (
        <details className="profile-special-hours">
          <summary>
            <span>Jadwal Khusus & Libur</span>
            <ChevronDown size={15} aria-hidden="true" />
          </summary>
          <p className="profile-section-intro">Menggantikan jam operasional rutin pada tanggal tertentu.</p>
          <dl className="schedule-list">
            {specialHours.map(hours => (
              <div className="schedule-row" key={hours.date}>
                <dt>
                  <time dateTime={hours.date}>{dateLabel(hours.date)}</time>
                </dt>
                <dd>{hoursLabel(hours).replaceAll(':', '.')}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
export default function ProfileLocation({ business, posts, post, onSelect, mapTiles, ownerId }: { business: Business; posts: SellingPost[]; post?: SellingPost; onSelect: (id: number) => void; mapTiles: string; ownerId?: number }) {
  if (!post) return <div className="profile-empty-state"><MapPin size={30} aria-hidden="true" /><h2>Lokasi belum tersedia</h2><p>Pemilik belum menambahkan pos jualan.</p></div>;
  const others = posts.filter(item => item.id !== post.id);
  return <div className="profile-location-layout">
    <div className="profile-location-main"><section className="profile-location-card" aria-labelledby="profile-location-title">
      <h2 id="profile-location-title">{post.name}</h2><p className="profile-address"><MapPin size={18} aria-hidden="true" />{post.address}</p>
      {post.landmark && <p className="profile-landmark"><strong>Patokan</strong><span className="profile-preserve-lines">{post.landmark}</span></p>}
      <LocationMap key={post.id} latitude={post.latitude} longitude={post.longitude} tileUrl={mapTiles} />
      <PostAmenities post={post} />
      <ProfileClosedReport business={business} post={post} ownerId={ownerId} />
    </section></div>
    <div className="profile-location-sidebar"><section className="profile-hours-card"><PostHours post={post} /></section>
      {others.length > 0 && <section className="profile-other-posts"><h3>Pos lain usaha ini</h3>{others.map(item => <article key={item.id}><h4>{item.name}</h4><p>{item.address}</p><p className={'profile-open-status' + (postIsOpen(item) ? ' is-open' : '')}><span aria-hidden="true" />{postStatus(item)}</p><button type="button" className="button button-outline" onClick={() => onSelect(item.id)} aria-label={'Pilih pos ' + item.name}>Pilih pos</button></article>)}</section>}
    </div>
  </div>;
}
