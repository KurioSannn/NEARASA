<?php

namespace App\Http\Controllers;

use App\Services\CatalogOptions;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('Account', [
            'ownedCount' => $request->user()->businesses()->count(),
            'favoriteCount' => $request->user()->favorites()->count(),
            'publicProfileAvailable' => $request->user()->businesses()->where('status', 'published')->exists(),
            'publicName' => $request->user()->public_name ?? '',
            'options' => CatalogOptions::all(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'not_regex:/[\x00-\x1F]/'],
            'public_name' => ['nullable', 'string', 'max:80', 'not_regex:/[\x00-\x1F]/'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama lengkap maksimal 255 karakter.',
            'public_name.max' => 'Nama publik maksimal 80 karakter.',
        ]);

        $user->forceFill([
            'name' => trim($validated['name']),
            'public_name' => ! empty($validated['public_name']) ? trim($validated['public_name']) : null,
        ])->save();

        return back(303)->with('success', 'Profil berhasil disimpan.');
    }

    public function updateAvatar(Request $request, MerchantPhotos $photos)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'avatar.required' => 'Pilih file gambar untuk foto profil.',
            'avatar.image' => 'File harus berupa gambar (JPG, PNG, atau WebP).',
            'avatar.mimes' => 'Format foto harus JPG, PNG, atau WebP.',
            'avatar.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        $user = $request->user();
        if ($user->avatar) {
            $photos->delete($user->avatar);
        }

        $url = $photos->store($request->file('avatar'));
        $user->forceFill(['avatar' => $url])->save();

        return back(303)->with('success', 'Foto profil berhasil diperbarui.');
    }

    public function destroyAvatar(Request $request, MerchantPhotos $photos)
    {
        $user = $request->user();
        if ($user->avatar) {
            $photos->delete($user->avatar);
            $user->forceFill(['avatar' => null])->save();
        }

        return back(303)->with('success', 'Foto profil berhasil dihapus.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Masukkan kata sandi saat ini.',
            'current_password.current_password' => 'Kata sandi saat ini tidak cocok.',
            'password.required' => 'Masukkan kata sandi baru.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back(303)->with('success', 'Kata sandi berhasil diperbarui.');
    }
}
