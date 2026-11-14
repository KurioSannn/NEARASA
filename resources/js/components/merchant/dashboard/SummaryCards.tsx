import { Link } from '@inertiajs/react';
import { CheckCircle2, MapPin, Star, Store } from 'lucide-react';

type Props = {
  businessCount: number;
  postCount: number;
  openCount: number;
  reviewCount: number;
  manageUrl?: string;
};

export default function SummaryCards({ businessCount, postCount, openCount, reviewCount }: Props) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary-bar">
      {/* Metric 1: Total Businesses (Terracotta Highlight Card) */}
      <div className="dash-summary-primary text-white p-4 rounded-3xl shadow-sm flex items-center justify-between select-none min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-white/85 font-medium truncate">Usaha Terkelola</p>
          <h4 className="text-2xl font-extrabold tracking-tight mt-1">{businessCount}</h4>
          <span className="text-[10px] text-white/95 bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block font-semibold truncate max-w-full">
            Profil Aktif
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shrink-0 ml-2">
          <Store className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <Link href="/kelola-usaha/ulasan" className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-clay-700 font-semibold truncate">Ulasan Pelanggan</p>
          <p className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{reviewCount}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#fdeee9] text-terracotta flex items-center justify-center shrink-0 ml-2">
          <Star className="w-5 h-5 text-terracotta" aria-hidden="true" />
        </div>
      </Link>

      {/* Metric 3: Total Posts (Warm Sand/Terracotta Card) */}
      <div className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between select-none min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-clay-700 font-semibold truncate">Pos Jualan</p>
          <h4 className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{postCount}</h4>
          <span className="text-[10px] text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full mt-2 inline-block font-bold truncate max-w-full">
            Titik lokasi
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta flex items-center justify-center shrink-0 ml-2">
          <MapPin className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* Metric 4: Currently Open (Emerald Card) */}
      <div className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between select-none min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-clay-700 font-semibold truncate">Buka Saat Ini</p>
          <h4 className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{openCount}</h4>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-2 inline-block font-bold truncate max-w-full">
            {postCount > 0 ? `${openCount}/${postCount} pos buka` : '0 pos'}
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
