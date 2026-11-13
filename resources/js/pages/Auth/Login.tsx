import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookmarkCheck, Clock, Eye, EyeOff, Store, Utensils } from 'lucide-react';

export default function Login() {
  const form = useForm({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const error = form.errors.email || form.errors.password;
  const busy = form.processing;
  const summary = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) summary.current?.focus();
  }, [error]);

  return (
    <>
      <Head title="Masuk akun" />
      <main className="consumer-auth">
        {/* Left Side: Full-bleed Atmospheric Photo & Brand Story (Airbnb / Editorial Style) */}
        <section className="consumer-auth-art" aria-labelledby="auth-intro-title">
          <div className="consumer-auth-art-header">
            <Link className="header-brand" href="/" aria-label="NEARASA beranda">
              <img
                src="/images/logo/nearasa-logo-white.png"
                alt="NEARASA Kuliner Lokal"
                className="brand-logo logo-white"
                width="132"
                height="48"
              />
            </Link>
          </div>

          <div className="consumer-auth-art-bottom">
            <div className="auth-brand-kicker" aria-hidden="true">
              <Utensils size={13} />
              <span>Komunitas Kuliner Lokal</span>
            </div>

            <h2 id="auth-intro-title">
              Satu akun.<br />Banyak cerita rasa.
            </h2>
            <p>
              Simpan warung favoritmu, pantau menu & jam buka aktual WIB, atau kelola pos usaha kuliner lokalmu.
            </p>

            <div className="consumer-auth-perks-row">
              <span className="auth-perk-pill">
                <BookmarkCheck size={14} aria-hidden="true" />
                <span>Simpan Favorit</span>
              </span>
              <span className="auth-perk-pill">
                <Clock size={14} aria-hidden="true" />
                <span>Jadwal Buka Akurat</span>
              </span>
              <span className="auth-perk-pill">
                <Store size={14} aria-hidden="true" />
                <span>Dukungan UMKM</span>
              </span>
            </div>
          </div>
        </section>

        {/* Right Side: Modern Minimalist Form */}
        <section className="consumer-auth-panel">
          <div className="consumer-auth-panel-top">
            <Link href="/jelajah" className="auth-back-pill">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Jelajah tanpa akun</span>
            </Link>

            <Link href="/" className="header-brand consumer-auth-mobile-logo" aria-label="NEARASA beranda">
              <img
                src="/images/logo/nearasa-logo-colored.png"
                alt="NEARASA Kuliner Lokal"
                className="brand-logo logo-colored"
                width="112"
                height="44"
              />
            </Link>
          </div>

          <div className="consumer-auth-inner">
            <div className="auth-heading-wrap">
              <span className="auth-kicker">Akses Masuk</span>
              <h1>Selamat datang<br />di NEARASA.</h1>
              <p className="consumer-auth-description">
                Masuk untuk menyimpan favorit, melihat riwayat kuliner, atau mengelola usaha.
              </p>
            </div>

            <form
              className="consumer-auth-form"
              aria-busy={busy}
              onSubmit={event => {
                event.preventDefault();
                if (busy) return;
                form.post('/masuk', { onFinish: () => form.reset('password') });
              }}
            >
              <fieldset disabled={busy}>
                <div className="auth-form-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    className="text-input"
                    type="email"
                    autoComplete="username"
                    required
                    maxLength={254}
                    placeholder="nama@email.com"
                    value={form.data.email}
                    onChange={event => form.setData('email', event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>

                <div className="auth-form-field">
                  <label htmlFor="login-password">Kata sandi</label>
                  <div className="consumer-password-field">
                    <input
                      id="login-password"
                      className="text-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      maxLength={1024}
                      placeholder="••••••••"
                      value={form.data.password}
                      onChange={event => form.setData('password', event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(value => !value)}
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p ref={summary} tabIndex={-1} id="login-error" className="consumer-field-error" role="alert">
                    {error}
                  </p>
                )}

                <button className="consumer-auth-submit" type="submit">
                  {form.processing ? 'Memeriksa…' : 'Masuk akun'}
                </button>
              </fieldset>
            </form>

            <p className="consumer-auth-footnote">
              Gunakan akun yang sudah tersedia. Masuk dengan Google belum tersedia pada versi ini.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
