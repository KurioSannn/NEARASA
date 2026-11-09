import { ArrowUpRight, ChevronDown, FileText, Utensils } from 'lucide-react';
import { menuSoldOut, rupiah, type Business, type SellingPost } from '@/types/catalog';
import { ProfilePhoto } from './ProfilePhotos';
import { trackInteraction } from './profile-utils';

export default function ProfileMenu({ business, post }: { business: Business; post?: SellingPost }) {
  const allSoldOut = business.menus.length > 0 && business.menus.every(menu => menuSoldOut(menu, post?.id));
  const groups = [...new Set(business.menus.map(menu => menu.group || 'Menu lainnya'))];

  return (
    <>
      <div className="section-header">
        <div>
          <h2>Daftar Menu</h2>
          {post && <p className="profile-menu-post">Ketersediaan menu di {post.name}.</p>}
        </div>
      </div>

      {allSoldOut && (
        <p className="profile-stock-note" role="status">
          Semua menu di pos ini sedang habis. Status buka tetap mengikuti jadwal pemilik.
        </p>
      )}

      {business.menu_pdf && (
        <a className="profile-pdf-link" href={business.menu_pdf} target="_blank" rel="noopener noreferrer">
          <FileText size={18} aria-hidden="true" />
          <span>Unduh daftar menu PDF</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      )}

      {!business.menus.length && (
        <div className="profile-empty-state">
          <Utensils size={30} aria-hidden="true" />
          <h3>Menu belum tersedia</h3>
          <p>Pemilik belum menambahkan daftar menu untuk usaha ini.</p>
        </div>
      )}

      {groups.length > 1 && (
        <div className="profile-menu-quick-groups" role="navigation" aria-label="Lompat ke kelompok menu">
          {groups.map(group => (
            <a key={group} href={`#menu-group-${encodeURIComponent(group)}`} className="menu-group-chip">
              {group}
            </a>
          ))}
        </div>
      )}

      <div className="profile-menu-groups">
        {groups.map(group => (
          <section
            className="profile-menu-group"
            id={`menu-group-${encodeURIComponent(group)}`}
            key={group}
            aria-label={group}
          >
            <h3 className="profile-group-title">{group}</h3>
            <div className="menu-list">
              {business.menus
                .filter(menu => (menu.group || 'Menu lainnya') === group)
                .map(menu => {
                  const soldOut = menuSoldOut(menu, post?.id);
                  const track = () => {
                    if (post) trackInteraction(business.id, post.id, 'menu_open', menu.id);
                  };
                  return (
                    <article
                      className={`menu-item profile-menu-item ${soldOut ? 'is-sold-out' : ''}`}
                      key={String(post?.id) + '-' + menu.id}
                    >
                      {menu.photo ? (
                        <div className="profile-menu-photo-wrap">
                          <ProfilePhoto
                            src={menu.photo}
                            alt={menu.name}
                            caption={menu.description || undefined}
                            className="profile-menu-photo"
                            onOpen={track}
                          />
                          {soldOut && <span className="profile-photo-sold-out">Habis</span>}
                        </div>
                      ) : (
                        <span className="profile-menu-no-photo" aria-hidden="true">
                          <Utensils size={22} />
                        </span>
                      )}
                      <div className="profile-menu-main">
                        <div className="profile-menu-title-row">
                          <h4>{menu.name}</h4>
                          {soldOut && <span className="profile-sold-badge">Habis di pos ini</span>}
                        </div>
                        {menu.description && (
                          <p className="profile-menu-description profile-preserve-lines">{menu.description}</p>
                        )}
                        <strong className="profile-menu-price">{rupiah(menu.price)}</strong>
                        {(menu.description || menu.category) && (
                          <details className="profile-menu-details">
                            <summary
                              onClick={event => {
                                if (!(event.currentTarget.parentElement as HTMLDetailsElement).open) track();
                              }}
                            >
                              <span>Rincian menu</span>
                              <ChevronDown size={14} aria-hidden="true" />
                            </summary>
                            {menu.category && <p className="menu-detail-cat">Kategori: {menu.category}</p>}
                            {menu.description && <p className="profile-preserve-lines">{menu.description}</p>}
                          </details>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
