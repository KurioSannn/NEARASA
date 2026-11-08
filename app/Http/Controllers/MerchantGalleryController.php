<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessPhoto;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class MerchantGalleryController extends Controller
{
    public function store(Request $request, Business $business, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id, 403);
        $data = $request->validate(['photo' => ['required', ...MerchantPhotos::rules()], 'caption' => ['nullable', 'string', 'max:255'], 'kind' => ['required', Rule::in(['storefront', 'food', 'atmosphere', 'other'])]]);
        if ($business->galleryPhotos()->count() >= 12) {
            throw ValidationException::withMessages(['photo' => 'Galeri memuat maksimal 12 foto. Hapus salah satu untuk menambahkan foto baru.']);
        }
        $url = $photos->store($request->file('photo'));
        try {
            $business->galleryPhotos()->create([...$data, 'caption' => $data['caption'] ?? '', 'photo' => $url]);
        } catch (Throwable $error) {
            $photos->delete($url);
            throw $error;
        }

        return back(303)->with('success', 'Foto berhasil ditambahkan ke galeri.');
    }

    public function update(Request $request, Business $business, BusinessPhoto $photo)
    {
        abort_unless($business->owner_id === $request->user()->id && $photo->business_id === $business->id, 403);
        $data = $request->validate(['caption' => ['nullable', 'string', 'max:255'], 'kind' => ['required', Rule::in(['storefront', 'food', 'atmosphere', 'other'])]]);
        $photo->update([...$data, 'caption' => $data['caption'] ?? '']);

        return back(303)->with('success', 'Keterangan foto berhasil disimpan.');
    }

    public function destroy(Request $request, Business $business, BusinessPhoto $photo, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $photo->business_id === $business->id, 403);
        $photo->delete();
        $photos->delete($photo->photo);

        return back(303)->with('success', 'Foto galeri berhasil dihapus.');
    }
}
