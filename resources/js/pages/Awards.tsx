import { businessCover } from '@/types/business-images';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpRight, Award, Calendar, ChevronRight, HelpCircle, Info, MapPin, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import CustomerLayout from '@/layouts/CustomerLayout';
import AwardsPodium, { type PodiumItem } from '@/components/AwardsPodium';

interface AwardEntry {
  business_id: number;
  slug: string;
  name: string;
  kind: string;
  cover_photo: string | null;
  is_demo: boolean;
  rank: number;
  score: number;
  metrics: {
    views: number;
    intent: number;
    favorites: number;
    unique_profile_visitors: number;
    unique_interested_visitors: number;
    raw_rate_pct: number;
  };
  score_parts: {
    volume: number;
    smoothed_rate: number;
    ratio_score: number;
    total: number;
    monthly_mean?: number;
    monthly_median?: number;
    months_with_data?: number;
  };
  badge: {
    eligible: boolean;
    rank: number;
    award_type: string;
    label: string;
  };
}

interface AwardsPageProps {
  ranking: {
    schema_version: string;
    formula_version: string;
    data_status: string;
    result_status: string;
    region: string;
    category: string;
    period: string;
    start: string;
    end: string;
    timezone: string;
    params: {
      volume_weight?: number;
      rate_weight?: number;
      volume_target?: number;
      prior_rate?: number;
      prior_strength?: number;
      rate_target?: number;
    };
    eligible_business_count: number;
    minimum_participants: number;
    entries: AwardEntry[];
    notes: string[];
  };
  selectedPeriod: 'weekly' | 'monthly' | 'annual';
  selectedRegion: 'Sidoarjo' | 'Surabaya';
  selectedStart: string;
}

