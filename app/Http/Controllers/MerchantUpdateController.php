<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessUpdate;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class MerchantUpdateController extends Controller
{
    public function store(Request $request, Business $business, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id, 403);

        return $this->save($request, $business, null, $photos);
    }

    public function update(Request $request, Business $business, BusinessUpdate $update, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $update->business_id === $business->id, 403);

        return $this->save($request, $business, $update, $photos);
    }

    private function save(Request $request, Business $business, ?BusinessUpdate $update, MerchantPhotos $photos)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['update', 'offer', 'event'])], 'title' => ['required', 'string', 'max:120'], 'body' => ['required', 'string', 'max:5000'],
            'is_published' => ['required', 'boolean'], 'starts_on' => ['nullable', 'date_format:Y-m-d'],
            'ends_on' => ['nullable', 'date_format:Y-m-d', ...($request->filled('starts_on') ? ['after_or_equal:starts_on'] : [])],
            'cta_label' => ['nullable', 'string', 'max:50'], 'cta_url' => ['nullable', 'url:http,https', 'max:2048'],
            'photo' => MerchantPhotos::rules(), 'remove_photo' => ['sometimes', 'boolean'],
        ], ['ends_on.after_or_equal' => 'Tanggal berakhir tidak boleh sebelum tanggal mulai.', 'cta_url.url' => 'Masukkan tautan lengkap berawalan https:// atau http://.']);
        $previous = $update?->photo;
        unset($data['photo'], $data['remove_photo']);
        $next = $request->hasFile('photo') ? $photos->store($request->file('photo')) : ($request->boolean('remove_photo') ? null : $previous);
        try {
            $fields = [...$data, 'photo' => $next];
            $update ? $update->update($fields) : $business->updates()->create($fields);
        } catch (Throwable $error) {
            if ($next !== $previous) {
                $photos->delete($next);
            }
            throw $error;
        }
        if ($next !== $previous) {
            $photos->delete($previous);
        }

        return back(303)->with('success', 'Kabar usaha berhasil disimpan.');
    }

    public function destroy(Request $request, Business $business, BusinessUpdate $update, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $update->business_id === $business->id, 403);
        $update->delete();
        $photos->delete($update->photo);

        return back(303)->with('success', 'Kabar usaha berhasil dihapus.');
    }
}
