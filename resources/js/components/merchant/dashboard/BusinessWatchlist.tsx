import { Link } from '@inertiajs/react';
import { ArrowUpRight, Store, Utensils } from 'lucide-react';
import { businessCover } from '@/types/business-images';
import { managementUrl, type OwnedBusiness } from '@/types/merchant';

export default function BusinessWatchlist({ businesses, totalPosts }: {
  businesses: OwnedBusiness[];
  totalPosts: number;
}) {
  const topBusinesses = businesses.slice(0, 3);
  return (
    <div className="xl:col-span-4 bg-white p-5 rounded-3xl border border-sand-border shadow-soft flex flex-col justify-between" data-purpose="investments-card">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-clay-900 tracking-tight">Usaha Kuliner</h2>
          <Link
            href="/kelola-usaha/pengaturan"
            aria-label="Lihat dan kelola semua usaha"
            className="w-7 h-7 rounded-full bg-clay-100 hover:bg-[#fdeee9] border border-transparent hover:border-terracotta-200 flex items-center justify-center text-clay-600 hover:text-terracotta transition-colors duration-150"
          >
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Business Asset Badges */}
        <div className="space-y-3">
          {topBusinesses.length > 0 ? (
            topBusinesses.map((biz, index) => {
              const postCount = biz.selling_posts_count ?? 1;
              const menuCount = biz.menu_items_count ?? 0;
              const status = biz.status === 'published' ? 'Aktif publik' : biz.status === 'archived' ? 'Diarsipkan' : 'Draf';
              // Alternate background styling like in reference (Dark Clay, Terracotta-100, Minimal Clay-50)
              if (index === 0) {
                return (
                  <Link
                    key={biz.id}
                    href={managementUrl(biz.slug)}
                    className="bg-clay-700 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md group hover:bg-clay-800 transition block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center font-bold text-white tracking-widest text-xs uppercase overflow-hidden shrink-0">
                        {biz.photo ? (
                          <img src={businessCover(biz)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          biz.name.slice(0, 3).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold leading-tight truncate !text-white text-white">{biz.name}</h3>
                        <p className="text-[11px] !text-white/85 text-clay-200 capitalize">{biz.kind} · {menuCount} menu</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold !text-terracotta-200 text-terracotta-200 block">{postCount} Pos</span>
                      <span className="text-[10px] !text-white/80 text-clay-200 capitalize">{status}</span>
                    </div>
                  </Link>
                );
              }

              if (index === 1) {
                return (
                  <Link
                    key={biz.id}
                    href={managementUrl(biz.slug)}
                    className="bg-terracotta-100 border border-terracotta-200 text-clay-900 p-3.5 rounded-2xl flex items-center justify-between shadow-sm group hover:border-terracotta transition block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-clay-800 flex items-center justify-center font-extrabold text-white text-xs overflow-hidden shrink-0">
                        {biz.photo ? (
                          <img src={businessCover(biz)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          biz.name.slice(0, 3).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold leading-tight truncate text-clay-900">{biz.name}</h3>
                        <p className="text-[11px] text-clay-700 font-semibold capitalize">{biz.kind} · {menuCount} menu</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-terracotta-700 block">{postCount} Pos</span>
                      <span className="text-[10px] text-clay-700 font-semibold capitalize">{status}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={biz.id}
                  href={managementUrl(biz.slug)}
                  className="bg-clay-50 hover:bg-clay-100 border border-sand-border p-3.5 rounded-2xl flex items-center justify-between transition-colors block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-clay-700 flex items-center justify-center text-white text-xs overflow-hidden shrink-0">
                      {biz.photo ? (
                        <img src={businessCover(biz)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-tight text-clay-900 truncate">{biz.name}</h3>
                      <p className="text-[11px] text-clay-700 font-semibold capitalize">{biz.kind} · {menuCount} menu</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">{postCount} Pos</span>
                    <span className="text-[10px] text-clay-700 font-semibold capitalize">{status}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-clay-500 bg-clay-50 rounded-2xl border border-sand-border">
              Belum ada usaha kuliner terhubung.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-between text-xs text-clay-700 font-semibold">
        <span>Total Portofolio</span>
        <span className="font-extrabold text-clay-900 text-sm">
          {businesses.length} Usaha · {totalPosts} Pos
        </span>
      </div>
    </div>
  );
}
