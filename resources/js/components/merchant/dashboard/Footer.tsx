import { Link } from '@inertiajs/react';

export default function Footer() {
  return (
    <footer
      className="site-footer !hidden lg:!flex w-full !mb-0 !pb-1 mt-auto"
      style={{ marginBottom: 0, paddingBottom: 0, fontFamily: 'var(--font-sans)' }}
    >
      <Link className="footer-brand" href="/" aria-label="NEARASA beranda">
        <img
          src="/images/logo/nearasa-logo-colored.png"
          alt="NEARASA Kuliner Lokal"
          className="footer-logo"
          width="92"
          height="40"
        />
      </Link>
      <p className="!text-clay-800 font-medium">Rasa lokal terdekat di sekitarmu.</p>
      <span className="!text-clay-800 font-medium">Panduan kuliner UMKM · Sidoarjo & Surabaya</span>
    </footer>
  );
}
