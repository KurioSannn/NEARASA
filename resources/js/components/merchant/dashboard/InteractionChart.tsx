import { useState } from 'react';
import { BarChart3, BookOpen, Eye, Info, MapPin, MessageCircle, TrendingUp } from 'lucide-react';
import Dialog from '@/components/Dialog';
import type { MerchantStatistics } from '@/types/merchant';

const metrics = [
  { key: 'profile_view', label: 'Profil', fullLabel: 'Profil dilihat', icon: Eye },
  { key: 'menu_open', label: 'Menu', fullLabel: 'Menu dibuka', icon: BookOpen },
  { key: 'map_click', label: 'Peta', fullLabel: 'Klik peta', icon: MapPin },
  { key: 'whatsapp_click', label: 'WhatsApp', fullLabel: 'Klik WhatsApp', icon: MessageCircle },
] as const;

const number = (value: number) => value.toLocaleString('id-ID');

export default function InteractionChart({ statistics }: { statistics: MerchantStatistics }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const totals = statistics.totals;
  const values = metrics.map(({ key }) => totals[key]);
  const rawMax = Math.max(...values, 0);
  // Calculate pleasant Y-axis grid scale
  const step = rawMax <= 4 ? 1 : rawMax <= 20 ? 5 : rawMax <= 100 ? 25 : Math.ceil(rawMax / 4 / 50) * 50;
  const gridMax = Math.max(step * 4, 4);
  const gridSteps = [gridMax, gridMax * 0.75, gridMax * 0.5, gridMax * 0.25, 0];

  const totalInteractions = values.reduce((acc, curr) => acc + curr, 0);
  const peakValue = Math.max(...values);
  const isEmpty = totalInteractions === 0;

  return (
    <div id="interaksi" className="xl:col-span-8 bg-white p-5 lg:p-6 rounded-3xl border border-sand-border shadow-soft flex flex-col justify-between" data-purpose="engagement-rate-chart">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terracotta-100 text-terracotta flex items-center justify-center">
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-clay-900">Interaksi di NEARASA</h2>
            <p className="text-[11px] text-clay-700 font-medium">Aktivitas aplikasi {statistics.days} hari terakhir · seluruh usaha</p>
          </div>
        </div>
      </div>

      {/* Stylized Bar Chart Area */}
      <div className="relative w-full pt-6 pb-2">
        {/* Horizontal Grid Lines with Y-Axis */}
        <div className="space-y-6 text-[10px] text-clay-600 font-semibold">
          {gridSteps.map((val, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-6 text-right font-mono">{Math.round(val)}</span>
              <div className={`flex-1 border-b ${idx === gridSteps.length - 1 ? 'border-sand-border' : 'border-dashed border-sand-border'}`} />
            </div>
          ))}
        </div>

        {/* Pill Column Bars */}
        <div className="absolute inset-x-8 bottom-3 top-4 flex items-end justify-between px-3 sm:px-12">
          {metrics.map(({ key, label, fullLabel, icon: Icon }, idx) => {
            const count = totals[key];
            const ratio = gridMax > 0 ? count / gridMax : 0;
            // Height constrained between min 24px and max 150px
            const heightPx = count === 0 ? 26 : Math.max(26, Math.round(ratio * 150));
            const isPeak = !isEmpty && count === peakValue;

            return (
              <div key={key} className="flex flex-col items-center group cursor-pointer flex-1 max-w-[80px]">
                <div
                  style={{ height: `${heightPx}px` }}
                  className={`w-9 sm:w-12 rounded-full transition-colors duration-150 relative ${
                    isPeak
                      ? 'bg-terracotta ring-4 ring-terracotta-100 shadow-md'
                      : count === 0
                      ? 'bg-terracotta-200/50 hover:bg-terracotta-300'
                      : idx % 2 === 0
                      ? 'bg-terracotta-300 hover:bg-terracotta-400'
                      : 'bg-terracotta-400/90 hover:bg-terracotta-500'
                  }`}
                >
                  <span className={`absolute -top-7 left-1/2 -translate-x-1/2 bg-clay-800 text-white text-[10px] font-bold py-0.5 px-1.5 rounded transition shadow whitespace-nowrap z-10 ${
                    isPeak ? 'opacity-100 text-terracotta-200' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {number(count)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Labels Row */}
      <div className="flex items-center justify-between px-3 sm:px-12 pt-2.5 text-xs">
        {metrics.map(({ key, label, icon: Icon }) => {
          const count = totals[key];
          const isPeak = !isEmpty && count === peakValue;
          return (
            <div key={key} className="flex items-center gap-1.5 flex-1 max-w-[80px] justify-center">
              <Icon className={`w-3.5 h-3.5 ${isPeak ? 'text-terracotta' : 'text-clay-600'}`} />
              <span className={`text-xs ${isPeak ? 'font-extrabold text-terracotta' : 'font-semibold text-clay-800'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom summary pill row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-sand-border/70 text-xs">
        <span className="text-clay-700 font-medium">
          Total interaksi: <strong className="text-clay-900">{number(totalInteractions)} interaksi</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-clay-800 hover:text-terracotta bg-clay-50 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-200 px-2.5 py-1 rounded-full transition-colors duration-150 cursor-pointer shadow-xs"
          >
            <Info className="w-3.5 h-3.5 text-terracotta" />
            <span>Cara hitung</span>
          </button>
          <span className="inline-flex items-center gap-1 text-terracotta-700 font-bold bg-terracotta-50 border border-terracotta-200 px-2.5 py-0.5 rounded-full text-[11px]">
            <TrendingUp className="w-3.5 h-3.5" /> Data Aktif
          </span>
        </div>
      </div>

      {/* Modal Dialog for Cara Hitung & Rincian Interaksi (No Emotes) */}
      {detailsOpen && (
        <Dialog
          title="Cara Hitung & Rincian Interaksi"
          subtitle="Informasi cara pencatatan interaksi pelanggan di NEARASA"
          onClose={() => setDetailsOpen(false)}
          wide
        >
          <div className="space-y-4 text-xs text-clay-800">
            <div className="p-3.5 bg-clay-50 rounded-2xl border border-sand-border space-y-2 text-clay-700 leading-relaxed">
              <p>
                <strong>Profil dilihat:</strong> Terhitung saat pengunjung membuka rincian pos usahamu di direktori NEARASA.
              </p>
              <p>
                <strong>Menu dibuka:</strong> Terhitung saat pengunjung membuka dan memeriksa daftar menu dan harga.
              </p>
              <p>
                <strong>Klik peta & WhatsApp:</strong> Terhitung saat pengunjung menekan tombol rute peta lokasi atau tombol chat WhatsApp pos jualanmu.
              </p>
              <p className="text-[11px] text-clay-600 pt-2 border-t border-sand-border">
                Interaksi dicatat secara unik per sesi per 30 menit. Akses atau kunjungan dari akun pemilik toko sendiri tidak dihitung.
              </p>
            </div>

            {statistics.by_post.length > 0 && (
              <div>
                <h4 className="font-bold text-clay-900 text-sm mb-2.5">Rincian per Pos Jualan:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {statistics.by_post.map((post) => (
                    <div key={post.post_id} className="p-3 bg-white rounded-xl border border-sand-border text-xs flex flex-col gap-2 shadow-xs">
                      <span className="font-bold text-clay-900 leading-snug">{post.business_name} · {post.post_name}</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-clay-700">
                        <span className="inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-terracotta" /> Profil: {post.profile_view}</span>
                        <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-terracotta" /> Menu: {post.menu_open}</span>
                        <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-terracotta" /> Peta: {post.map_click}</span>
                        <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-terracotta" /> WA: {post.whatsapp_click}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
