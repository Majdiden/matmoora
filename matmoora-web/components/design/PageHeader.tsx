import type { Locale } from '@/lib/i18n/config';

/**
 * Shared page header — bilingual title stack (main + muted echo in the
 * other language) with the site's orange dashed accent bar. Used by
 * Collections, Archive, and About so the pages read as one family.
 */
export function PageHeader({
  eyebrow,
  title,
  echo,
  intro,
  locale,
  children,
}: {
  eyebrow?: string;
  title: string;
  echo?: string;
  intro?: string;
  locale: Locale;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative mb-12 md:mb-16">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <p
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-orange)]"
              style={{ animation: 'fade-up 500ms ease-out both' }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={`mt-4 text-4xl font-bold leading-tight tracking-tight text-[var(--color-cream)] md:text-5xl ${
              locale === 'ar' ? 'md:text-6xl' : ''
            }`}
            style={{ animation: 'fade-up 600ms ease-out 60ms both' }}
          >
            {title}
          </h1>
          {echo && (
            <p
              lang={locale === 'ar' ? 'en' : 'ar'}
              dir={locale === 'ar' ? 'ltr' : 'rtl'}
              className="mt-2 text-sm font-medium tracking-[0.14em] text-[var(--color-cream)]/50 md:text-base"
              style={{ animation: 'fade-up 700ms ease-out 120ms both' }}
            >
              {echo}
            </p>
          )}
          {intro && (
            <p
              className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-cream)]/80 md:text-lg"
              style={{ animation: 'fade-up 800ms ease-out 180ms both' }}
            >
              {intro}
            </p>
          )}
        </div>
        {children && (
          <div style={{ animation: 'fade-up 800ms ease-out 240ms both' }}>{children}</div>
        )}
      </div>

      <div
        aria-hidden
        className="mt-8 flex items-center gap-3"
        style={{ animation: 'fade-up 900ms ease-out 300ms both' }}
      >
        <span className="h-px flex-1 bg-[var(--color-cream)]/10" />
        <svg width="80" height="6" viewBox="0 0 80 6" fill="none" className="shrink-0">
          <line x1="0" y1="3" x2="80" y2="3" stroke="var(--color-orange)" strokeWidth="1.2" strokeDasharray="4 4" />
        </svg>
        <span className="h-px flex-1 bg-[var(--color-cream)]/10" />
      </div>
    </header>
  );
}
