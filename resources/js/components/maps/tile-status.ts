import type { TileLayer } from 'leaflet';

export type TileStatus = 'loading' | 'ready' | 'error';
export type TileProgress = { loaded: number; failed: number };

export function watchTiles(layer: TileLayer, notify: (status: TileStatus, progress: TileProgress) => void) {
  let progress: TileProgress = { loaded: 0, failed: 0 };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const report = (status: TileStatus) => notify(status, { ...progress });
  const loading = () => {
    progress = { loaded: 0, failed: 0 };
    clearTimeout(timer);
    report('loading');
    timer = setTimeout(() => report('error'), 10000);
  };
  const error = () => { progress.failed++; report('error'); };
  const tileLoaded = () => { progress.loaded++; if (progress.failed) report('error'); };
  const loaded = () => { clearTimeout(timer); report(progress.failed ? 'error' : 'ready'); };
  layer.on('loading', loading).on('tileerror', error).on('tileload', tileLoaded).on('load', loaded);
  return () => {
    clearTimeout(timer);
    layer.off('loading', loading).off('tileerror', error).off('tileload', tileLoaded).off('load', loaded);
  };
}
