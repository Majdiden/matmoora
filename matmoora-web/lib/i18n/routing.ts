import { defineRouting } from 'next-intl/routing';

/**
 * Bilingual routing. Arabic is the default and the brand's primary language;
 * English is secondary. Locale lives in the URL prefix and is the single
 * source of truth — no Accept-Language sniffing (TECH_SPEC §6.1).
 */
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  localeDetection: false,
});
