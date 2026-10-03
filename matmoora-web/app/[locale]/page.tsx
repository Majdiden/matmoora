import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InvestigationGrid } from '@/components/collections/InvestigationGrid';
import { PageHeader } from '@/components/design/PageHeader';
import { getAllInvestigations } from '@/lib/wp/data';
import type { Locale } from '@/lib/i18n/config';

export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typed = locale as Locale;
  const t = await getTranslations('Home');
  const investigations = await getAllInvestigations();

  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-14">
      <div className="pointer-events-none absolute end-6 top-4 hidden md:block" aria-hidden>
        <CornerScribble />
      </div>

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        echo={t('echo')}
        intro={t('intro')}
        locale={typed}
      />

      <div className="mt-2">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-cream)]">{t('eventsHeading')}</h2>
            <p className="mt-1 text-sm text-[var(--color-cream)]/70">{t('eventsSub')}</p>
          </div>
          <span aria-hidden className="hidden text-xs uppercase tracking-widest text-[var(--color-cream)]/40 md:block">
            {investigations.length} / {investigations.length}
          </span>
        </div>

        {investigations.length === 0 ? (
          <p className="rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/40 p-8 text-center text-sm text-[var(--color-cream)]/70">
            {t('empty')}
          </p>
        ) : (
          <InvestigationGrid items={investigations} locale={typed} />
        )}
      </div>
    </section>
  );
}

function CornerScribble() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden>
      <path d="M4 60 C 20 40, 40 20, 70 22 S 120 40, 136 8" stroke="var(--color-orange)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 70 C 24 56, 46 36, 80 32 S 122 50, 136 22" stroke="var(--color-cream)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" opacity="0.6" />
    </svg>
  );
}
