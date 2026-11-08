<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class MerchantMediaController extends Controller
{
    public function __invoke(string $file)
    {
        $disk = Storage::disk('public');
        abort_unless($disk->exists('merchant/'.$file), 404);

        $headers = ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'public, max-age=86400'];
        if (str_ends_with($file, '.pdf')) {
            return $disk->download('merchant/'.$file, $file, $headers);
        }

        return $disk->response('merchant/'.$file, null, $headers);
    }
}
