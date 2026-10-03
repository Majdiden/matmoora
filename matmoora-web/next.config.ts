import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const isProd = process.env.NEXT_PUBLIC_ENV === 'production';

/**
 * Where the WordPress admin lives. Headless architecture — wp-admin stays
 * on the CMS host (Railway) and we just redirect editors from the public
 * site's /wp-admin to it. Falls back to the same env var the data layer
 * uses, with the Railway production domain as a last-resort default so
 * builds don't fail if the env isn't wired.
 */
const WP_ADMIN_ORIGIN = (() => {
  const base = process.env.WP_BASE_URL
    ?? (process.env.WORDPRESS_GRAPHQL_ENDPOINT ?? '').replace(/\/graphql\/?$/, '')
    ?? 'https://matmoora-cms-production.up.railway.app';
  return base.replace(/\/$/, '');
})();

/**
 * Production CSP (TECH_SPEC §17.1).
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
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.matmoora.org' },
      { protocol: 'https', hostname: 'matmoora-cms-production.up.railway.app' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  /**
   * Editor-only paths — forward to the WordPress install on Railway so
   * `https://<vercel>/wp-admin` just works instead of 404'ing. Admin UX
   * ends up on the CMS domain (cookies, redirects, two-factor all stay
   * on one origin — the only pattern that doesn't break WP admin).
   */
  async redirects() {
    const admin = [
      { source: '/wp-admin',           destination: `${WP_ADMIN_ORIGIN}/wp-admin/`,         permanent: false },
      { source: '/wp-admin/',          destination: `${WP_ADMIN_ORIGIN}/wp-admin/`,         permanent: false },
      { source: '/wp-admin/:path*',    destination: `${WP_ADMIN_ORIGIN}/wp-admin/:path*`,   permanent: false },
      { source: '/wp-login.php',       destination: `${WP_ADMIN_ORIGIN}/wp-login.php`,      permanent: false },
      { source: '/wp-login',           destination: `${WP_ADMIN_ORIGIN}/wp-login.php`,      permanent: false },
      // Alias for editors — type /admin, land in wp-admin.
      { source: '/admin',              destination: `${WP_ADMIN_ORIGIN}/wp-admin/`,         permanent: false },
    ];
    return admin;
  },
};

export default withNextIntl(nextConfig);