export default function Awards({
  ranking,
  selectedPeriod,
  selectedRegion,
}: AwardsPageProps) {
  const [activeModalEntry, setActiveModalEntry] = useState<AwardEntry | null>(null);

  const qualifiedEntries = ranking.entries.filter(entry => entry.score > 0);
  const hasPodium = qualifiedEntries.length >= ranking.minimum_participants;
  const top3PodiumItems: PodiumItem[] = qualifiedEntries.slice(0, 3).map(entry => ({
    slug: entry.slug,
    name: entry.name,
    city: `${entry.kind} · ${selectedRegion}`,
    rank: entry.rank as 1 | 2 | 3,
    score: entry.score,
    highlightMetric: `${entry.metrics.intent} Peminat`,
    photo: businessCover({ ...entry, photo: entry.cover_photo ?? '' }),
  }));

  // List starts from rank 4 onwards (no repeating top 3!)
  const nextEntries = qualifiedEntries.slice(hasPodium ? 3 : 0);

  const changeFilter = (newPeriod: string, newRegion: string) => {
    router.visit(`/awards?period=${newPeriod}&region=${newRegion}`, {
      preserveScroll: true,
    });
  };

  const periodLabel = selectedPeriod === 'weekly' ? 'Pekan Ini' : selectedPeriod === 'monthly' ? 'Bulan Ini' : 'Tahun Ini';

  return (
    <>
      <Head title={`Tangga Kuliner ${selectedRegion} | NEARASA Awards`} />

      <div className="awards-page-shell">
        {/* Clean Editorial Header (Human, Warm, Anti-AI) */}
        <header className="awards-header-clean">
          <div className="awards-header-meta">
            <span className="awards-kicker-tag">
              <Sparkles size={12} aria-hidden="true" />
              NEARASA Awards
            </span>
            <span className="awards-sim-tag">Simulasi Minat Digital</span>
          </div>

          <h1 className="awards-page-title">Tangga Kuliner {selectedRegion}</h1>
          <p className="awards-page-subtitle">
            Contoh peringkat usaha di {selectedRegion} berdasarkan simulasi buka profil, klik peta, dan klik WhatsApp.
          </p>

          {/* Dual-Axis Filter Toolbar with Explicit Labels (Clear, Human, Anti-Slop) */}
          <div className="awards-filter-toolbar">
            {/* Filter Wilayah */}
            <div className="awards-filter-block">
              <span className="awards-filter-caption">
                <MapPin size={13} aria-hidden="true" />
                <span>Wilayah:</span>
              </span>
              <div className="filter-segmented-pill" role="group" aria-label="Pilih wilayah">
                <button
                  type="button"
                  className={`filter-opt-btn ${selectedRegion === 'Sidoarjo' ? 'is-active' : ''}`}
                  onClick={() => changeFilter(selectedPeriod, 'Sidoarjo')}
                >
                  Sidoarjo
                </button>
                <button
                  type="button"
                  className={`filter-opt-btn ${selectedRegion === 'Surabaya' ? 'is-active' : ''}`}
                  onClick={() => changeFilter(selectedPeriod, 'Surabaya')}
                >
                  Surabaya
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <span className="awards-filter-toolbar-divider" aria-hidden="true" />

            {/* Filter Periode */}
            <div className="awards-filter-block">
              <span className="awards-filter-caption">
                <Calendar size={13} aria-hidden="true" />
                <span>Periode:</span>
              </span>
              <div className="filter-segmented-pill" role="tablist" aria-label="Pilih periode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPeriod === 'weekly'}
                  className={`filter-opt-btn ${selectedPeriod === 'weekly' ? 'is-active' : ''}`}
                  onClick={() => changeFilter('weekly', selectedRegion)}
                >
                  Pekan Ini
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPeriod === 'monthly'}
                  className={`filter-opt-btn ${selectedPeriod === 'monthly' ? 'is-active' : ''}`}
                  onClick={() => changeFilter('monthly', selectedRegion)}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPeriod === 'annual'}
                  className={`filter-opt-btn ${selectedPeriod === 'annual' ? 'is-active' : ''}`}
                  onClick={() => changeFilter('annual', selectedRegion)}
                >
                  Tahun Ini
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Podium Tahta 3 Besar (Reference 2 Inspired) */}
        {hasPodium && (
          <AwardsPodium
            items={top3PodiumItems}
            showLinkToAwards={false}
            showHeader={false}
          />
        )}

        {/* Peringkat Selanjutnya: Starts from #4, #5, #6, ... (No #1 Repeat, No Highlights) */}
        <section className="awards-next-section" aria-labelledby="next-ranks-title">
          <div className="next-section-heading">
            <div>
              <h2 id="next-ranks-title">{hasPodium ? 'Peringkat Selanjutnya' : 'Peringkat'}</h2>
              <p>Klasemen gerai kuliner {hasPodium ? 'peringkat 4 ke atas ' : ''}di {selectedRegion}</p>
            </div>
            <span className="next-count-badge">
              {nextEntries.length} Gerai Kualifikasi
            </span>
          </div>

          {nextEntries.length > 0 ? (
            <div className="billboard-list-group">
              {nextEntries.map(entry => (
                <article
                  key={entry.slug}
                  className="billboard-row"
                  aria-label={`Peringkat ${entry.rank}: ${entry.name}`}
                >
                  <div className="row-left-section">
                    {/* Rank Number */}
                    <div className="row-rank-display" aria-hidden="true">
                      #{entry.rank}
                    </div>

                    {/* Thumbnail */}
                    <div className="row-photo-wrap">
                      <img
                        src={businessCover({ ...entry, photo: entry.cover_photo ?? '' })}
                        alt={`Foto ${entry.name}`}
                        className="row-photo-img"
                        width="70"
                        height="60"
                        loading="lazy"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="row-meta">
                      <h3 className="row-title">
                        <Link href={`/usaha/${entry.slug}`}>{entry.name}</Link>
                      </h3>
                      <p className="row-subtitle">
                        <span>{entry.kind} &middot; {selectedRegion}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stats Columns */}
                  <div className="row-stats-group">
                    <div className="row-stat-col row-score-badge">
                      <span className="row-stat-label">Skor</span>
                      <span className="row-stat-score">{entry.score.toFixed(1)}</span>
                    </div>

                    <div className="row-stat-col">
                      <span className="row-stat-label">Minat (I)</span>
                      <span className="row-stat-value">{entry.metrics.intent}</span>
                    </div>

                    <div className="row-stat-col">
                      <span className="row-stat-label">Pengunjung (V)</span>
                      <span className="row-stat-value">{entry.metrics.views}</span>
                    </div>

                    <div className="row-stat-col">
                      <span className="row-stat-label">Rasio</span>
                      <span className="row-stat-value">{entry.metrics.raw_rate_pct}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="row-actions-col">
                    <Link
                      href={`/usaha/${entry.slug}`}
                      className="row-action-btn"
                      aria-label={`Buka menu ${entry.name}`}
                    >
                      <span>Menu</span>
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      className="row-info-btn"
                      title="Rincian formula"
                      aria-label={`Lihat rincian skor ${entry.name}`}
                      onClick={() => setActiveModalEntry(entry)}
                    >
                      <Info size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="awards-empty-next-box">
              <p>{hasPodium ? 'Semua gerai yang memenuhi syarat tampil di podium.' : 'Belum ada gerai dengan skor di periode ini.'}</p>
            </div>
          )}
        </section>

        {/* Score Breakdown Modal */}
        {activeModalEntry && (
          <div
            className="score-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-entry-name"
            onClick={() => setActiveModalEntry(null)}
          >
            <div
              className="score-modal-box"
              onClick={e => e.stopPropagation()}
            >
              <div className="score-modal-header">
                <div>
                  <h3 className="score-modal-title" id="modal-entry-name">
                    Rincian Skor & Formula
                  </h3>
                  <p className="score-modal-subtitle">
                    {activeModalEntry.name} &middot; Peringkat #{activeModalEntry.rank} ({selectedRegion})
                  </p>
                </div>
                <button
                  type="button"
                  className="score-modal-close"
                  aria-label="Tutup modal"
                  onClick={() => setActiveModalEntry(null)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="score-breakdown-card">
                <div className="text-xs font-bold text-accent uppercase tracking-wider">
                  {selectedPeriod === 'annual' ? '70% rata-rata + 30% median skor bulanan' : 'Volume 60% + rasio minat 40%'}
                </div>

                <div className="score-math-grid">
                  <div className="math-item">
                    <span className="math-item-label">Pengunjung Unik (V)</span>
                    <span className="math-item-val">{activeModalEntry.metrics.views}</span>
                  </div>

                  <div className="math-item">
                    <span className="math-item-label">Peminat Unik (I)</span>
                    <span className="math-item-val">{activeModalEntry.metrics.intent}</span>
                  </div>

                  {selectedPeriod === 'annual' ? (
                    <>
                      <div className="math-item">
                        <span className="math-item-label">Rata-rata bulanan</span>
                        <span className="math-item-val">{activeModalEntry.score_parts.monthly_mean} ({activeModalEntry.score_parts.months_with_data} bulan)</span>
                      </div>
                      <div className="math-item">
                        <span className="math-item-label">Median bulanan</span>
                        <span className="math-item-val">{activeModalEntry.score_parts.monthly_median}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="math-item">
                        <span className="math-item-label">Skor Volume Log (L)</span>
                        <span className="math-item-val">{activeModalEntry.score_parts.volume}</span>
                      </div>

                      <div className="math-item">
                        <span className="math-item-label">Smoothed Rate (R)</span>
                        <span className="math-item-val">{activeModalEntry.score_parts.smoothed_rate}%</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="score-total-bar">
                  <span className="score-total-label">Total Skor Akhir (S)</span>
                  <strong className="score-total-value">
                    {activeModalEntry.score.toFixed(1)}
                  </strong>
                </div>
              </div>

              <p className="score-explanation-text">
                {selectedPeriod === 'annual'
                  ? 'Bulan tanpa data tidak masuk perhitungan rata-rata dan median.'
                  : 'Skor menggabungkan jumlah peminat unik dan rasio minat yang disesuaikan.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Awards.layout = (page: React.ReactNode) => <CustomerLayout>{page}</CustomerLayout>;
