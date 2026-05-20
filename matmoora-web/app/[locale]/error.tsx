'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Segment error boundary — caught client-side, locale-aware (TECH_SPEC §15).
 * Anything thrown in a route under [locale] lands here with a reset hook.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  useEffect(() => {
    // Sentry's onRequestError already captured this server-side; the digest
    // gives editors a string to quote when reporting an issue.
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-neutral-600">{t('description')}</p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-neutral-400">{error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        {t('retry')}
      </button>
    </section>
  );
}
