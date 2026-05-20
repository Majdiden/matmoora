import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const isProd = process.env.NEXT_PUBLIC_ENV === 'production';

/**
 * Production CSP (TECH_SPEC §17.1). Restrictive default, opened only for the
 * scripts/origins we actually use:
 *   - Cloudflare Turnstile (forms + comments)
 *   - Sentry tunnel (configure via NEXT_PUBLIC_SENTRY_DSN host)
 *   - WordPress media (next/image remote pattern)
 *
 * Note: 'unsafe-inline' on script-src stays until we adopt nonces — Next 15
 * inlines bootstrap scripts and we'd need middleware nonce injection to drop
 * it cleanly. Tracked as a hardening task.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.sentry.io",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders: { key: string; value: string }[] = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

if (isProd) {
  securityHeaders.push(
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
    { key: 'Content-Security-Policy', value: csp },
  );
}

const nextConfig: NextConfig = {
  images: {
    // Self-hosted WordPress media subdomain — see TECH_SPEC §11.3. Add the
    // Wevrlabs domain here too once known.
    remotePatterns: [{ protocol: 'https', hostname: 'cms.matmoora.org' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
