'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export function ArchiveSearchBar() {
  const t = useTranslations('Archive');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set('q', value);
      else next.delete('q');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="archive-search">{t('searchPlaceholder')}</label>
      <span aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--color-navy)]/60">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id="archive-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-md bg-[var(--color-cream)] py-4 ps-12 pe-4 text-[var(--color-navy)] placeholder:text-[var(--color-navy)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
      />
    </div>
  );
}
