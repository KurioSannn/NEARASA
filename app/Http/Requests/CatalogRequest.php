<?php

namespace App\Http\Requests;

use App\Services\CatalogOptions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['q' => ['nullable', 'string', 'max:100'], 'group' => ['nullable', Rule::in(CatalogOptions::GROUPS)],
            'category' => ['nullable', Rule::in(CatalogOptions::CATEGORIES)], 'max_price' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'radius' => ['nullable', function ($attribute, $value, $fail) {
                if ($value !== 'unlimited' && (! is_numeric($value) || ! is_finite((float) $value) || (float) $value < 0.5 || (float) $value > 50)) {
                    $fail('Pilih radius 0,5–50 km atau tanpa batas.');
                }
            }]];
    }
}
