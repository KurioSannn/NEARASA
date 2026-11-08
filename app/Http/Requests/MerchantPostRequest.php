<?php

namespace App\Http\Requests;

use App\Services\BusinessProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class MerchantPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        $business = $this->route('business');
        $post = $this->route('post');

        return $business->owner_id === $this->user()->id && (! $post || $post->business_id === $business->id);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'schedules' => ['required', 'array', 'list', 'min:1', 'max:28'],
            'schedules.*.weekday' => ['required', 'integer', 'between:1,7'],
            'schedules.*.opens_at' => ['required', 'date_format:H:i'],
            'schedules.*.closes_at' => ['required', 'date_format:H:i'],
            'schedules.*.all_day' => ['sometimes', 'boolean'],
            'closed_dates' => ['sometimes', 'array', 'list', 'max:52'],
            'closed_dates.*' => ['required', 'date_format:Y-m-d', 'distinct'],
            'special_hours' => ['sometimes', 'array', 'list', 'max:52'],
            'special_hours.*.date' => ['required', 'date_format:Y-m-d', 'distinct'],
            'special_hours.*.is_closed' => ['required', 'boolean'],
            'special_hours.*.all_day' => ['required', 'boolean'],
            'special_hours.*.opens_at' => ['nullable', 'date_format:H:i'],
            'special_hours.*.closes_at' => ['nullable', 'date_format:H:i'],
            'operating_status' => ['sometimes', Rule::in(['operating', 'temporarily_closed', 'permanently_closed'])],
            'closure_note' => ['sometimes', 'nullable', 'string', 'max:255'],
            'service_area' => ['sometimes', 'nullable', 'string', 'max:255'],
            'service_options' => ['sometimes', 'array', 'list', 'max:4'], 'service_options.*' => ['required', Rule::in(BusinessProfile::SERVICES), 'distinct'],
            'facilities' => ['sometimes', 'array', 'list', 'max:8'], 'facilities.*' => ['required', Rule::in(BusinessProfile::FACILITIES), 'distinct'],
            'payment_methods' => ['sometimes', 'array', 'list', 'max:5'], 'payment_methods.*' => ['required', Rule::in(BusinessProfile::PAYMENTS), 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'schedules.required' => 'Tambahkan minimal satu jadwal buka.',
            'schedules.min' => 'Tambahkan minimal satu jadwal buka.',
            'latitude.required' => 'Pilih titik di peta atau isi latitude.',
            'longitude.required' => 'Pilih titik di peta atau isi longitude.',
            'closed_dates.*.distinct' => 'Tanggal libur ini sudah ditambahkan.',
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $seen = [];
            foreach ((array) $this->input('schedules', []) as $index => $slot) {
                if (! is_array($slot)) {
                    continue;
                }
                $open = $slot['opens_at'] ?? null;
                $close = $slot['closes_at'] ?? null;
                if (! is_string($open) || ! is_string($close) || ! is_scalar($slot['weekday'] ?? null)) {
                    continue;
                }
                if (empty($slot['all_day']) && $open === $close) {
                    $validator->errors()->add("schedules.$index.closes_at", 'Jam tutup harus berbeda dari jam buka.');
                }
                $key = ($slot['weekday'] ?? '').'|'.(! empty($slot['all_day']) ? '00:00' : $open);
                if (isset($seen[$key])) {
                    $validator->errors()->add("schedules.$index.opens_at", 'Hari dan jam buka ini sudah ada.');
                }
                $seen[$key] = true;
            }
            foreach ((array) $this->input('special_hours', []) as $index => $slot) {
                if (! is_array($slot) || ! empty($slot['is_closed']) || ! empty($slot['all_day'])) {
                    continue;
                }
                foreach (['opens_at', 'closes_at'] as $field) {
                    if (empty($slot[$field])) {
                        $validator->errors()->add("special_hours.$index.$field", 'Isi jam buka dan tutup untuk tanggal ini.');
                    }
                }
                if (is_string($slot['opens_at'] ?? null) && $slot['opens_at'] === ($slot['closes_at'] ?? null)) {
                    $validator->errors()->add("special_hours.$index.closes_at", 'Jam tutup harus berbeda dari jam buka.');
                }
            }
        }];
    }
}
