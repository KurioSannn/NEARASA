import { Link } from '@inertiajs/react';
import { ArrowUpRight, Crown, Medal, Sparkles } from 'lucide-react';

export interface PodiumItem {
  slug: string;
  name: string;
  kind?: string;
  photo?: string;
  rank: 1 | 2 | 3;
  score: number;
  highlightMetric?: string;
  city?: string;
}

interface AwardsPodiumProps {
  items: PodiumItem[];
  title?: string;
  subtitle?: string;
  showLinkToAwards?: boolean;
  showHeader?: boolean;
}

export default function AwardsPodium({
  items,
  title = 'Podium Kuliner Paling Diminati',
  subtitle = '3 UMKM teratas pekan ini di Sidoarjo & Surabaya berdasarkan sinyal minat digital (simulasi).',
  showLinkToAwards = true,
  showHeader = true,
}: AwardsPodiumProps) {
  // Find rank 1, 2, 3
  const rank1 = items.find(i => i.rank === 1) ?? items[0];
  const rank2 = items.find(i => i.rank === 2) ?? items[1];
  const rank3 = items.find(i => i.rank === 3) ?? items[2];

  if (!rank1 || !rank2 || !rank3) {
    return null;
  }

  // Visual order on the podium: 2 (Left), 1 (Center - highest), 3 (Right - lowest)
  const podiumOrder = [
    { ...rank2, pillarClass: 'pillar-silver', pillarHeight: 'height-silver', rankNum: 2 },
    { ...rank1, pillarClass: 'pillar-gold', pillarHeight: 'height-gold', rankNum: 1 },
    { ...rank3, pillarClass: 'pillar-bronze', pillarHeight: 'height-bronze', rankNum: 3 },
  ];

  return (
    <div className="awards-podium-section" aria-label="Podium 3 Teratas NEARASA Awards">
      {/* Optional Header */}
      {showHeader && (
        <div className="awards-podium-header">
          <div>
            <div className="awards-podium-kicker">
              <Sparkles size={13} className="text-accent" aria-hidden="true" />
              <span>NEARASA AWARDS &middot; TANGGA KULINER LOKAL</span>
            </div>
            <h2 className="awards-podium-title">{title}</h2>
            <p className="awards-podium-subtitle">{subtitle}</p>
          </div>

          {showLinkToAwards && (
            <Link href="/awards" className="awards-podium-all-link">
              <span>Lihat Klasemen Lengkap</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      {/* 3D-Inspired Podium Pedestals Container */}
      <div className="podium-stage">
        {podiumOrder.map(item => {
          const detailUrl = `/usaha/${item.slug}`;
          const isGold = item.rankNum === 1;
          const isSilver = item.rankNum === 2;

          return (
            <div
              key={item.slug}
              className={`podium-column ${item.pillarClass} ${isGold ? 'is-gold-center' : ''}`}
            >
              {/* Top Float: Avatar / Badge / Info */}
              <div className="podium-contestant">
                {/* Crown / Medal Badge */}
                <div className="podium-badge-icon" aria-hidden="true">
                  {isGold ? (
                    <span className="crown-badge">
                      <Crown size={22} />
                    </span>
                  ) : isSilver ? (
                    <span className="silver-badge">
                      <Medal size={19} />
                    </span>
                  ) : (
                    <span className="bronze-badge">
                      <Medal size={17} />
                    </span>
                  )}
                </div>

                {/* Avatar Ring */}
                <Link
                  href={detailUrl}
                  className="podium-avatar-ring"
                  aria-label={`Buka menu ${item.name}`}
                  tabIndex={-1}
                >
                  <img
                    src={item.photo ?? '/images/brand/nearasa-food-hero-v1.png'}
                    alt={`Foto ${item.name}`}
                    className="podium-avatar-img"
                    width="84"
                    height="84"
                    loading="lazy"
                  />
                </Link>

                {/* Name & Kind */}
                <div className="podium-name-box">
                  <h3 className="podium-name">
                    <Link href={detailUrl}>{item.name}</Link>
                  </h3>
                  {item.city && (
                    <span className="podium-city-tag">{item.city}</span>
                  )}
                </div>

                {/* Stat Pill (e.g. Skor / Minat) */}
                <div className="podium-metric-chip">
                  <span className="metric-chip-score">Skor {item.score.toFixed(1)}</span>
                  {item.highlightMetric && (
                    <span className="metric-chip-sub">&middot; {item.highlightMetric}</span>
                  )}
                </div>
              </div>

              {/* The Physical Pillar / Pedestal / Tahta */}
              <div className={`podium-pillar ${item.pillarHeight}`}>
                <div className="pillar-top-surface" aria-hidden="true" />
                <div className="pillar-front-face">
                  <span className="pillar-rank-num" aria-hidden="true">
                    {item.rankNum}
                  </span>
                  <Link
                    href={detailUrl}
                    className="pillar-cta-btn"
                    aria-label={`Buka gerai ${item.name}`}
                  >
                    <span>Menu</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
