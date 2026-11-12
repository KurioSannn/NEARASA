import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Plus,
  Store,
  X,
} from 'lucide-react';
import type { MerchantBusiness, MerchantPost, SpecialHours, WeeklyHours } from '@/types/business-profile';
import { postDraft } from '@/components/merchant/post-form';
import Dialog from '@/components/Dialog';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

function formatIndonesianDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

type Props = {
  business: MerchantBusiness;
  selectedPostId?: number;
};

export default function PostScheduleCalendar({ business, selectedPostId }: Props) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Post currently focused for schedule updates
  const activePost =
    business.posts.find((p) => p.id === selectedPostId) ??
    business.posts[0] ??
    null;

  const [modalPostId, setModalPostId] = useState<number>(activePost?.id ?? 0);
  const [posDropdownOpen, setPosDropdownOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Modal form states
  const [scheduleType, setScheduleType] = useState<'regular' | 'custom' | 'closed'>('regular');
  const [opensAt, setOpensAt] = useState('10:00');
  const [closesAt, setClosesAt] = useState('22:00');
  const [processing, setProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Quick toggle states for the right column widgets
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [takeawayReady, setTakeawayReady] = useState(true);
  const [nationalHolidayAuto, setNationalHolidayAuto] = useState(false);

  // Month navigation
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Convert Sunday (0) to 7, so Monday is 1, Sunday is 7
  let startingWeekday = firstDayOfMonth.getDay();
  if (startingWeekday === 0) startingWeekday = 7;

  // Previous month padding days
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthPadding = startingWeekday - 1;

  // Check schedule for a specific date and post
  function getPostDateStatus(post: MerchantPost, dateStr: string) {
    const special = post.special_hours?.find((s) => s.date === dateStr);
    if (special) {
      if (special.is_closed) {
        return { isSpecial: true, isClosed: true, label: 'Tutup Pos', hours: null };
      }
      return {
        isSpecial: true,
        isClosed: false,
        label: special.opens_at && special.closes_at ? `${special.opens_at.slice(0, 5)}–${special.closes_at.slice(0, 5)}` : 'Buka Khusus',
        hours: `${special.opens_at?.slice(0, 5)}–${special.closes_at?.slice(0, 5)}`,
      };
    }

    // Fallback to weekly routine (1 = Monday ... 7 = Sunday)
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    let dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;

    const routine = post.schedules?.find((s) => s.weekday === dayOfWeek);
    if (!routine) {
      return { isSpecial: false, isClosed: true, label: 'Tutup Rutin', hours: null };
    }
    return {
      isSpecial: false,
      isClosed: false,
      label: routine.all_day ? '24 Jam' : `${routine.opens_at.slice(0, 5)}–${routine.closes_at.slice(0, 5)}`,
      hours: routine.all_day ? '24 Jam' : `${routine.opens_at.slice(0, 5)}–${routine.closes_at.slice(0, 5)}`,
    };
  }

  // Open modal when a date tile is clicked
  function handleDateClick(dateStr: string) {
    setSelectedDateKey(dateStr);
    setErrorMessage('');
    const targetPost = business.posts.find((p) => p.id === modalPostId) ?? business.posts[0];
    if (!targetPost) return;

    const special = targetPost.special_hours?.find((s) => s.date === dateStr);
    if (special) {
      if (special.is_closed) {
        setScheduleType('closed');
      } else {
        setScheduleType('custom');
        setOpensAt(special.opens_at ? special.opens_at.slice(0, 5) : '10:00');
        setClosesAt(special.closes_at ? special.closes_at.slice(0, 5) : '22:00');
      }
    } else {
      setScheduleType('regular');
      setOpensAt('10:00');
      setClosesAt('22:00');
    }
  }

  // Save changes for selected date
  function handleSaveDateSchedule() {
    const targetPost = business.posts.find((p) => p.id === modalPostId);
    if (!targetPost || !selectedDateKey) return;

    setProcessing(true);
    setErrorMessage('');

    const draft = postDraft(targetPost);
    let updatedSpecial: SpecialHours[] = (draft.special_hours || []).filter(
      (slot) => slot.date !== selectedDateKey
    );

    if (scheduleType === 'closed') {
      updatedSpecial.push({
        date: selectedDateKey,
        is_closed: true,
        all_day: false,
        opens_at: null,
        closes_at: null,
      });
    } else if (scheduleType === 'custom') {
      updatedSpecial.push({
        date: selectedDateKey,
        is_closed: false,
        all_day: false,
        opens_at: opensAt,
        closes_at: closesAt,
      });
    }
    // If 'regular', we simply omit it from special_hours so it follows regular routine!

    const payload = {
      ...draft,
      special_hours: updatedSpecial.map((slot) => ({
        ...slot,
        all_day: !slot.is_closed && Boolean(slot.all_day),
        opens_at: slot.is_closed ? null : slot.all_day ? '00:00' : slot.opens_at,
        closes_at: slot.is_closed ? null : slot.all_day ? '00:00' : slot.closes_at,
      })),
    };

    router.patch(`/kelola-usaha/${business.slug}/pos/${targetPost.id}`, payload, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setProcessing(false);
        setSelectedDateKey(null);
        setFeedbackMessage(`Jadwal tanggal ${formatIndonesianDate(selectedDateKey)} berhasil diperbarui.`);
        setTimeout(() => setFeedbackMessage(''), 4500);
      },
      onError: (errors: Record<string, string>) => {
        setProcessing(false);
        setErrorMessage(Object.values(errors)[0] || 'Gagal menyimpan perubahan tanggal.');
      },
    });
  }

  const focusedPost = business.posts.find((p) => p.id === modalPostId) ?? business.posts[0];

  return (
    <div className="w-full flex flex-col gap-6" data-purpose="combined-calendar-hub">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage('')}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Grid (8 cols left: Calendar, 4 cols right: Quick Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Monthly Calendar Card (8 Columns) */}
        <section
          className="lg:col-span-8 bg-white border border-sand-border rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col gap-5"
          data-purpose="deliveries-monthly-calendar"
        >
          {/* Header Toolbar: Title, Month Navigator & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sand-border">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-terracotta" />
                <h3 className="text-base sm:text-lg font-extrabold text-clay-900 tracking-tight">
                  Kalender Penjadwalan Gerai & Pos
                </h3>
              </div>
              <p className="text-xs text-clay-600 font-medium mt-0.5">
                Klik tanggal mana saja untuk mengatur jam khusus, libur, atau sinkronisasi lokasi pos.
              </p>
            </div>

            {/* Month Switcher Toolbar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-clay-50/80 px-3.5 py-1.5 rounded-full border border-sand-border">
                <button
                  type="button"
                  aria-label="Bulan sebelumnya"
                  onClick={prevMonth}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-extrabold text-clay-900 px-1 min-w-[110px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  aria-label="Bulan berikutnya"
                  onClick={nextMonth}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-clay-700 hover:text-terracotta hover:bg-[#fdeee9] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-terracotta bg-terracotta-50 hover:bg-[#fdeee9] border border-terracotta-200 transition-colors"
              >
                Hari Ini
              </button>
            </div>
          </div>

          {/* Quick Legend Bar & Pos Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-clay-600 font-medium">Lihat jadwal pos:</span>
              <div className="flex items-center gap-1.5">
                {business.posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setModalPostId(post.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      modalPostId === post.id
                        ? 'bg-terracotta text-white shadow-xs'
                        : 'bg-clay-100 text-clay-700 hover:bg-[#fdeee9] hover:text-terracotta'
                    }`}
                  >
                    {post.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Legend Pills */}
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-terracotta-50 text-terracotta border border-terracotta-200">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta" /> Hari Ini
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Buka
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Khusus / Libur
              </span>
            </div>
          </div>

          {/* 7-Days Header (Senin - Minggu) */}
          <div className="grid grid-cols-7 gap-1.5 text-center pt-2">
            {DAY_LABELS.map((dayLabel, idx) => (
              <span
                key={dayLabel}
                className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
                  idx >= 5 ? 'text-terracotta' : 'text-clay-600'
                }`}
              >
                {dayLabel}
              </span>
            ))}
          </div>

          {/* 7-Columns Calendar Grid Tiles */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Previous Month Padding Tiles */}
            {Array.from({ length: prevMonthPadding }).map((_, index) => {
              const dayNum = daysInPrevMonth - prevMonthPadding + index + 1;
              return (
                <div
                  key={`prev-${index}`}
                  className="h-20 sm:h-24 p-2 rounded-2xl bg-clay-50/40 border border-transparent opacity-35 flex flex-col justify-between select-none"
                >
                  <span className="text-xs font-semibold text-clay-400">{dayNum}</span>
                </div>
              );
            })}

            {/* Current Month Active Day Tiles */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateKey = formatDateKey(currentYear, currentMonth, dayNum);
              const isToday = dateKey === todayKey;

              const status = focusedPost ? getPostDateStatus(focusedPost, dateKey) : null;
              const isClosed = status?.isClosed ?? false;
              const isSpecial = status?.isSpecial ?? false;

              return (
                <div
                  key={dateKey}
                  onClick={() => handleDateClick(dateKey)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between group ${
                    isToday
                      ? 'bg-terracotta text-white shadow-md shadow-terracotta/25 border-terracotta'
                      : isSpecial && isClosed
                      ? 'bg-amber-50/70 border-amber-200/80 hover:border-amber-300'
                      : isSpecial && !isClosed
                      ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                      : 'bg-clay-50/60 border-sand-border hover:border-terracotta-300 hover:bg-[#fdeee9]'
                  }`}
                  title={`Klik untuk mengatur jadwal ${dayNum} ${MONTH_NAMES[currentMonth]}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday ? 'text-white' : 'text-clay-900 group-hover:text-terracotta'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] uppercase font-black bg-white/20 text-white px-1.5 py-0.2 rounded-full">
                        Hari Ini
                      </span>
                    )}
                    {isSpecial && !isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isClosed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        title={isClosed ? 'Tutup Khusus' : 'Jam Khusus'}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`block text-[10px] truncate leading-tight font-bold ${
                        isToday
                          ? 'text-white/90'
                          : isClosed
                          ? 'text-amber-800'
                          : 'text-clay-700 group-hover:text-terracotta'
                      }`}
                    >
                      {status?.label || 'Buka'}
                    </span>
                    <span
                      className={`text-[9px] block truncate mt-0.5 ${
                        isToday ? 'text-white/75' : 'text-clay-400'
                      }`}
                    >
                      {focusedPost?.name || 'Gerai'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Footnote & Action */}
          <div className="pt-3 border-t border-sand-border flex flex-wrap items-center justify-between text-xs text-clay-600 gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-terracotta shrink-0" />
              Jadwal khusus dan status libur pada kalender otomatis menggantikan jadwal mingguan rutin pos terkait.
            </span>
            <span className="text-[11px] font-bold text-terracotta">Zona Jam: WIB</span>
          </div>
        </section>

        {/* Right Column: Quick Operational Controls & Info Widgets (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Operational Toggle Card */}
          <section className="bg-white border border-sand-border rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-terracotta" />
                <h4 className="text-sm font-extrabold text-clay-900">Kontrol Cepat Hari Ini</h4>
              </div>
              <span className="text-[10px] font-bold text-terracotta bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                WIB Aktif
              </span>
            </div>

            <div className="space-y-3">
              {/* Toggle 1: Menerima Pesanan Baru */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-clay-50/70 border border-sand-border">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-clay-900">Menerima Pesanan Baru</span>
                  <span className="text-[10px] text-clay-600">Status gerai online di NEARASA</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAcceptingOrders(!acceptingOrders)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 cursor-pointer ${
                    acceptingOrders ? 'bg-terracotta' : 'bg-clay-300'
                  }`}
                  aria-pressed={acceptingOrders}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      acceptingOrders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Layanan Ambil di Tempat */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-clay-50/70 border border-sand-border">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-clay-900">Layanan Ambil di Tempat</span>
                  <span className="text-[10px] text-clay-600">Self pick-up untuk seluruh pos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTakeawayReady(!takeawayReady)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 cursor-pointer ${
                    takeawayReady ? 'bg-emerald-600' : 'bg-clay-300'
                  }`}
                  aria-pressed={takeawayReady}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      takeawayReady ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Libur Kalender Nasional */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-clay-50/70 border border-sand-border">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-clay-900">Peringatan Hari Libur</span>
                  <span className="text-[10px] text-clay-600">Sinkronisasi tanggal merah</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNationalHolidayAuto(!nationalHolidayAuto)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 relative shrink-0 cursor-pointer ${
                    nationalHolidayAuto ? 'bg-amber-600' : 'bg-clay-300'
                  }`}
                  aria-pressed={nationalHolidayAuto}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      nationalHolidayAuto ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-clay-500 pt-2 border-t border-sand-border">
              Perubahan kontrol cepat ini aktif seketika pada direktori pencarian kuliner konsumen.
            </p>
          </section>

          {/* Pos Location Highlights Card */}
          <section className="bg-gradient-to-br from-[#fbf8f5] to-white border border-sand-border rounded-3xl p-5 shadow-soft flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
                Daftar Pos Terhubung
              </span>
              <span className="text-xs font-extrabold text-clay-900">
                {business.posts.length} Pos Aktif
              </span>
            </div>

            <div className="space-y-2">
              {business.posts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-white rounded-2xl border border-sand-border flex items-center justify-between shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-clay-900 truncate">{post.name}</p>
                    <p className="text-[10px] text-clay-600 truncate">{post.address}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      post.operating_status === 'operating'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {post.operating_status === 'operating' ? 'Beroperasi' : 'Tutup'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Google Calendar-Style Quick Date Settings Modal */}
      {selectedDateKey && (
        <Dialog
          title={`Atur Jadwal Tanggal: ${formatIndonesianDate(selectedDateKey)}`}
          subtitle="Tentukan jam operasional khusus atau tandai pos libur pada tanggal ini"
          onClose={() => setSelectedDateKey(null)}
        >
          <div className="space-y-5 text-xs text-clay-900">
            {errorMessage && (
              <p className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium" role="alert">
                {errorMessage}
              </p>
            )}

            {/* Select Pos Target - Custom Popover Dropdown (No default OS blue) */}
            <div>
              <label className="block text-xs font-bold text-clay-900 mb-1.5">
                Pos / Gerai yang Diatur:
              </label>
              <div className="relative">
                {(() => {
                  const currentSelectedPost = business.posts.find((p) => p.id === modalPostId) ?? business.posts[0];
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setPosDropdownOpen(!posDropdownOpen)}
                        className="w-full flex items-center justify-between gap-3 bg-clay-50/80 hover:bg-[#fdeee9] border border-sand-border hover:border-terracotta-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-clay-900 transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-terracotta/20 outline-none"
                      >
                        <div className="flex items-center gap-2.5 truncate text-left">
                          <Store className="w-4 h-4 text-terracotta shrink-0" />
                          <span className="truncate">
                            {currentSelectedPost ? `${currentSelectedPost.name}${currentSelectedPost.address ? ` — ${currentSelectedPost.address}` : ''}` : 'Pilih Pos'}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-clay-500 transition-transform duration-200 shrink-0 ${posDropdownOpen ? 'rotate-180 text-terracotta' : ''}`} />
                      </button>

                      {posDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setPosDropdownOpen(false)}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-sand-border rounded-2xl shadow-xl p-1.5 z-50 max-h-60 overflow-y-auto space-y-1">
                            {business.posts.map((p) => {
                              const isSelected = p.id === modalPostId;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setModalPostId(p.id);
                                    setPosDropdownOpen(false);
                                  }}
                                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'bg-terracotta-50 text-terracotta font-extrabold border border-terracotta-200'
                                      : 'text-clay-800 font-semibold hover:bg-[#fdeee9] hover:text-terracotta border border-transparent'
                                  }`}
                                >
                                  <div className="truncate">
                                    <span className="block truncate font-bold">{p.name}</span>
                                    {p.address && (
                                      <span className="block text-[10px] text-clay-600 truncate mt-0.5">
                                        {p.address}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-terracotta shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Mode Selection Radios */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-clay-900">Pilih Kondisi Tanggal Ini:</span>

              {/* Option 1: Ikuti Jadwal Rutin Normal */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  scheduleType === 'regular'
                    ? 'border-terracotta bg-terracotta-50/50 ring-2 ring-terracotta/20 shadow-xs'
                    : 'border-sand-border bg-clay-50/50 hover:bg-[#fdeee9] hover:border-terracotta-200'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleType"
                  value="regular"
                  checked={scheduleType === 'regular'}
                  onChange={() => setScheduleType('regular')}
                  className="mt-0.5 text-terracotta focus:ring-terracotta"
                />
                <div>
                  <strong className="block text-xs font-bold text-clay-900">
                    Ikuti Jadwal Rutin Normal
                  </strong>
                  <p className="text-[11px] text-clay-600 mt-0.5">
                    Hapus pengecualian tanggal ini dan ikuti jam operasional mingguan rutin.
                  </p>
                </div>
              </label>

              {/* Option 2: Jam Khusus Tanggal Ini */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  scheduleType === 'custom'
                    ? 'border-terracotta bg-terracotta-50/50 ring-2 ring-terracotta/20 shadow-xs'
                    : 'border-sand-border bg-clay-50/50 hover:bg-[#fdeee9] hover:border-terracotta-200'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleType"
                  value="custom"
                  checked={scheduleType === 'custom'}
                  onChange={() => setScheduleType('custom')}
                  className="mt-0.5 text-terracotta focus:ring-terracotta"
                />
                <div>
                  <strong className="block text-xs font-bold text-clay-900">
                    Buka Sesuai Jam Khusus
                  </strong>
                  <p className="text-[11px] text-clay-600 mt-0.5">
                    Tentukan jam buka dan tutup khusus hanya untuk tanggal ini.
                  </p>
                </div>
              </label>

              {/* Option 3: Tutup / Libur Khusus */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  scheduleType === 'closed'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-sand-border bg-clay-50/50 hover:bg-amber-50/50 hover:border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleType"
                  value="closed"
                  checked={scheduleType === 'closed'}
                  onChange={() => setScheduleType('closed')}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <strong className="block text-xs font-bold text-amber-800">
                    Tutup / Libur Sementara Tanggal Ini
                  </strong>
                  <p className="text-[11px] text-clay-600 mt-0.5">
                    Tandai pos tutup untuk libur keluarga, istirahat, atau renovasi pada tanggal ini.
                  </p>
                </div>
              </label>
            </div>

            {/* Time inputs if custom */}
            {scheduleType === 'custom' && (
              <div className="p-3.5 bg-clay-50 rounded-2xl border border-sand-border space-y-3">
                <span className="block text-xs font-bold text-clay-900">Jam Operasional Khusus (WIB):</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="modal-opens-at" className="block text-[10px] font-bold uppercase text-clay-600 mb-1">
                      Jam Buka
                    </label>
                    <input
                      id="modal-opens-at"
                      type="time"
                      value={opensAt}
                      onChange={(e) => setOpensAt(e.target.value)}
                      className="w-full bg-white border border-sand-border rounded-xl px-3 py-2 text-xs font-bold text-clay-900 focus:ring-2 focus:ring-terracotta/20 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-closes-at" className="block text-[10px] font-bold uppercase text-clay-600 mb-1">
                      Jam Tutup
                    </label>
                    <input
                      id="modal-closes-at"
                      type="time"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                      className="w-full bg-white border border-sand-border rounded-xl px-3 py-2 text-xs font-bold text-clay-900 focus:ring-2 focus:ring-terracotta/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="px-4 py-2 rounded-full border border-sand-border text-xs font-semibold text-clay-700 hover:bg-clay-100 transition-colors"
                disabled={processing}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDateSchedule}
                disabled={processing}
                className="px-5 py-2 rounded-full bg-terracotta hover:bg-terracotta-600 text-white !text-white text-xs font-bold shadow-md shadow-terracotta/25 transition-colors duration-150 flex items-center gap-1.5"
              >
                {processing ? 'Menyimpan…' : 'Simpan Jadwal Tanggal'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
