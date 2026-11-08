<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantPostRequest;
use App\Models\Business;
use App\Models\PostReview;
use App\Models\SellingPost;
use App\Services\MerchantPhotos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MerchantPostController extends Controller
{
    public function store(MerchantPostRequest $request, Business $business)
    {
        return $this->save($request, $business);
    }

    public function update(MerchantPostRequest $request, Business $business, SellingPost $post)
    {
        return $this->save($request, $business, $post);
    }

    private function save(MerchantPostRequest $request, Business $business, ?SellingPost $post = null)
    {
        $data = $request->validated();
        DB::transaction(function () use ($data, $business, $post) {
            $fields = [...collect($data)->only(['name', 'address', 'landmark', 'latitude', 'longitude', 'operating_status', 'closure_note', 'service_area', 'service_options', 'facilities', 'payment_methods'])->all(), 'landmark' => $data['landmark'] ?? ''];
            if ($post) {
                $post->update($fields);
            } else {
                $post = $business->sellingPosts()->create($fields);
            }
            $post->weeklySchedules()->delete();
            $post->weeklySchedules()->createMany(collect($data['schedules'])->map(fn ($slot) => ['weekday' => $slot['weekday'], 'opens_at' => ! empty($slot['all_day']) ? '00:00' : $slot['opens_at'], 'closes_at' => ! empty($slot['all_day']) ? '00:00' : $slot['closes_at'], 'all_day' => $slot['all_day'] ?? false])->all());
            $post->scheduleExceptions()->delete();
            $special = collect($data['special_hours'] ?? [])->map(fn ($day) => ['date' => $day['date'], 'is_closed' => $day['is_closed'], 'all_day' => $day['is_closed'] ? false : $day['all_day'], 'opens_at' => $day['is_closed'] || $day['all_day'] ? null : $day['opens_at'], 'closes_at' => $day['is_closed'] || $day['all_day'] ? null : $day['closes_at']])->keyBy('date');
            foreach ($data['closed_dates'] ?? [] as $date) {
                $special->put($date, ['date' => $date, 'is_closed' => true]);
            }
            $post->scheduleExceptions()->createMany($special->values()->all());
        });

        return back(303)->with('success', $post ? 'Lokasi dan jadwal berhasil diperbarui.' : 'Pos jualan baru berhasil ditambahkan.');
    }

    public function destroy(Request $request, Business $business, SellingPost $post, MerchantPhotos $photos)
    {
        abort_unless($business->owner_id === $request->user()->id && $post->business_id !== null && $post->business_id === $business->id, 403);
        $reviewPhotos = DB::transaction(function () use ($business, $post) {
            if ($business->sellingPosts()->count() <= 1) {
                throw ValidationException::withMessages(['post' => 'Sisakan minimal satu pos jualan agar pelanggan dapat menemukan lokasimu.']);
            }
            $files = PostReview::where('selling_post_id', $post->id)->whereNotNull('photo')->pluck('photo')->all();
            $post->delete();

            return $files;
        });
        foreach ($reviewPhotos as $file) {
            $photos->delete($file);
        }

        return back(303)->with('success', 'Pos jualan berhasil dihapus.');
    }
}
