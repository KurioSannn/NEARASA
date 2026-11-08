import { ArrowUpRight, ChevronDown, FileText, Utensils } from 'lucide-react';
import { menuSoldOut, rupiah, type Business, type SellingPost } from '@/types/catalog';
import { ProfilePhoto } from './ProfilePhotos';
import { trackInteraction } from './profile-utils';

export default function ProfileMenu({ business, post }: { business: Business; post?: SellingPost }) {
  const allSoldOut = business.menus.length > 0 && business.menus.every(menu => menuSoldOut(menu, post?.id));
  const groups = [...new Set(business.menus.map(menu => menu.group || 'Menu lainnya'))];
  return <>
    <div className="section-header"><div><h2>Menu</h2>{post && <p className="profile-menu-post">Ketersediaan di {post.name}.</p>}</div></div>
    {allSoldOut && <p className="profile-stock-note" role="status">Semua menu di pos ini sedang habis. Status buka tetap mengikuti jadwal pemilik.</p>}
    {business.menu_pdf && <a className="profile-pdf-link" href={business.menu_pdf} target="_blank" rel="noopener noreferrer"><FileText size={19} aria-hidden="true" /><span>Unduh daftar menu PDF</span><ArrowUpRight size={16} aria-label="Buka di tab baru" /></a>}
    {!business.menus.length && <div className="profile-empty-state"><Utensils size={30} aria-hidden="true" /><h3>Menu belum tersedia</h3><p>Pemilik belum menambahkan daftar menu untuk usaha ini.</p></div>}
    <div className="profile-menu-groups">{groups.map(group => <section className="profile-menu-group" key={group} aria-label={group}><h3>{group}</h3><div className="menu-list">
      {business.menus.filter(menu => (menu.group || 'Menu lainnya') === group).map(menu => {
        const soldOut = menuSoldOut(menu, post?.id);
        const track = () => { if (post) trackInteraction(business.id, post.id, 'menu_open', menu.id); };
        return <article className={'menu-item profile-menu-item' + (soldOut ? ' is-sold-out' : '')} key={String(post?.id) + '-' + menu.id}>
          {menu.photo ? <div className="profile-menu-photo-wrap"><ProfilePhoto src={menu.photo} alt={menu.name} caption={menu.description || undefined} className="profile-menu-photo" onOpen={track} />{soldOut && <span className="profile-photo-sold-out">Habis di pos ini</span>}</div> : <span className="profile-menu-no-photo" aria-hidden="true"><Utensils size={24} /></span>}
          <div className="profile-menu-main"><h4>{menu.name}</h4>{menu.description && <p className="profile-menu-description profile-preserve-lines">{menu.description}</p>}<strong>{rupiah(menu.price)}</strong>
            {(menu.description || menu.category) && <details className="profile-menu-details"><summary onClick={event => { if (!(event.currentTarget.parentElement as HTMLDetailsElement).open) track(); }}>Rincian menu<ChevronDown size={15} aria-hidden="true" /></summary>{menu.category && <p>Kategori: {menu.category}</p>}{menu.description && <p className="profile-preserve-lines">{menu.description}</p>}</details>}
          </div>
          <span className={'profile-menu-availability' + (soldOut ? ' is-sold-out' : '')}><i aria-hidden="true" />{soldOut ? 'Habis di pos ini' : 'Tersedia'}</span>
        </article>;
      })}
    </div></section>)}</div>
  </>;
}
