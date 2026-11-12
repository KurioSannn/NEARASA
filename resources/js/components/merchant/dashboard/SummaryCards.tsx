import { AlertTriangle, CheckCircle2, MapPin, Store } from 'lucide-react';

type Props = {
  businessCount: number;
  postCount: number;
  openCount: number;
  pending: number;
  manageUrl?: string;
};

export default function SummaryCards({ businessCount, postCount, openCount, pending }: Props) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary-bar">
      {/* Metric 1: Total Businesses (Terracotta Highlight Card) */}
      <div className="dash-summary-primary text-white p-4 rounded-3xl shadow-sm flex items-center justify-between select-none">
        <div>
          <p className="text-xs text-white/85 font-medium">Usaha Terkelola</p>
          <h4 className="text-2xl font-extrabold tracking-tight mt-1">{businessCount}</h4>
          <span className="text-[10px] text-white/95 bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block font-semibold">
            Profil Aktif
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
          <Store className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* Metric 2: Pending Reviews (Amber Soft Card) */}
      <div className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between select-none">
        <div>
          <p className="text-xs text-clay-700 font-semibold">Review Tutup</p>
          <h4 className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{pending}</h4>
          <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block font-bold border ${
            pending > 0
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            {pending > 0 ? `${pending} Perlu dicek` : 'Semua aman'}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
          pending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {pending > 0 ? (
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Metric 3: Total Posts (Warm Sand/Terracotta Card) */}
      <div className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between select-none">
        <div>
          <p className="text-xs text-clay-700 font-semibold">Pos Jualan</p>
          <h4 className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{postCount}</h4>
          <span className="text-[10px] text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full mt-2 inline-block font-bold">
            Titik lokasi
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta flex items-center justify-center">
          <MapPin className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* Metric 4: Currently Open (Emerald Card) */}
      <div className="bg-white p-4 rounded-3xl border border-sand-border shadow-soft flex items-center justify-between select-none">
        <div>
          <p className="text-xs text-clay-700 font-semibold">Buka Saat Ini</p>
          <h4 className="text-2xl font-extrabold text-clay-900 tracking-tight mt-1">{openCount}</h4>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-2 inline-block font-bold">
            {postCount > 0 ? `${openCount} dari ${postCount} pos buka` : '0 pos'}
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
