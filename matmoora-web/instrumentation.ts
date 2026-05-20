/**
 * Next.js instrumentation entry — loaded once per runtime at startup
 * (TECH_SPEC §20). Hands off to the runtime-specific Sentry config.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  } else if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
