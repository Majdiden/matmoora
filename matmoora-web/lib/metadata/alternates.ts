import type { Metadata } from 'next';
import { locales } from '@/lib/i18n/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Build `alternates` for a route with the same path under each locale.
 * Pass a per-locale path map when slugs differ between languages (most
 * WPML-translated CPTs do — TECH_SPEC §6.1, §10.1).
 *
 *   alternatesFor('/publications/foo')
 *   alternatesFor({ ar: '/publications/foo', en: '/publications/foo-en' })
 */
export function alternatesFor(
  pathOrMap: string | Record<string, string>,
  currentLocale?: string,
): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const path =
      typeof pathOrMap === 'string'
        ? pathOrMap
        : (pathOrMap[locale] ?? Object.values(pathOrMap)[0]);
    languages[locale] = `${SITE_URL}/${locale}${path === '/' ? '' : path}`;
  }
  const currentPath =
    typeof pathOrMap === 'string'
      ? pathOrMap
      : currentLocale && pathOrMap[currentLocale]
        ? pathOrMap[currentLocale]
        : Object.values(pathOrMap)[0];

  return {
    canonical: currentLocale
      ? `${SITE_URL}/${currentLocale}${currentPath === '/' ? '' : currentPath}`
      : undefined,
    languages,
  };
}
