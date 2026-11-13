import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, HelpCircle, MapPin, Store, Upload, Utensils } from 'lucide-react';
import type { SharedProps } from '@/types/catalog';

type AreaOption = {
  label: string;
  latitude: number;
  longitude: number;
};

type Props = {
  options: {
    groups: string[];
    categories: string[];
    areas: AreaOption[];
  };
  kindOptions: { value: string; label: string }[];
};

const categorySuggestions = [
  'Warung makan',
  'Masakan rumahan',
  'Kedai kopi',
  'Jajanan',
  'Minuman',
  'Ayam & Bebek',
  'Mie & Bakso',
  'Roti & Pastry',
];

const daysList = [
  { day: 1, label: 'Senin' },
  { day: 2, label: 'Selasa' },
  { day: 3, label: 'Rabu' },
  { day: 4, label: 'Kamis' },
  { day: 5, label: 'Jumat' },
  { day: 6, label: 'Sabtu' },
  { day: 7, label: 'Minggu' },
];

export default function RegisterBusiness({ options, kindOptions }: Props) {
  const { auth } = usePage<SharedProps>().props;
  const user = auth?.user;
  const nameParts = (user?.name || '').split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm({
    // Step 1: Informasi Pemilik
    first_name: defaultFirstName,
    last_name: defaultLastName,
    owner_address: '',
    owner_detail: '',
    owner_postal_code: '61254',
    owner_city: 'Sidoarjo',
    owner_province: 'Jawa Timur',
    owner_phone: '81234567890',
    owner_email: user?.email || '',

    // Step 2: Detail Usaha & Gerai
    name: '',
    kind: 'warung',
    business_category: 'Warung makan',
    description: '',
    whatsapp: '',
    photo: null as File | null,
    post_name: 'Gerai Utama',
    address: '',
    landmark: '',
    latitude: options.areas[0]?.latitude ?? -7.387,
    longitude: options.areas[0]?.longitude ?? 112.734,

    // Step 3: Jadwal & Operasional
    opens_at: '08:00',
    closes_at: '21:00',
    active_days: [1, 2, 3, 4, 5, 6, 7],
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setData('photo', file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAreaSelect = (area: AreaOption) => {
    form.setData((data) => ({
      ...data,
      latitude: area.latitude,
      longitude: area.longitude,
    }));
  };

  const toggleDay = (day: number) => {
    const current = form.data.active_days;
    form.setData(
      'active_days',
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validasi Step 1
      if (!form.data.first_name.trim()) {
        form.setError('first_name', 'Nama depan wajib diisi.');
        return;
      }
      form.clearErrors('first_name');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validasi Step 2
      if (!form.data.name.trim()) {
        form.setError('name', 'Nama usaha kuliner wajib diisi.');
        return;
      }
      if (!form.data.description.trim()) {
        form.setError('description', 'Cerita/deskripsi usaha wajib diisi.');
        return;
      }
      if (!form.data.address.trim()) {
        form.setError('address', 'Alamat lengkap gerai jualan wajib diisi.');
        return;
      }
      form.clearErrors('name', 'description', 'address');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    form.post('/kelola-usaha/daftar', {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const stepsConfig = [
    { num: 1, title: 'Informasi Pribadi & Pemilik', desc: 'Nama & kontak pemilik' },
    { num: 2, title: 'Detail Usaha & Gerai', desc: 'Warung, menu & kategori' },
    { num: 3, title: 'Jadwal & Operasional', desc: 'Hari & jam buka' },
    { num: 4, title: 'Ringkasan & Konfirmasi', desc: 'Verifikasi tim Nearasa' },
  ];

  return (
    <>
      <Head title="Pendaftaran Mitra Kuliner - NEARASA" />
      <div className="min-h-screen bg-[#fbf6f3] text-[#2D2321] flex items-center justify-center p-3 sm:p-6 md:p-8 antialiased selection:bg-terracotta-200 selection:text-terracotta-900">
        <main className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(141,50,21,0.08),0_10px_25px_-10px_rgba(0,0,0,0.04)] border border-[#f0e7e1] overflow-hidden transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
            {/* BEGIN: LeftStepperColumn */}
            <aside className="lg:col-span-4 bg-[#fbf6f3]/80 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#ebdcd3] flex flex-col justify-between">
              <div>
                {/* Brand Logo and Wordmark */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8D3215] to-[#B74B28] flex items-center justify-center text-white shadow-md shadow-[#B74B28]/20">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight text-[#8D3215]">
                    NEARASA
                  </span>
                </div>

                {/* Section Heading */}
                <div className="mb-8">
                  <h1 className="text-2xl font-extrabold text-clay-900 tracking-tight">
                    Daftar Mitra & Akun
                  </h1>
                  <p className="text-xs text-clay-600 mt-1 font-medium leading-relaxed">
                    Buka pintu usaha kuliner Anda ke ribuan pelanggan lokal terdekat.
                  </p>
                </div>

                {/* Vertical Stepper Progress Navigation */}
                <nav aria-label="Progress Stepper" className="relative pl-1">
                  <ol className="space-y-6 relative">
                    {stepsConfig.map((step, idx) => {
                      const isActive = currentStep === step.num;
                      const isCompleted = currentStep > step.num;
                      const isUpcoming = currentStep < step.num;

                      return (
                        <li key={step.num} className="relative flex items-start group">
                          {/* Vertical Progress Line to next step */}
                          {idx < stepsConfig.length - 1 && (
                            <div
                              aria-hidden="true"
                              className={`absolute left-[17px] top-[34px] -bottom-[26px] w-[2px] transition-colors duration-200 ${
                                isCompleted ? 'bg-[#B74B28]' : 'bg-[#e7d8ce]'
                              }`}
                            />
                          )}

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (isCompleted) setCurrentStep(step.num);
                              }}
                              disabled={isUpcoming}
                              className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'bg-[#B74B28] text-white shadow-md shadow-[#B74B28]/30 ring-4 ring-terracotta-100 cursor-pointer'
                                  : isActive
                                  ? 'bg-[#B74B28] text-white shadow-md shadow-[#B74B28]/30 ring-4 ring-terracotta-100'
                                  : 'bg-[#f4ebe4] border border-[#e2d2c7] text-clay-500 font-semibold cursor-not-allowed'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 text-white stroke-[2.5]" />
                              ) : (
                                step.num
                              )}
                            </button>
                          </div>

                          <div className="ml-4 mt-0.5">
                            <span
                              className={`block text-xs font-bold leading-snug ${
                                isActive
                                  ? 'text-[#8D3215]'
                                  : isCompleted
                                  ? 'text-clay-900 font-bold'
                                  : 'text-clay-500 font-medium'
                              }`}
                            >
                              {step.num}. {step.title}
                            </span>
                            <span
                              className={`block text-[11px] mt-0.5 ${
                                isActive
                                  ? 'font-bold text-[#B74B28] tracking-wide uppercase text-[10px]'
                                  : 'text-clay-600'
                              }`}
                            >
                              {isActive ? 'Sedang Berlangsung' : step.desc}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </div>

              {/* Helper and Support Info */}
              <div className="mt-8 pt-5 border-t border-[#ebdcd3]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-sand-border flex items-center justify-center text-terracotta shrink-0 shadow-2xs">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-clay-600 leading-tight">
                    Butuh bantuan mendaftar?{' '}
                    <Link href="/kelola-usaha" className="font-bold text-[#B74B28] hover:underline">
                      Kembali ke Dasbor
                    </Link>
                  </p>
                </div>
              </div>
            </aside>
            {/* END: LeftStepperColumn */}

            {/* BEGIN: RightFormColumn */}
            <section className="lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                <div>
                  {/* STEP 1: INFORMASI PRIBADI & PEMILIK */}
                  {currentStep === 1 && (
                    <div className="space-y-7 animate-in fade-in duration-200">
                      {/* Section 1: Data Pribadi Pemilik */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Data Pribadi Pemilik
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="space-y-4">
                          {/* Name Grid: First and Last Name */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="first-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Nama Depan <span className="text-terracotta">*</span>
                              </label>
                              <input
                                id="first-name"
                                type="text"
                                required
                                maxLength={60}
                                placeholder="Nama Depan"
                                value={form.data.first_name}
                                onChange={(e) => form.setData('first_name', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                              {form.errors.first_name && (
                                <p className="text-xs text-rose-600 font-medium mt-1">{form.errors.first_name}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="last-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Nama Belakang
                              </label>
                              <input
                                id="last-name"
                                type="text"
                                maxLength={60}
                                placeholder="Nama Belakang"
                                value={form.data.last_name}
                                onChange={(e) => form.setData('last_name', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Alamat Domisili Pemilik */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Alamat Domisili Pemilik
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <input
                              type="text"
                              placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW)"
                              value={form.data.owner_address}
                              onChange={(e) => form.setData('owner_address', e.target.value)}
                              className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Patokan / Detail Alamat Tambahan (Opsional)"
                              value={form.data.owner_detail}
                              onChange={(e) => form.setData('owner_detail', e.target.value)}
                              className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Kode Pos"
                                value={form.data.owner_postal_code}
                                onChange={(e) => form.setData('owner_postal_code', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Kota / Kabupaten"
                                value={form.data.owner_city}
                                onChange={(e) => form.setData('owner_city', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Provinsi"
                                value={form.data.owner_province}
                                onChange={(e) => form.setData('owner_province', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Kontak & Verifikasi */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Kontak & Verifikasi
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="space-y-4">
                          {/* Phone Number Input with Prefix */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 flex rounded-xl border border-sand-border overflow-hidden focus-within:border-[#B74B28] focus-within:ring-2 focus-within:ring-[#B74B28]/15 transition-all bg-white">
                              <div className="flex items-center gap-2 bg-clay-50 border-r border-sand-border px-3.5 py-3 select-none">
                                <span className="text-sm">🇮🇩</span>
                                <span className="text-xs font-bold text-clay-700">+62</span>
                              </div>
                              <input
                                id="owner-phone"
                                type="tel"
                                placeholder="812 3456 7890"
                                value={form.data.owner_phone}
                                onChange={(e) => form.setData('owner_phone', e.target.value)}
                                className="w-full border-0 px-4 py-3 text-xs font-bold text-clay-900 placeholder-clay-400 focus:ring-0 outline-none"
                              />
                            </div>
                          </div>

                          {/* Email Address Input */}
                          <div>
                            <input
                              type="email"
                              placeholder="Alamat Email Aktif"
                              value={form.data.owner_email}
                              onChange={(e) => form.setData('owner_email', e.target.value)}
                              className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DETAIL USAHA & GERAI */}
                  {currentStep === 2 && (
                    <div className="space-y-7 animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Identitas Usaha Kuliner
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="biz-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                              Nama Usaha Kuliner <span className="text-terracotta">*</span>
                            </label>
                            <input
                              id="biz-name"
                              type="text"
                              required
                              maxLength={120}
                              placeholder="Contoh: Dapur Griya atau Kopi Sudut"
                              value={form.data.name}
                              onChange={(e) => form.setData('name', e.target.value)}
                              className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-bold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                            />
                            {form.errors.name && (
                              <p className="text-xs text-rose-600 font-medium mt-1">{form.errors.name}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="biz-kind" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Bentuk Tempat Jualan <span className="text-terracotta">*</span>
                              </label>
                              <select
                                id="biz-kind"
                                value={form.data.kind}
                                onChange={(e) => form.setData('kind', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-bold text-clay-900 bg-clay-50/40 transition outline-none cursor-pointer"
                              >
                                {kindOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="biz-cat" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Kategori Kuliner Utama
                              </label>
                              <input
                                id="biz-cat"
                                type="text"
                                maxLength={120}
                                placeholder="Contoh: Warung makan"
                                value={form.data.business_category}
                                onChange={(e) => form.setData('business_category', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                          </div>

                          {/* Saran Kategori */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-clay-600 font-medium mr-1">Pilihan cepat:</span>
                            {categorySuggestions.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => form.setData('business_category', cat)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                                  form.data.business_category === cat
                                    ? 'bg-[#B74B28] text-white border-[#B74B28]'
                                    : 'bg-clay-50 text-clay-700 border-sand-border hover:bg-[#fdeee9] hover:text-[#B74B28]'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label htmlFor="biz-desc" className="block text-xs font-bold text-clay-800 mb-1.5">
                              Cerita / Deskripsi Usaha <span className="text-terracotta">*</span>
                            </label>
                            <textarea
                              id="biz-desc"
                              rows={3}
                              required
                              maxLength={2000}
                              placeholder="Ceritakan tentang menu andalan, resep khas, atau keunikan warung kulinermu..."
                              value={form.data.description}
                              onChange={(e) => form.setData('description', e.target.value)}
                              className="w-full p-3.5 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-medium text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none leading-relaxed resize-y"
                            />
                            {form.errors.description && (
                              <p className="text-xs text-rose-600 font-medium mt-1">{form.errors.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pos Penjualan Pertama */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Lokasi Gerai / Pos Pertama
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="post-name" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Nama Gerai / Pos
                              </label>
                              <input
                                id="post-name"
                                type="text"
                                maxLength={120}
                                placeholder="Contoh: Gerai Utama"
                                value={form.data.post_name}
                                onChange={(e) => form.setData('post_name', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                            <div>
                              <label htmlFor="post-landmark" className="block text-xs font-bold text-clay-800 mb-1.5">
                                Patokan Lokasi
                              </label>
                              <input
                                id="post-landmark"
                                type="text"
                                maxLength={120}
                                placeholder="Contoh: Depan gapura perumahan"
                                value={form.data.landmark}
                                onChange={(e) => form.setData('landmark', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="post-address" className="block text-xs font-bold text-clay-800 mb-1.5">
                              Alamat Lengkap Gerai <span className="text-terracotta">*</span>
                            </label>
                            <input
                              id="post-address"
                              type="text"
                              required
                              maxLength={255}
                              placeholder="Contoh: Jl. Griya Permata No. 12, Gedangan, Sidoarjo"
                              value={form.data.address}
                              onChange={(e) => form.setData('address', e.target.value)}
                              className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                            />
                            {form.errors.address && (
                              <p className="text-xs text-rose-600 font-medium mt-1">{form.errors.address}</p>
                            )}
                          </div>

                          {/* Pilihan Wilayah Koordinat */}
                          <div>
                            <label className="block text-xs font-bold text-clay-800 mb-2">
                              Pilih Titik Wilayah Peta
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {options.areas.map((area) => {
                                const isSelected =
                                  form.data.latitude === area.latitude && form.data.longitude === area.longitude;
                                return (
                                  <button
                                    key={area.label}
                                    type="button"
                                    onClick={() => handleAreaSelect(area)}
                                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                      isSelected
                                        ? 'bg-terracotta-50 border-[#B74B28] text-[#B74B28] font-bold'
                                        : 'bg-clay-50/50 border-sand-border hover:bg-[#fdeee9] text-clay-800 font-semibold'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                                      <span className="text-xs truncate">{area.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#B74B28] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Foto Sampul */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Foto Sampul Usaha
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="flex items-center gap-4">
                          {photoPreview ? (
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-sand-border shadow-xs shrink-0">
                              <img src={photoPreview} alt="Pratinjau" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-clay-50 border border-dashed border-sand-border flex flex-col items-center justify-center text-clay-400 shrink-0">
                              <Utensils className="w-6 h-6" />
                              <span className="text-[10px] mt-1">Belum ada</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-sand-border hover:border-[#B74B28] bg-white hover:bg-[#fdeee9] text-clay-800 hover:text-[#B74B28] text-xs font-bold cursor-pointer transition shadow-xs">
                              <Upload className="w-4 h-4" />
                              <span>Pilih Foto Sampul (JPG/PNG/WebP)</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoChange}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[11px] text-clay-600 mt-1">Maksimal 2 MB. Jika tidak diunggah, foto katalog akan digunakan sementara.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: JADWAL & OPERASIONAL */}
                  {currentStep === 3 && (
                    <div className="space-y-7 animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Jam Operasional Rutin
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="reg-opens" className="block text-xs font-bold text-clay-800 mb-1.5">
                              Jam Buka Rutin (WIB) <span className="text-terracotta">*</span>
                            </label>
                            <div className="flex items-center gap-2 bg-clay-50/50 border border-sand-border rounded-xl px-3.5 py-2.5">
                              <Clock className="w-4 h-4 text-terracotta shrink-0" />
                              <input
                                id="reg-opens"
                                type="time"
                                required
                                value={form.data.opens_at}
                                onChange={(e) => form.setData('opens_at', e.target.value)}
                                className="w-full bg-transparent text-xs font-bold text-clay-900 border-0 p-0 focus:ring-0 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="reg-closes" className="block text-xs font-bold text-clay-800 mb-1.5">
                              Jam Tutup Rutin (WIB) <span className="text-terracotta">*</span>
                            </label>
                            <div className="flex items-center gap-2 bg-clay-50/50 border border-sand-border rounded-xl px-3.5 py-2.5">
                              <Clock className="w-4 h-4 text-terracotta shrink-0" />
                              <input
                                id="reg-closes"
                                type="time"
                                required
                                value={form.data.closes_at}
                                onChange={(e) => form.setData('closes_at', e.target.value)}
                                className="w-full bg-transparent text-xs font-bold text-clay-900 border-0 p-0 focus:ring-0 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hari Buka Mingguan */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Hari Buka Rutin
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {daysList.map((d) => {
                            const isChecked = form.data.active_days.includes(d.day);
                            return (
                              <button
                                key={d.day}
                                type="button"
                                onClick={() => toggleDay(d.day)}
                                className={`p-3 rounded-xl border text-center transition cursor-pointer font-bold text-xs ${
                                  isChecked
                                    ? 'bg-terracotta-50 border-[#B74B28] text-[#B74B28]'
                                    : 'bg-clay-50/40 border-sand-border text-clay-600 hover:bg-[#fdeee9]'
                                }`}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* WhatsApp Toko */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Kontak Pemesanan Pelanggan
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        <div>
                          <label htmlFor="reg-wa" className="block text-xs font-bold text-clay-800 mb-1.5">
                            Nomor WhatsApp Gerai (Opsional)
                          </label>
                          <input
                            id="reg-wa"
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={form.data.whatsapp}
                            onChange={(e) => form.setData('whatsapp', e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-sand-border focus:border-[#B74B28] focus:ring-2 focus:ring-[#B74B28]/15 text-xs font-semibold text-clay-900 placeholder-clay-400 bg-clay-50/40 transition outline-none"
                          />
                          <p className="text-[11px] text-clay-600 mt-1">
                            Nomor ini akan tampil di profil publik agar pembeli dapat langsung memesan atau menanyakan menu.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: RINGKASAN & KONFIRMASI */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold tracking-wider text-clay-600 uppercase">
                            Ringkasan Pendaftaran
                          </span>
                          <div className="h-px bg-sand-border flex-1" />
                        </div>

                        {/* Summary Cards */}
                        <div className="space-y-4">
                          {/* Card 1: Data Usaha */}
                          <div className="p-4 bg-clay-50/70 border border-sand-border rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-clay-900 text-sm">{form.data.name || 'Nama Belum Diisi'}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-terracotta-100 text-[#B74B28] font-bold text-[10px]">
                                {form.data.business_category}
                              </span>
                            </div>
                            <p className="text-clay-600 text-xs leading-relaxed">{form.data.description}</p>
                            <div className="pt-2 border-t border-sand-border flex flex-wrap gap-4 text-clay-700 text-[11px]">
                              <span><strong>Bentuk:</strong> {kindOptions.find((k) => k.value === form.data.kind)?.label}</span>
                              <span><strong>WhatsApp:</strong> {form.data.whatsapp || form.data.owner_phone || '-'}</span>
                            </div>
                          </div>

                          {/* Card 2: Lokasi & Jam */}
                          <div className="p-4 bg-clay-50/70 border border-sand-border rounded-2xl space-y-2 text-xs">
                            <span className="font-bold text-clay-900 block">{form.data.post_name}</span>
                            <p className="text-clay-600 text-xs flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                              <span>{form.data.address} {form.data.landmark ? `(Patokan: ${form.data.landmark})` : ''}</span>
                            </p>
                            <p className="text-clay-600 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-terracotta shrink-0" />
                              <span>Buka pukul {form.data.opens_at} - {form.data.closes_at} WIB</span>
                            </p>
                          </div>

                          {/* Card 3: Data Pemilik */}
                          <div className="p-4 bg-white border border-sand-border rounded-2xl text-xs space-y-1">
                            <span className="text-[11px] font-bold text-clay-500 uppercase tracking-wider block">Pemilik Terdaftar:</span>
                            <p className="font-bold text-clay-900">{form.data.first_name} {form.data.last_name}</p>
                            <p className="text-clay-600 text-[11px]">{form.data.owner_email} · +62 {form.data.owner_phone}</p>
                          </div>

                          {/* Terms Check */}
                          <div className="p-4 bg-[#fbf6f3] border border-[#ebdcd3] rounded-2xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#B74B28] shrink-0 mt-0.5" />
                            <p className="text-xs text-clay-700 leading-relaxed font-medium">
                              Dengan mendaftar, Anda menyatakan bahwa informasi usaha dan gerai kuliner di atas adalah benar dan siap dikelola di direktori NEARASA.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-6 mt-8 border-t border-sand-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-sand-border hover:bg-clay-50 text-clay-700 text-xs font-bold transition cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali</span>
                      </button>
                    )}
                    <span className="text-xs text-clay-600 font-medium ml-1">
                      Langkah {currentStep} dari {stepsConfig.length}
                    </span>
                  </div>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#B74B28] hover:bg-[#9c3c1e] text-white font-bold text-xs rounded-full shadow-lg shadow-[#B74B28]/25 hover:shadow-[#9c3c1e]/35 transition-all duration-200 cursor-pointer"
                    >
                      <span>
                        {currentStep === 1
                          ? 'Lanjut ke Detail Usaha'
                          : currentStep === 2
                          ? 'Lanjut ke Jadwal Buka'
                          : 'Lanjut ke Ringkasan'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={form.processing}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#B74B28] hover:bg-[#9c3c1e] text-white font-extrabold text-xs rounded-full shadow-lg shadow-[#B74B28]/25 hover:shadow-[#9c3c1e]/35 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {form.processing ? (
                        <span>Mendaftarkan Usaha...</span>
                      ) : (
                        <>
                          <Store className="w-4 h-4 text-white" />
                          <span>Kirim Pendaftaran & Buka Dasbor</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </section>
            {/* END: RightFormColumn */}
          </div>
        </main>
      </div>
    </>
  );
}
