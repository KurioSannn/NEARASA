<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function create(Request $request)
    {
        $return = $request->query('from');
        if (is_string($return) && strlen($return) <= 4096 && preg_match('#^/usaha/[a-z0-9-]+(?:\?post=[1-9][0-9]*(?:&from=[A-Za-z0-9%._~+\-]+)?)?$#D', $return)) {
            $request->session()->put('url.intended', $return);
        }
        if ($request->user()) {
            return redirect()->intended('/akun');
        }

        return Inertia::render('Auth/Login', [
            'demoEnabled' => app()->environment('local') && config('nearasa.demo_auth'),
        ]);
    }

    public function store(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email', 'max:254'], 'password' => ['required', 'string', 'max:1024']]);
        $credentials['email'] = mb_strtolower(trim($credentials['email']));
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi belum cocok. Coba periksa lagi.']);
        }
        $request->session()->regenerate();

        return redirect()->intended('/akun');
    }

    public function demo(Request $request)
    {
        abort_unless(app()->environment('local') && config('nearasa.demo_auth'), 404);
        $owner = User::where('email', 'pemilik@nearasa.test')->where('is_demo', true)->firstOrFail();
        Auth::login($owner);
        $request->session()->regenerate();

        return redirect()->intended('/akun');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home');
    }
}
