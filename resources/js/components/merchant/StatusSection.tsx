import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Archive, ArchiveRestore } from 'lucide-react';
import Dialog from '@/components/Dialog';
import type { MerchantBusiness } from '@/types/business-profile';

export default function StatusSection({ business }: { business: MerchantBusiness }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const archived = business.status === 'archived';
  const published = business.status === 'published';
  const action = archived ? 'Pulihkan usaha' : 'Arsipkan usaha';
  const ActionIcon = archived ? ArchiveRestore : Archive;
  const close = () => {
    if (!processing) setConfirmOpen(false);
  };

  function save() {
    if (processing) return;

    router.post(`/kelola-usaha/${business.slug}/${archived ? 'pulihkan' : 'arsip'}`, {}, {
      preserveScroll: true,
      onStart: () => setProcessing(true),
      onSuccess: () => setConfirmOpen(false),
      onFinish: () => setProcessing(false),
    });
  }

  return (
    <section className="owner-panel owner-visibility" aria-labelledby="owner-visibility-title">
      <div className="owner-visibility-row">
        <div className="owner-visibility-copy">
          <h2 id="owner-visibility-title">Visibilitas usaha</h2>
          <p className="owner-caption">
            {published
              ? `${business.name} tampil di Jelajah dan Peta NEARASA.`
              : `${business.name} disembunyikan dari katalog publik.`}
          </p>
        </div>
        <span className={`owner-status ${published ? 'is-open' : 'neutral'}`}>
          <span aria-hidden="true" />
          {published ? 'Aktif publik' : archived ? 'Diarsipkan' : 'Draf'}
        </span>
      </div>

      <div className="owner-visibility-row">
        <div className="owner-visibility-copy">
          <h3>{action}</h3>
          <p className="owner-caption">
            {archived
              ? 'Tampilkan kembali usaha dengan menu dan jadwal yang sudah tersimpan.'
              : 'Sembunyikan usaha dari katalog. Menu, pos, jadwal, dan ulasan tetap tersimpan.'}
          </p>
        </div>
        <button
          type="button"
          className={`owner-button ${archived ? 'owner-button-secondary' : 'owner-button-danger'}`}
          onClick={() => setConfirmOpen(true)}
        >
          <ActionIcon size={17} aria-hidden="true" />
          {action}
        </button>
      </div>

      {confirmOpen && (
        <Dialog title={`${action}?`} onClose={close}>
          <div className="profile-confirm" aria-busy={processing}>
            <p>
              {archived
                ? `${business.name} akan tampil kembali di Jelajah dan Peta.`
                : `${business.name} akan disembunyikan dari katalog. Kamu bisa memulihkannya dari bagian ini.`}
            </p>
            <div className="profile-confirm-actions">
              <button type="button" className="profile-secondary" onClick={close} disabled={processing}>Batal</button>
              <button type="button" className={archived ? 'owner-button' : 'profile-danger'} onClick={save} disabled={processing}>
                {processing ? 'Menyimpan…' : action}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
