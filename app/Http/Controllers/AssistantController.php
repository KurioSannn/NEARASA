<?php

namespace App\Http\Controllers;

use App\Data\SearchLocation;
use App\Services\AssistantCatalog;
use App\Services\GeminiSearchIntent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function __invoke(Request $request, AssistantCatalog $assistant, GeminiSearchIntent $gemini): JsonResponse
    {
        $input = $request->validate(['prompt' => ['required', 'string', 'max:200']]);
        $prompt = $input['prompt'];

        $isGreeting = (bool) preg_match('/\A(?:halo|hai|hei|permisi|selamat (?:pagi|siang|sore|malam))(?:\s+(?:kak|asisten|nearasa|semua))?[\s!?.]*\z/iu', $prompt);
        $isOutside = (bool) preg_match('/\b(?:html|css|javascript|python|source code|kode program)\b|\b(?:buat|bikin|membuat)\s+(?:web|website|aplikasi)\b/iu', $prompt);
        $isTeam = (bool) preg_match('/\bsiapa\b.*\b(?:firzan|cleo|gani|tim|pembuat(?:nya)?|pengembang(?:nya)?|developer|membuat(?:nya)?|bikin(?:nya)?|membangun(?:nya)?|mendirikan(?:nya)?)\b|\b(?:tim|pembuat|pengembang|developer)\s+(?:dari\s+)?nearasa\b/iu', $prompt);
        $isRegister = (bool) preg_match('/\b(?:daftar|mendaftar|pendaftaran|jadi|menjadi|gabung|bergabung|tambah|menambah|masukin|memasukkan)\b.*\b(?:mitra|umkm|usaha|warung|toko|gerai|jualan)\b|\b(?:cara|gimana|bagaimana)\b.*\b(?:jualan|berjualan)\b/iu', $prompt);
        $isScope = (bool) preg_match('/\b(?:batasan|kemampuan|apa saja yang bisa)\b.*\b(?:asisten|bot|kamu)\b|\b(?:asisten|bot|kamu)\s+bisa\s+(?:apa|ngapain)\b/iu', $prompt);
        $isHelp = (bool) preg_match('/\b(?:cara|gimana|bagaimana)\b.*\b(?:cari|mencari|nyari|pakai|menggunakan)\b/iu', $prompt);
        $isAbout = (bool) preg_match('/\b(?:apa\s+(?:itu\s+)?nearasa|nearasa\s+(?:itu\s+)?apa|(?:web(?:site)?|situs|aplikasi)(?:\s+nearasa)?\s+ini\s+(?:tentang|buat|untuk|isinya)\s+apa|(?:tentang|fungsi|fitur)\s+(?:dari\s+)?nearasa|(?:isi|fitur|fungsi)\s+(?:dari\s+)?(?:web(?:site)?|situs|aplikasi)(?:\s+ini)?|apa\s+(?:fungsi|fitur|tujuan|kegunaan|manfaat)(?:nya)?)\b/iu', $prompt);

        $localIntent = match (true) {
            $isAbout && $isTeam => 'about_and_team',
            $isGreeting => 'greeting',
            $isOutside => 'outside',
            $isTeam => 'team',
            $isRegister => 'register',
            $isScope => 'scope',
            $isHelp => 'help',
            $isAbout => 'about',
            default => null,
        };

        $interpretation = $localIntent === null ? $gemini->interpret($prompt) : null;
        $intent = $localIntent ?? $interpretation['intent'] ?? 'search';
        $reply = match ($intent) {
            'greeting' => 'Halo! Lagi ingin makan apa? Coba ketik “ayam di Gedangan di bawah Rp25 ribu”.',
            'help' => 'Ketik nama makanan atau usaha di sini. Tambahkan area dan anggaran kalau ada, misalnya “ayam di Gedangan di bawah Rp25 ribu”. Ketuk hasil untuk melihat menu dan pos jualannya.',
            'outside' => 'Aku bisa bantu mencari makanan dan usaha kuliner di NEARASA. Coba tanya “ada kopi di Rungkut di bawah Rp20 ribu?”',
            'clarify' => 'Lagi cari makanan, minuman, atau usaha apa? Kamu juga bisa menyebut area atau anggaran.',
            'about_and_team' => "NEARASA membantu kamu menemukan kuliner UMKM di Sidoarjo dan Surabaya. Di Jelajah dan Peta, kamu bisa mencari makanan sesuai lokasi dan anggaran, lalu cek menu, harga, stok, jam buka, dan ulasan tiap pos.\n\nPemilik UMKM bisa mendaftarkan usaha dan mengelola menu, lokasi, serta jadwal jualan. Awards menampilkan peringkat berdasarkan interaksi simulasi.\n\nNEARASA dikembangkan oleh tim bismillah alhamdulillah untuk LOGICODIX 2026. Anggotanya Firzan Syaroni, Cleo Firman Ferdinand, dan Gani Abi Saputra Van Sigu.",
            'about' => "NEARASA membantu kamu menemukan kuliner UMKM di Sidoarjo dan Surabaya. Di Jelajah dan Peta, kamu bisa mencari makanan sesuai lokasi dan anggaran, lalu cek menu, harga, stok, jam buka, dan ulasan tiap pos.\n\nPemilik UMKM bisa mendaftarkan usaha dan mengelola menu, lokasi, serta jadwal jualan. Awards menampilkan peringkat berdasarkan interaksi simulasi.",
            'team' => 'NEARASA dikembangkan oleh tim bismillah alhamdulillah untuk LOGICODIX 2026. Anggotanya Firzan Syaroni, Cleo Firman Ferdinand, dan Gani Abi Saputra Van Sigu.',
            'register' => "Kalau sudah punya akun, masuk ke NEARASA lalu buka Kelola Usaha dan pilih Tambah Usaha.\n\nIsi informasi usaha, lokasi pos pertama, dan jadwal jualannya. Periksa ringkasan, lalu kirim pendaftaran. Setelah itu, tambahkan makanan atau minuman beserta harga lewat tab Menu & harga.",
            'scope' => 'Aku bisa mencari kuliner dari katalog dan menjelaskan cara memakai NEARASA. Kamu bisa bertanya soal fitur, tim pembuat, dan pendaftaran usaha. Untuk mengubah profil usaha, menu, stok, atau jadwal, pemilik perlu membuka Kelola Usaha.',
            default => null,
        };

        $location = SearchLocation::fromSession($request->session()->get('search_location'));
        $result = $reply !== null
            ? ['reply' => $reply, 'places' => []]
            : $assistant->recommend($prompt, $location, $interpretation['keywords'] ?? null);
        $action = match (true) {
            $intent === 'register' => ['href' => route('merchant.register', absolute: false), 'label' => 'Daftar Usaha'],
            in_array($intent, ['about', 'about_and_team', 'help'], true), $intent === 'search' && $result['places'] === [] => ['href' => route('explore', absolute: false), 'label' => 'Buka Jelajah'],
            default => null,
        };

        return response()->json([...$result, 'action' => $action, 'source' => $interpretation === null ? 'catalog' : 'gemini'])
            ->header('Cache-Control', 'private, no-store');
    }
}
