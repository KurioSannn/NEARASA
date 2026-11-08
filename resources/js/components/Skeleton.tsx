export default function Skeleton({ kind = 'map' }: { kind?: 'map' | 'card' }) {
  return <div className={'content-skeleton skeleton-' + kind} aria-hidden="true">
    <span className="skeleton-block skeleton-large" /><span className="skeleton-block skeleton-line" /><span className="skeleton-block skeleton-short" />
  </div>;
}
