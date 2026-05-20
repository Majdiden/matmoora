'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

/**
 * Instant-search input. Queries the server-side proxy at /api/search so the
 * Meilisearch key never enters client JS (TECH_SPEC §12.3).
 */
export function SearchBar() {
  const t = useTranslations('Search');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length === 0) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&locale=${locale}`,
      );
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => runSearch(e.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('title')}
        className="w-full rounded-md border border-neutral-300 px-4 py-2 outline-none focus:border-neutral-900"
      />
      <div className="mt-4 text-sm text-neutral-600" aria-live="polite">
        {query.trim().length === 0
          ? t('empty')
          : loading
            ? '…'
            : results && results.length === 0
              ? t('noResults')
              : null}
      </div>
    </div>
  );
}
