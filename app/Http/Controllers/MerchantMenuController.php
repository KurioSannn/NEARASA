<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\MenuItem;
use App\Services\CatalogOptions;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class MerchantMenuController extends Controller
{
    public function store(Request $request, Business $business, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id, 403);

        return $this->save($request, $business, null, $photos);
    }

    public function update(Request $request, Business $business, MenuItem $menu, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $menu->business_id === $business->id, 403);

        return $this->save($request, $business, $menu, $photos);
    }

    private function save(Request $request, Business $business, ?MenuItem $menu, MerchantPhotos $photos)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'group' => ['required', Rule::in(CatalogOptions::GROUPS)],
            'category' => ['required', Rule::in(CatalogOptions::CATEGORIES)],
            'price' => ['required', 'integer', 'min:1', 'max:100000000'],
            'sold_out' => ['required', 'boolean'],
            'photo' => MerchantPhotos::rules(),
            'remove_photo' => ['sometimes', 'boolean'],
        ], ['photo.max' => 'Ukuran foto maksimal 2 MB.', 'photo.mimes' => 'Pilih foto JPG, PNG, atau WebP.', 'price.min' => 'Harga minimal Rp1.']);
        $previous = $menu?->photo;
        unset($data['photo'], $data['remove_photo']);
        $next = $request->hasFile('photo') ? $photos->store($request->file('photo')) : ($request->boolean('remove_photo') ? null : $previous);
        $data['photo'] = $next;
        try {
            if ($menu) {
                $menu->update($data);
            } else {
                $business->menuItems()->create($data);
            }
        } catch (Throwable $error) {
            if ($next !== $previous) {
                $photos->delete($next);
            }
            throw $error;
        }
        if ($next !== $previous) {
            $photos->delete($previous);
        }

        return back(303)->with('success', $menu ? 'Menu berhasil diperbarui.' : 'Menu baru berhasil ditambahkan.');
    }

    public function destroy(Request $request, Business $business, MenuItem $menu, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $menu->business_id === $business->id, 403);
        DB::transaction(function () use ($business, $menu) {
            if ($business->menuItems()->count() <= 1) {
                throw ValidationException::withMessages(['menu' => 'Sisakan minimal satu menu agar usahamu tetap dapat ditemukan.']);
            }
            $menu->delete();
        });
        $photos->delete($menu->photo);

        return back(303)->with('success', 'Menu berhasil dihapus.');
    }
}
