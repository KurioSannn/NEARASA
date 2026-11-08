import { ArrowUpRight } from 'lucide-react';
import type { BusinessUpdate } from '@/types/business-profile';
import type { Business } from '@/types/catalog';
import { dateLabel, externalUrl } from './profile-utils';
import { ProfilePhoto } from './ProfilePhotos';

const labels = { update: 'Kabar usaha', offer: 'Penawaran', event: 'Acara' };
export default function ProfileUpdates({ updates, business }: { updates: BusinessUpdate[]; business: Business }) {
  return <><h2>Kabar dari {business.name}</h2><div className="profile-updates">{updates.map(update => {
    const href = externalUrl(update.cta_url);
    return <article className={'profile-update' + (update.photo ? '' : ' update-without-photo')} key={update.id}>
      {update.photo && <ProfilePhoto src={update.photo} alt={update.title} className="profile-update-photo" />}
      <div className="profile-update-copy">
        <header className="profile-update-author"><span className="profile-update-avatar" aria-hidden="true">{business.name.charAt(0).toLocaleUpperCase('id-ID')}</span><div><strong>{business.name}</strong><span>{labels[update.type]}</span></div></header>
        <h3>{update.title}</h3><p className="profile-update-body profile-preserve-lines">{update.body}</p>
        {(update.starts_on || update.ends_on) && <p className="profile-update-dates">{update.starts_on && <span>Mulai <time dateTime={update.starts_on}>{dateLabel(update.starts_on)}</time></span>}{update.ends_on && <span>Sampai <time dateTime={update.ends_on}>{dateLabel(update.ends_on)}</time></span>}</p>}
        {href && <><a className="text-link profile-update-link" href={href} target="_blank" rel="noopener noreferrer">{update.cta_label || 'Lihat selengkapnya'}<ArrowUpRight size={17} aria-hidden="true" /></a><small className="profile-external-note">Membuka situs atau layanan penyedia di tab baru.</small></>}
      </div>
    </article>;
  })}</div></>;
}
