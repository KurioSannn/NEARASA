<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\MenuItem;
use App\Models\SellingPost;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MerchantOperationsController extends Controller
{
    public function availability(Request $request, Business $business, SellingPost $post, MenuItem $menu): RedirectResponse
    {
        $this->authorizePost($request, $business, $post);
        abort_unless($menu->business_id === $business->id, 403);
        $data = $request->validate(['sold_out' => ['required', 'boolean']]);
        $post->menuAvailability()->syncWithoutDetaching([$menu->id => ['sold_out' => (bool) $data['sold_out']]]);

        return back(303)->with('success', 'Ketersediaan menu di pos ini berhasil diperbarui.');
    }

    public function storeTodayHours(Request $request, Business $business, SellingPost $post): RedirectResponse
    {
        $this->authorizePost($request, $business, $post);
        if ($post->operating_status === 'permanently_closed') {
            throw ValidationException::withMessages(['post' => 'Pos tutup permanen. Ubah kondisi operasional melalui pengaturan pos terlebih dahulu.']);
        }
        $data = $request->validate(['opens_at' => ['required', 'date_format:H:i'], 'closes_at' => ['required', 'date_format:H:i', 'different:opens_at']], [
            'opens_at.required' => 'Isi jam buka terlebih dahulu.', 'opens_at.date_format' => 'Gunakan jam buka dalam format jam:menit.',
            'closes_at.required' => 'Isi jam tutup terlebih dahulu.', 'closes_at.date_format' => 'Gunakan jam tutup dalam format jam:menit.',
            'closes_at.different' => 'Jam tutup harus berbeda dari jam buka.',
        ]);
        $now = CarbonImmutable::now('Asia/Jakarta');
        $anchor = $post->today_opens_at && $post->today_closes_at?->greaterThan($now)
            && $post->today_opens_at->lessThan($now->startOfDay()) && $data['opens_at'] > $data['closes_at'] ? $post->today_opens_at : $now;
        $start = $anchor->setTimeFromTimeString($data['opens_at'].':00');
        $end = $anchor->setTimeFromTimeString($data['closes_at'].':00');
        if ($end->lessThan($start)) {
            $end = $end->addDay();
        }
        if ($end->lessThanOrEqualTo($now)) {
            throw ValidationException::withMessages(['closes_at' => 'Pilih jam tutup yang belum lewat.']);
        }
        $post->update(['today_opens_at' => $start, 'today_closes_at' => $end, 'hours_updated_at' => $now, 'operating_status' => 'operating', 'closure_note' => null]);

        return back(303)->with('success', 'Jam khusus hari ini disimpan. Setelah sesi berakhir, jadwal rutin berlaku kembali.');
    }

    public function destroyTodayHours(Request $request, Business $business, SellingPost $post): RedirectResponse
    {
        $this->authorizePost($request, $business, $post);
        $post->update(['today_opens_at' => null, 'today_closes_at' => null, 'hours_updated_at' => CarbonImmutable::now('Asia/Jakarta')]);

        return back(303)->with('success', 'Jam khusus dihapus. Jadwal rutin berlaku kembali sesuai kondisi operasional pos.');
    }

    private function authorizePost(Request $request, Business $business, SellingPost $post): void
    {
        abort_unless($request->user() && $business->owner_id === $request->user()->id && $post->business_id === $business->id, 403);
    }
}
