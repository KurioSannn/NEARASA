import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, FileText, MapPin, Search, Utensils, X } from 'lucide-react';
import { menuSoldOut, rupiah, type Business, type SellingPost } from '@/types/catalog';
import { ProfilePhoto } from './ProfilePhotos';
import { trackInteraction } from './profile-utils';

export default function ProfileMenu({ business, post }: { business: Business; post?: SellingPost }) {
  const [activeGroup, setActiveGroup] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allSoldOut = business.menus.length > 0 && business.menus.every(menu => menuSoldOut(menu, post?.id));
  const rawGroups = useMemo(
    () => [...new Set(business.menus.map(menu => menu.group || 'Menu lainnya'))],
    [business.menus]
  );

  const filterOptions = useMemo(() => ['Semua', ...rawGroups], [rawGroups]);

  // Filter menus based on active category chip and search query
  const filteredMenus = useMemo(() => {
    let list = business.menus;
    if (activeGroup !== 'Semua') {
      list = list.filter(m => (m.group || 'Menu lainnya') === activeGroup);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [business.menus, activeGroup, searchQuery]);

  // Groups to render
  const visibleGroups = useMemo(() => {
    if (activeGroup !== 'Semua') {
      return [activeGroup];
    }
    const activeGroupsInFiltered = new Set(filteredMenus.map(m => m.group || 'Menu lainnya'));
    return rawGroups.filter(g => activeGroupsInFiltered.has(g));
  }, [activeGroup, filteredMenus, rawGroups]);

  return (
    <div className="profile-menu-container">
      {/* 1. Header Row: Title & Subtitle on left, Search input on right */}
      <div className="profile-menu-header-row">
        <div className="profile-menu-title-block">
          <h2>Daftar Menu</h2>
          {post && (
            <p className="profile-menu-subtitle">
              <span>Ketersediaan menu di {post.name}.</span>
              <span className="profile-menu-loc-pin" aria-hidden="true">
                <MapPin size={13} />
              </span>
            </p>
          )}
        </div>

        {business.menus.length > 0 && (
          <div className="profile-menu-search-box">
            <Search size={15} className="profile-menu-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari menu di pos ini..."
              aria-label="Cari menu di pos ini"
              className="profile-menu-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="profile-menu-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Category Filter Pills */}
      {filterOptions.length > 1 && (
        <div className="profile-menu-filter-chips" role="tablist" aria-label="Kategori menu">
          {filterOptions.map(option => {
            const isActive = activeGroup === option;
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`profile-menu-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveGroup(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

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

      {business.menus.length > 0 && filteredMenus.length === 0 && (
        <div className="profile-empty-state profile-menu-search-empty">
          <Search size={28} aria-hidden="true" />
          <h3>Menu tidak ditemukan</h3>
          <p>Tidak ada menu yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setSearchQuery('');
              setActiveGroup('Semua');
            }}
          >
            Lihat semua menu
          </button>
        </div>
      )}

      {/* 3. Grouped 2-Column Card Grid */}
      <div className="profile-menu-groups">
        {visibleGroups.map(group => {
          const items = filteredMenus.filter(menu => (menu.group || 'Menu lainnya') === group);
          if (!items.length) return null;

          return (
            <section
              className="profile-menu-group"
              id={`menu-group-${encodeURIComponent(group)}`}
              key={group}
              aria-label={group}
            >
              <h3 className="profile-group-title">{group}</h3>

              <div className="profile-menu-grid">
                {items.map(menu => {
                  const soldOut = menuSoldOut(menu, post?.id);
                  const track = () => {
                    if (post) trackInteraction(business.id, post.id, 'menu_open', menu.id);
                  };

                  return (
                    <article
                      className={`profile-menu-card-ref ${soldOut ? 'is-sold-out' : ''}`}
                      key={String(post?.id) + '-' + menu.id}
                    >
                      {/* Left: Info Block */}
                      <div className="profile-menu-card-info">
                        {/* Top Badge Row */}
                        <div className="profile-menu-card-badges">
                          {menu.category && (
                            <span className="profile-menu-badge-cat">{menu.category}</span>
                          )}
                          {soldOut ? (
                            <span className="profile-menu-badge-stock is-soldout">
                              <X size={11} strokeWidth={2.8} aria-hidden="true" />
                              <span>Habis</span>
                            </span>
                          ) : (
                            <span className="profile-menu-badge-stock is-available">
                              <Check size={11} strokeWidth={2.8} aria-hidden="true" />
                              <span>Tersedia</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="profile-menu-card-title">{menu.name}</h4>

                        {/* Price */}
                        <strong className="profile-menu-card-price">{rupiah(menu.price)}</strong>

                        {/* Description */}
                        {menu.description && (
                          <p className="profile-menu-card-desc profile-preserve-lines">
                            {menu.description}
                          </p>
                        )}
                      </div>

                      {/* Right: Photo Container */}
                      <div className="profile-menu-card-photo-col">
                        {menu.photo ? (
                          <div className="profile-menu-card-photo-wrap">
                            <ProfilePhoto
                              src={menu.photo}
                              alt={menu.name}
                              caption={menu.description || undefined}
                              className="profile-menu-card-photo-btn"
                              onOpen={track}
                            />
                            {soldOut && (
                              <div className="profile-menu-photo-soldout-overlay" aria-hidden="true" />
                            )}
                          </div>
                        ) : (
                          <div className="profile-menu-card-no-photo" aria-hidden="true">
                            <Utensils size={24} />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
