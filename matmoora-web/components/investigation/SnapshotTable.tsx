import { localizedTitle, type InvestigationFx } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export function SnapshotTable({
  inv,
  locale,
  t,
}: {
  inv: InvestigationFx;
  locale: Locale;
  t: (k: string) => string;
}) {
  const title = localizedTitle(inv.title, locale);
  const location = localizedTitle(inv.location, locale);
  const methodology = localizedTitle(inv.methodology, locale);
  const timeframe = localizedTitle(inv.timeframe, locale);
  const partners = inv.partners.length
    ? inv.partners.join(' · ')
    : locale === 'ar' ? 'مطمورة' : 'Matmoora';

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-cream)]/15 bg-[var(--color-cream)] text-[var(--color-ink)]">
      <div className="border-b border-[var(--color-navy)]/15 bg-[var(--color-cream-strong)] px-6 py-4 text-center">
        <h1 className="text-lg font-bold leading-snug text-[var(--color-navy)] md:text-xl">{title}</h1>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-[var(--color-navy)]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <Cell label={t('Investigation.location')} value={location} />
        <Cell label={t('Investigation.eventDate')} value={timeframe} />
        <Cell label={t('Investigation.partners')} value={partners} />
      </dl>
      <dl className="grid grid-cols-1 divide-y divide-[var(--color-navy)]/10 border-t border-[var(--color-navy)]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <Cell label={t('Investigation.methodology')} value={methodology} href={`/about#methodology`} />
        <Cell
          label={t('Investigation.activities')}
          value={inv.activities.length > 0 ? `${inv.activities.length} ${locale === 'ar' ? 'نشاط' : 'events'}` : '—'}
          href={inv.activities.length > 0 ? `#activities` : undefined}
        />
        <Cell label={t('Investigation.publishedOn')} value={inv.publicationYear} />
      </dl>
      <div className="grid grid-cols-1 divide-y divide-[var(--color-navy)]/10 border-t border-[var(--color-navy)]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <Cell
          label={t('Investigation.languages')}
          value={inv.languages.map((l) => (l === 'ar' ? 'العربية' : 'English')).join(' · ')}
        />
        <div className="flex items-center justify-center bg-[var(--color-navy)] px-6 py-5 text-center transition-colors hover:bg-[var(--color-navy-900)]">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-cream)]">
            <span>{t('Investigation.downloadPdf')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3v14m0 0-5-5m5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 21h16" strokeLinecap="round" />
            </svg>
          </a>
        </div>
        <Cell
          label={t('Investigation.languages')}
          value={inv.languages.length > 1 ? (locale === 'ar' ? 'ثنائي اللغة' : 'Bilingual') : (inv.languages[0] === 'ar' ? 'العربية' : 'English')}
        />
      </div>
    </div>
  );
}

function Cell({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="px-6 py-5 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-orange)]">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block bg-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream-strong)]">
        {content}
      </a>
    );
  }
  return content;
}
