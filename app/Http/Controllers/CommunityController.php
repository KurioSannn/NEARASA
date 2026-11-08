<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\ClosedReport;
use App\Models\PostReview;
use App\Models\SellingPost;
use App\Services\InteractionTracker;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class CommunityController extends Controller
{
    public function review(Request $request, Business $business, SellingPost $post, MerchantPhotos $photos)
    {
        $this->assertPublicPost($business, $post);
        abort_if($business->owner_id === $request->user()->id, 403);
        $data = $request->validate(['rating' => ['required', 'integer', 'between:1,5'], 'comment' => ['nullable', 'string', 'max:2000'], 'photo' => MerchantPhotos::rules()], [
            'rating.required' => 'Pilih 1 sampai 5 bintang.',
            'rating.integer' => 'Pilih 1 sampai 5 bintang.',
            'rating.between' => 'Pilih 1 sampai 5 bintang.',
            'comment.string' => 'Tulis ceritamu dalam bentuk teks.',
            'comment.max' => 'Ceritamu maksimal 2.000 karakter.',
            'photo.image' => 'Pilih foto JPG, PNG, atau WebP.',
            'photo.mimes' => 'Pilih foto JPG, PNG, atau WebP.',
            'photo.max' => 'Ukuran foto maksimal 2 MB.',
            'photo.dimensions' => 'Lebar dan tinggi foto maksimal 6.000 piksel.',
            'photo.uploaded' => 'Foto belum berhasil diunggah. Coba pilih kembali.',
        ]);
        $existing = PostReview::where('selling_post_id', $post->id)->where('user_id', $request->user()->id)->first();
        $previous = $existing?->photo;
        $next = $request->hasFile('photo') ? $photos->store($request->file('photo')) : $previous;
        try {
            PostReview::updateOrCreate(['selling_post_id' => $post->id, 'user_id' => $request->user()->id],
                ['business_id' => $business->id, 'rating' => $data['rating'], 'comment' => $data['comment'] ?? null, 'photo' => $next]);
        } catch (Throwable $error) {
            if ($next !== $previous) {
                $photos->delete($next);
            }
            throw $error;
        }
        if ($next !== $previous) {
            $photos->delete($previous);
        }

        return back(303)->with('success', 'Penilaian untuk '.$post->name.' berhasil disimpan.');
    }

    public function report(Request $request, Business $business, SellingPost $post)
    {
        $this->assertPublicPost($business, $post);
        abort_if($business->owner_id === $request->user()->id, 403);
        $data = $request->validate(['note' => ['nullable', 'string', 'max:500']]);
        $existing = ClosedReport::where('selling_post_id', $post->id)->where('user_id', $request->user()->id)->whereNull('resolved_at')->first();
        if (! $existing) {
            ClosedReport::create(['selling_post_id' => $post->id, 'business_id' => $business->id, 'user_id' => $request->user()->id, 'note' => $data['note'] ?? null]);
        }

        return back(303)->with('success', 'Laporan masuk ke dashboard pemilik untuk diperiksa.');
    }

    public function resolve(Request $request, ClosedReport $report)
    {
        abort_unless($request->user()->businesses()->whereKey($report->business_id)->exists(), 403);
        $report->update(['resolved_at' => now()]);

        return back(303)->with('success', 'Laporan ditandai sudah diperiksa. Jam pos tidak diubah otomatis.');
    }

    public function interaction(Request $request, InteractionTracker $tracker)
    {
        $data = $request->validate(['business_id' => ['required', 'integer'], 'post_id' => ['required', 'integer'],
            'type' => ['required', Rule::in(['menu_open', 'map_click', 'whatsapp_click'])], 'menu_id' => ['nullable', 'integer']]);
        $business = Business::where('status', 'published')->findOrFail($data['business_id']);
        $post = $business->sellingPosts()->findOrFail($data['post_id']);
        if ($data['type'] === 'menu_open') {
            abort_unless(isset($data['menu_id']) && $business->menuItems()->whereKey($data['menu_id'])->exists(), 422);
        }
        if ($data['type'] === 'whatsapp_click') {
            abort_unless(preg_match('/^62[0-9]{8,13}$/', $business->whatsapp ?? ''), 422);
        }
        $tracker->record($request, $business, $post, $data['type']);

        return response()->json(['recorded' => true]);
    }

    private function assertPublicPost(Business $business, SellingPost $post): void
    {
        abort_unless($business->status === 'published' && $post->business_id === $business->id, 404);
    }
}
