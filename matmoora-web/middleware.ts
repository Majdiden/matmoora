import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

/**
 * Locale-prefix enforcement only. Bare `/` redirects to `/ar` (default locale).
 * No header sniffing — the URL is the source of truth (TECH_SPEC §6.2).
 */
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
