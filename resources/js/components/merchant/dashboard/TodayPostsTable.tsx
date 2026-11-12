import { Link } from '@inertiajs/react';
import { ArrowUpRight, Clock, MapPin, Store } from 'lucide-react';
import type { DailyOperation } from '@/components/merchant/DailyOperations';
import { businessCover } from '@/types/business-images';
import { managementUrl, operationStatus, type OwnedBusiness } from '@/types/merchant';

type Props = {
  businesses: OwnedBusiness[];
  operations: DailyOperation[];
  manageUrl: string;
};

function hoursLabel({ post }: DailyOperation) {
  const hours = post.today_hours;
  return hours
    ? `${hours.opens_at.slice(0, 5)}–${hours.closes_at.slice(0, 5)}${hours.closes_tomorrow ? ' besok' : ''}`
    : post.schedule_today?.label ?? 'Belum diatur';
}

export default function TodayPostsTable({ businesses, operations, manageUrl }: Props) {
  return (
    <section id="pos-hari-ini" className="bg-white p-5 lg:p-6 rounded-3xl border border-sand-border shadow-soft" data-purpose="transaction-history">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-clay-900">Ringkasan Pos Jualan Hari Ini</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${manageUrl}?tab=posts`}
            className="text-xs font-bold text-terracotta hover:text-terracotta-700 bg-terracotta-50/60 hover:bg-[#fdeee9] border border-terracotta-200/60 hover:border-terracotta-200 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors duration-150"
          >
            <span>Atur Pos & Jadwal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Transactions / Posts Table */}
      {operations.length > 0 ? (
        <div className="overflow-x-auto dash-scroll">
          <table className="w-full text-left border-collapse" id="transactions-table">
            <thead>
              <tr
                className="border-b border-sand-border text-[11px] font-bold uppercase tracking-wider text-clay-600"
                style={{ borderColor: 'rgba(183, 75, 40, 0.18)' }}
              >
                <th className="pb-3 pl-2">Pos Jualan & Usaha</th>
                <th className="pb-3">Alamat / Patokan</th>
                <th className="pb-3">Jam Operasional (WIB)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border text-xs">
              {operations.map((operation) => {
                const business = businesses.find((item) => item.id === operation.business_id);
                const status = operationStatus(operation.post);
                const isTempClosed = operation.post.operating_status === 'temporarily_closed';
                const hasSpecialHours = Boolean(operation.post.today_hours);

                return (
                  <tr
                    key={operation.post.id}
                    className="hover:bg-clay-50/70 transition-colors group border-b border-sand-border last:border-b-0"
                    style={{ borderColor: 'rgba(183, 75, 40, 0.18)' }}
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sand-base border border-sand-border overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-clay-700">
                          {business && businessCover(business) ? (
                            <img
                              src={businessCover(business)}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Store className="w-4 h-4 text-terracotta" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-clay-900 group-hover:text-terracotta block leading-snug">
                            {operation.post.name}
                          </span>
                          <span className="text-[10px] text-clay-600 font-medium">
                            {operation.business_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-semibold text-clay-800 max-w-[200px] truncate">
                      {operation.post.address || 'Belum ada alamat'}
                    </td>
                    <td className="py-3.5 font-semibold text-clay-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-clay-600" />
                        <span>{hoursLabel(operation)}</span>
                        {hasSpecialHours && (
                          <span className="text-[10px] text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-1.5 py-0.2 rounded font-semibold">
                            Khusus
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        status.open
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isTempClosed
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-clay-100 text-clay-600 border-sand-border'
                      }`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <Link
                        href={managementUrl(operation.business_slug, operation.post.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-terracotta bg-terracotta-50 hover:bg-terracotta hover:text-white border border-terracotta-200 hover:border-terracotta transition-colors duration-150 shadow-xs"
                        aria-label={`Kelola ${operation.business_name}, ${operation.post.name}`}
                      >
                        <span>Kelola</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-clay-900">
            {businesses.length ? 'Belum ada pos jualan' : 'Belum ada usaha terhubung'}
          </h3>
          <p className="text-xs text-clay-400 max-w-sm">
            {businesses.length
              ? 'Tambahkan pos jualan baru untuk mengatur alamat dan jadwal buka usaha kulinermu.'
              : 'Daftarkan profil usaha kuliner terlebih dahulu untuk mulai berjualan.'}
          </p>
          <Link
            href={businesses.length ? `${manageUrl}?tab=posts` : '/akun'}
            className="mt-2 px-4 py-2 rounded-full text-xs font-bold bg-terracotta text-white shadow-pill hover:bg-terracotta-600 transition-colors duration-150"
          >
            {businesses.length ? 'Tambah Pos Jualan' : 'Buka Akun'}
          </Link>
        </div>
      )}
    </section>
  );
}
