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

  // Collect post amenities if available for a richer summary
  const amenitiesList = [
    ...(post?.service_options ?? []),
    ...(post?.facilities ?? []),
    ...(post?.payment_methods ?? []),
  ].filter(Boolean);

  return (
    <>
      <div className={`profile-about-layout ${hasContact ? 'has-contact' : 'single-col'}`}>
        <section className="profile-about-story" aria-labelledby="profile-about-title">
          <header className="profile-about-header">
            <div className="profile-about-title-row">
              <h2 id="profile-about-title">Tentang {business.name}</h2>
              {business.business_category && (
                <div className="profile-category-pills">
                  <span className="profile-cat-pill primary">{business.business_category}</span>
                  {additionalCategories.map(cat => (
                    <span key={cat} className="profile-cat-pill">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {business.description && (
            <p className="about-copy profile-preserve-lines">{business.description}</p>
          )}

          {/* Minimalist Modern Editorial Dossier */}
          <div className="profile-about-dossier">
            <h3 className="dossier-heading">Informasi Usaha</h3>
            <dl className="dossier-list">
              <div className="dossier-row">
                <dt>Format Gerai</dt>
                <dd>{businessKindLabel(business.kind)}</dd>
              </div>
              <div className="dossier-row">
                <dt>Kategori</dt>
                <dd>{business.business_category || 'Kuliner Lokal'}</dd>
              </div>
              <div className="dossier-row">
                <dt>Titik Jualan</dt>
                <dd>{post?.name || 'Pos Terdaftar'}</dd>
              </div>
              <div className="dossier-row">
                <dt>Status Operasional</dt>
                <dd>
                  {business.opened_on ? `Berjalan sejak ${dateLabel(business.opened_on)}` : 'Aktif terverifikasi di NEARASA'}
                </dd>
              </div>
            </dl>
          </div>

          {amenitiesList.length > 0 && (
            <div className="profile-about-amenities-strip">
              <span className="strip-title">Layanan & Fasilitas Pos:</span>
              <div className="strip-pills">
                {amenitiesList.map(item => (
                  <span key={item} className="strip-pill">{item}</span>
                ))}
              </div>
            </div>
          )}

          {!hasContact && (
            <div className="profile-hospitality-card">
              <span className="hospitality-pill">Layanan Langsung</span>
              <p className="hospitality-desc">
                Pemesanan dan pelayanan dilayani langsung di pos jualan <strong>{post?.name ?? business.name}</strong> sesuai jadwal operasional yang berlaku. Silakan berkunjung ke lokasi untuk memesan.
              </p>
            </div>
          )}
        </section>

        {hasContact && (
          <section className="profile-about-contact" aria-labelledby="profile-contact-title">
            <h2 id="profile-contact-title">Kontak & Pemesanan</h2>
            <ul className="profile-contact-list">
              {business.phone && <ContactLink href={'tel:' + business.phone.replace(/[^\d+]/g, '')} label="Telepon" value={business.phone} icon={Phone} />}
              {whatsapp && <ContactLink href={whatsapp} label="WhatsApp" value={business.whatsapp!} icon={MessageCircle} external onClick={() => { if (post) trackInteraction(business.id, post.id, 'whatsapp_click'); }} />}
              {business.contact_email && <ContactLink href={'mailto:' + encodeURIComponent(business.contact_email)} label="Email" value={business.contact_email} icon={Mail} />}
              {website && <ContactLink href={website} label="Situs web" value={websiteLabel(website)} icon={Globe} external />}
              {socialLinks.map(link => <ContactLink key={link.key} href={link.href} label={link.label} value={websiteLabel(link.href) + new URL(link.href).pathname.replace(/\/$/, '')} icon={Globe} external />)}
            </ul>
            {actionLinks.length > 0 && (
              <details className="profile-action-disclosure">
                <summary>Menu, pemesanan & reservasi<ChevronDown size={16} aria-hidden="true" /></summary>
                <ul className="profile-action-links">
                  {actionLinks.map(link => (
                    <li key={link.key}>
                      <a className="text-link" href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="profile-section-intro">Tautan eksternal yang disediakan pengelola gerai.</p>
              </details>
            )}
          </section>
        )}
      </div>

      {business.is_demo && (
        <p className="demo-note">
          Profil ini memakai data contoh dan foto ilustrasi untuk mencoba NEARASA. Usaha dan titik jualannya bukan listing pedagang nyata.
        </p>
      )}
    </>
  );
}
