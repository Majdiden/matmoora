import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Sitemap with hreflang alternates for both locales (TECH_SPEC §10.2).
 * Currently lists only the static home routes; content-type entries are
 * added here once the Phase 1 content model is locked.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/${routing.defaultLocale}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}`]),
        ),
      },
    },
  ];
}
