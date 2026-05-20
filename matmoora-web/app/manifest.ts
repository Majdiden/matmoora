import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Web app manifest. Minimal until brand assets land in Phase 2 — replace the
 * placeholder icon (`app/icon.svg`) and the colors with the locked palette.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Matmoora',
    short_name: 'Matmoora',
    description: 'Bilingual content site',
    start_url: '/ar',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#171717',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    id: SITE_URL,
  };
}
