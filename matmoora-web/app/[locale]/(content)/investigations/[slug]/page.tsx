import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { SnapshotTable } from '@/components/investigation/SnapshotTable';
import { RelatedList } from '@/components/investigation/RelatedList';
import { ActivityList } from '@/components/investigation/ActivityList';
import { getAllInvestigations, getInvestigation, getRelatedContentFor } from '@/lib/wp/data';
import { localizedTitle } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getAllInvestigations();
  return items.map((i) => ({ slug: i.slug }));
}

export default async function InvestigationPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typed = locale as Locale;
  const t = await getTranslations();

  const inv = await getInvestigation(slug);
  if (!inv) notFound();

  const related = await getRelatedContentFor(inv.relatedContentSlugs);
  const relatedInvs = (
    await Promise.all(inv.relatedInvestigationSlugs.map((s) => getInvestigation(s)))
  ).filter((x): x is NonNullable<typeof x> => Boolean(x));

  const summary = localizedTitle(inv.summary, typed);

  return (
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-orange)]"
      >
        <span aria-hidden>{typed === 'ar' ? '→' : '←'}</span>
        {t('Investigation.backToCollections')}
      </Link>

      <div className="mt-6" style={{ animation: 'fade-up 500ms ease-out both' }}>
        <SnapshotTable inv={inv} locale={typed} t={t} />
      </div>

      <div className="mt-8 rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-cream)] p-8 text-[var(--color-ink)] md:p-10"
           style={{ animation: 'fade-up 600ms ease-out 100ms both' }}>
        <ol className="space-y-10">
          <li>
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold text-[var(--color-orange)]">1.</span>
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">{t('Investigation.snapshot')}</h2>
            </div>
            <p className="mt-3 text-sm leading-loose text-[var(--color-navy-900)]/90 md:text-base">{summary}</p>
          </li>
          {related.length > 0 && (
            <li>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-[var(--color-orange)]">2.</span>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">{t('Investigation.relatedContent')}</h2>
              </div>
              <RelatedList heading="" items={related} locale={typed} />
            </li>
          )}
          {inv.activities.length > 0 && (
            <li>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-[var(--color-orange)]">3.</span>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">{t('Investigation.activities')}</h2>
              </div>
              <ActivityList activities={inv.activities} heading="" locale={typed} />
            </li>
          )}
        </ol>
      </div>

      {relatedInvs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]/70">
            {t('Investigation.relatedInvestigations')}
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {relatedInvs.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/investigations/${r.slug}`}
                  className="block rounded-md border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/40 p-4 transition-colors hover:border-[var(--color-orange)]/60 hover:bg-[var(--color-navy-900)]/60"
                >
                  <p className="text-xs uppercase tracking-widest text-[var(--color-orange)]/80">{r.eventYear}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-cream)]">{localizedTitle(r.title, typed)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
