<?php

namespace App\Http\Requests;

use App\Services\BusinessProfile;
use App\Services\MerchantPhotos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MerchantProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('business')->owner_id === $this->user()->id;
    }

    public function rules(): array
    {
        $about = $this->input('section', 'about') === 'about' ? 'required' : 'sometimes';
        $rules = [
            'section' => ['sometimes', Rule::in(['about', 'contact', 'media'])],
            'name' => [$about, 'string', 'max:120'], 'description' => [$about, 'string', 'max:2000'],
            'kind' => [$about, Rule::in(['warung', 'ruko', 'rombong', 'mobil', 'lainnya'])],
            'business_category' => ['sometimes', 'nullable', 'string', 'max:120'],
            'additional_categories' => ['sometimes', 'array', 'list', 'max:8'], 'additional_categories.*' => ['required', 'string', 'max:120', 'distinct'],
            'opened_on' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9 ()-]{7,25}$/'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'regex:/^(?:08[0-9]{8,11}|\+?628[0-9]{8,11})$/'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'website' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'social_links' => ['sometimes', 'array:'.implode(',', BusinessProfile::SOCIAL)],
            'action_links' => ['sometimes', 'array:'.implode(',', BusinessProfile::ACTIONS)],
            'photo' => MerchantPhotos::rules(), 'logo' => MerchantPhotos::rules(),
            'menu_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'], 'remove_menu_pdf' => ['sometimes', 'boolean'],
        ];
        foreach (BusinessProfile::SOCIAL as $key) {
            $rules['social_links.'.$key] = ['nullable', 'url:http,https', 'max:2048'];
        }
        foreach (BusinessProfile::ACTIONS as $key) {
            $rules['action_links.'.$key] = ['nullable', 'url:http,https', 'max:2048'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return ['photo.max' => 'Ukuran foto maksimal 2 MB.', 'logo.max' => 'Ukuran logo maksimal 2 MB.', 'menu_pdf.max' => 'Ukuran PDF maksimal 2 MB.',
            'photo.mimes' => 'Pilih foto JPG, PNG, atau WebP.', 'logo.mimes' => 'Pilih logo JPG, PNG, atau WebP.', 'menu_pdf.mimes' => 'Pilih dokumen PDF.',
            'whatsapp.regex' => 'Gunakan nomor WhatsApp Indonesia, misalnya 081234567890.', 'phone.regex' => 'Masukkan nomor telepon yang valid.',
            'website.url' => 'Masukkan tautan lengkap berawalan https:// atau http://.', 'social_links.*.url' => 'Masukkan tautan media sosial yang lengkap.', 'action_links.*.url' => 'Masukkan tautan lengkap berawalan https:// atau http://.'];
    }
}
