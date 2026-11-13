<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Services\CatalogOptions;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MerchantRegisterController extends Controller
{
    public function create(Request $request): Response
    {
        $businesses = $request->user()->businesses()->orderBy('name')->get();
        $selected = $businesses->firstWhere('id', $request->session()->get('merchant_business_id')) ?? $businesses->first();

        $merchantNavigation = [
            'businesses' => $businesses->map->only(['id', 'slug', 'name', 'kind', 'photo', 'status', 'is_demo'])->values(),
            'manage_url' => $selected ? route('merchant.edit', $selected->slug, false) : route('merchant.manage', absolute: false),
            'pending_reports' => 0,
        ];

        return Inertia::render('Merchant/RegisterBusiness', [
            'merchantNavigation' => $merchantNavigation,
            'options' => CatalogOptions::all(),
            'kindOptions' => [
                ['value' => 'warung', 'label' => 'Warung Makan'],
                ['value' => 'ruko', 'label' => 'Ruko / Kedai'],
                ['value' => 'rombong', 'label' => 'Rombong / Gerobak'],
                ['value' => 'mobil', 'label' => 'Mobil / Food Truck'],
                ['value' => 'lainnya', 'label' => 'Lainnya'],
            ],
        ]);
    }

    public function store(Request $request, MerchantPhotos $photos)
    {
        $data = $request->validate([
            // Informasi Pribadi & Pemilik
            'owner_nik' => ['nullable', 'string', 'max:20'],
            'first_name' => ['nullable', 'string', 'max:60'],
            'last_name' => ['nullable', 'string', 'max:60'],
            'owner_address' => ['nullable', 'string', 'max:255'],
            'owner_detail' => ['nullable', 'string', 'max:255'],
            'owner_postal_code' => ['nullable', 'string', 'max:10'],
            'owner_city' => ['nullable', 'string', 'max:100'],
            'owner_province' => ['nullable', 'string', 'max:100'],
            'owner_phone' => ['nullable', 'string', 'max:30'],
            'owner_email' => ['nullable', 'email', 'max:254'],

            // Detail Usaha & Gerai
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', Rule::in(['warung', 'ruko', 'rombong', 'mobil', 'lainnya'])],
            'business_category' => ['nullable', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:2000'],
            'whatsapp' => ['nullable', 'string', 'regex:/^(?:08[0-9]{8,11}|\+?628[0-9]{8,11})$/'],
            'photo' => MerchantPhotos::rules(),

            // Lokasi Pos Penjualan Utama
            'post_name' => ['nullable', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:120'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Jam Operasional Rutin
            'opens_at' => ['required', 'date_format:H:i'],
            'closes_at' => ['required', 'date_format:H:i'],
        ], [
            'name.required' => 'Nama usaha kuliner wajib diisi.',
            'kind.required' => 'Pilih bentuk tempat jualan usahamu.',
            'description.required' => 'Deskripsi atau cerita usaha wajib diisi.',
            'address.required' => 'Alamat lokasi jualan pertama wajib diisi.',
            'opens_at.required' => 'Jam buka wajib diisi.',
            'closes_at.required' => 'Jam tutup wajib diisi.',
            'whatsapp.regex' => 'Nomor WhatsApp harus nomor ponsel Indonesia yang valid (contoh: 081234567890).',
            'photo.max' => 'Ukuran foto maksimal 2 MB.',
            'photo.mimes' => 'Pilih foto berformat JPG, PNG, atau WebP.',
        ]);

        $business = DB::transaction(function () use ($request, $data, $photos) {
            // 1. Slug generator yang unik
            $baseSlug = Str::slug($data['name']);
            if (empty($baseSlug)) {
                $baseSlug = 'usaha-kuliner';
            }
            $slug = $baseSlug;
            $counter = 1;
            while (Business::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }

            // 2. Format nomor WhatsApp
            $whatsapp = null;
            if (! empty($data['whatsapp'])) {
                $clean = preg_replace('/[^0-9]/', '', $data['whatsapp']);
                $whatsapp = str_starts_with($clean, '0') ? '62'.substr($clean, 1) : (str_starts_with($clean, '62') ? $clean : '62'.$clean);
            }

            // 3. Simpan foto usaha atau fallback gambar kuliner
            $photoPath = '/images/demo/resto-1.jpg';
            if ($request->hasFile('photo')) {
                $photoPath = $photos->store($request->file('photo'));
            }

            // 4. Buat Business
            $business = Business::create([
                'owner_id' => $request->user()->id,
                'slug' => $slug,
                'name' => $data['name'],
                'kind' => $data['kind'],
                'business_category' => $data['business_category'] ?? null,
                'description' => $data['description'],
                'photo' => $photoPath,
                'whatsapp' => $whatsapp,
                'status' => 'published',
                'is_demo' => false,
            ]);

            // 5. Buat SellingPost pertama
            $lat = ! empty($data['latitude']) ? (float) $data['latitude'] : -7.387;
            $lng = ! empty($data['longitude']) ? (float) $data['longitude'] : 112.734;

            $post = $business->sellingPosts()->create([
                'name' => ! empty($data['post_name']) ? $data['post_name'] : 'Gerai Utama',
                'address' => $data['address'],
                'landmark' => $data['landmark'] ?? '',
                'latitude' => $lat,
                'longitude' => $lng,
                'operating_status' => 'operating',
            ]);

            // 6. Buat Jadwal Rutin 7 Hari
            foreach (range(1, 7) as $day) {
                $post->weeklySchedules()->create([
                    'weekday' => $day,
                    'opens_at' => $data['opens_at'],
                    'closes_at' => $data['closes_at'],
                    'all_day' => false,
                ]);
            }

            return $business;
        });

        // Set session bisnis aktif
        $request->session()->put('merchant_business_id', $business->id);

        return redirect()->route('merchant.index')->with('success', "Usaha {$business->name} berhasil didaftarkan dan kini siap dikelola!");
    }
}
