import * as Sentry from '@sentry/nextjs';

/**
 * Server runtime Sentry init (TECH_SPEC §20). No-ops without SENTRY_DSN.
 * Source-map upload + tunnel route aren't wired here — run the Sentry wizard
 * (`npx @sentry/wizard@latest -i nextjs`) before launch to enable them.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV ?? 'development',
  tracesSampleRate: 0.1,
});
