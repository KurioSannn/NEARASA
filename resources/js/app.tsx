import '../css/app.css';
import '../css/business-profile.css';
import '../css/merchant-profile.css';
import '../css/discovery.css';
import '../css/map-discovery.css';
import '../css/public-profile.css';
import '../css/merchant-redesign.css';
import '../css/merchant-dashboard.css';
import '../css/consumer-pages.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { type ComponentType } from 'react';

createInertiaApp({
  title: title => title ? `${title} · NEARASA` : 'NEARASA',
  resolve: async name => {
    const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx');
    return (await pages[`./pages/${name}.tsx`]()).default;
  },
  setup({ el, App, props }) { createRoot(el).render(<App {...props} />); },
  progress: { color: '#B74A2B', showSpinner: false },
});
