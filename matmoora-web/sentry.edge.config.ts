import * as Sentry from '@sentry/nextjs';

/** Edge runtime Sentry init (middleware, edge routes). */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV ?? 'development',
  tracesSampleRate: 0.1,
});
