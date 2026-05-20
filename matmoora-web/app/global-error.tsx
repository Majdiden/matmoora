'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Fatal error fallback — only triggered when the root locale layout itself
 * throws. Renders its own <html>/<body> because no layout wraps it.
 *
 * Intentionally locale-blind: if the locale layout failed to mount, we don't
 * have a working next-intl context to translate against.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '40rem',
          margin: '4rem auto',
          padding: '0 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: '0.75rem', color: '#525252' }}>
          The site hit an unexpected error. Please try again in a moment.
        </p>
        {error.digest ? (
          <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a3a3a3' }}>
            {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
