import { ArrowUpRight, ChevronDown, Globe, Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import type { Business, SellingPost } from '@/types/catalog';
import { actionChoices, socialChoices } from '@/types/business-profile';
import { businessKindLabel, dateLabel, externalUrl, trackInteraction, websiteLabel, whatsappUrl } from './profile-utils';

function ContactLink({ href, label, value, icon: Icon, external = false, onClick }: { href: string; label: string; value: string; icon: LucideIcon; external?: boolean; onClick?: () => void }) {
  return <li><a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} onClick={onClick} aria-label={external ? label + ': ' + value + ', buka di tab baru' : undefined}>
    <Icon size={23} aria-hidden="true" /><span><small>{label}</small><strong>{value}</strong></span>{external && <ArrowUpRight size={18} aria-hidden="true" />}
  </a></li>;
}
const actionLabels: Record<string, string> = { menu: 'Buka daftar menu', ordering: 'Buka pemesanan', reservation: 'Buka reservasi', gofood: 'Lanjut ke GoFood', grabfood: 'Lanjut ke GrabFood', shopeefood: 'Lanjut ke ShopeeFood' };

export default function ProfileAbout({ business, post }: { business: Business; post?: SellingPost }) {
  const website = externalUrl(business.website);
  const whatsapp = whatsappUrl(business.whatsapp);
  const socialLinks = socialChoices.flatMap(([key, label]) => {
    const href = externalUrl(business.social_links?.[key]);
    return href ? [{ key, label, href }] : [];
  });
  const actionLinks = actionChoices.flatMap(([key, label]) => {
    const href = externalUrl(business.action_links?.[key]);
    return href ? [{ key, label: actionLabels[key] ?? label, href }] : [];
  });
  const hasContact = Boolean(business.phone || whatsapp || business.contact_email || website || socialLinks.length || actionLinks.length);
  const additionalCategories = (business.additional_categories ?? []).filter(category => category && category !== business.business_category);
  return <>
    <div className={'profile-about-layout' + (hasContact ? '' : ' no-contact')}>
      <section className="profile-about-story" aria-labelledby="profile-about-title">
        <h2 id="profile-about-title">Tentang usaha</h2>
        {business.description && <p className="about-copy profile-preserve-lines">{business.description}</p>}
        <dl className="profile-facts">
          {business.business_category && <div><dt>Jenis usaha</dt><dd>{business.business_category}</dd></div>}
          {additionalCategories.length > 0 && <div><dt>Kategori lain</dt><dd>{additionalCategories.join(', ')}</dd></div>}
          {business.kind && <div><dt>Bentuk tempat jualan</dt><dd>{businessKindLabel(business.kind)}</dd></div>}
          {business.opened_on && <div><dt>Mulai beroperasi</dt><dd><time dateTime={business.opened_on}>{dateLabel(business.opened_on)}</time></dd></div>}
        </dl>
      </section>
      {hasContact && <section className="profile-about-contact" aria-labelledby="profile-contact-title">
        <h2 id="profile-contact-title">Hubungi usaha</h2>
        <ul className="profile-contact-list">
          {business.phone && <ContactLink href={'tel:' + business.phone.replace(/[^\d+]/g, '')} label="Telepon" value={business.phone} icon={Phone} />}
          {whatsapp && <ContactLink href={whatsapp} label="WhatsApp" value={business.whatsapp!} icon={MessageCircle} external onClick={() => { if (post) trackInteraction(business.id, post.id, 'whatsapp_click'); }} />}
          {business.contact_email && <ContactLink href={'mailto:' + encodeURIComponent(business.contact_email)} label="Email" value={business.contact_email} icon={Mail} />}
          {website && <ContactLink href={website} label="Situs web" value={websiteLabel(website)} icon={Globe} external />}
          {socialLinks.map(link => <ContactLink key={link.key} href={link.href} label={link.label} value={websiteLabel(link.href) + new URL(link.href).pathname.replace(/\/$/, '')} icon={Globe} external />)}
        </ul>
        {actionLinks.length > 0 && <details className="profile-action-disclosure"><summary>Menu, pemesanan & reservasi<ChevronDown size={18} aria-hidden="true" /></summary>
          <ul className="profile-action-links">{actionLinks.map(link => <li key={link.key}><a className="text-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={17} aria-hidden="true" /></a></li>)}</ul>
          <p className="profile-section-intro">Tautan disediakan oleh pemilik dan membuka layanan lain.</p>
        </details>}
      </section>}
    </div>
    {business.is_demo && <p className="demo-note">Profil ini memakai data contoh dan foto ilustrasi untuk mencoba NEARASA. Usaha dan titik jualannya bukan listing pedagang nyata.</p>}
  </>;
}
