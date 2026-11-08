<?php

namespace App\Http\Requests;

class MapCatalogRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'business' => ['nullable', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'post' => ['nullable', 'integer', 'min:1']];
    }
}
