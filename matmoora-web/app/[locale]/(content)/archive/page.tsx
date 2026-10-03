import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArchiveSearchBar } from '@/components/archive/SearchBar';
import { FilterRail } from '@/components/archive/FilterRail';
import { ArchiveList } from '@/components/archive/ArchiveList';
import { PageHeader } from '@/components/design/PageHeader';
import { getArchive, getFacets } from '@/lib/wp/data';
import type { ContentType } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const typed = locale as Locale;
  const t = await getTranslations('Archive');

  const filters = {
    q: typeof sp.q === 'string' ? sp.q : undefined,
    types: arr(sp.type) as ContentType[],
    locations: arr(sp.loc),
    years: arr(sp.year),
    themes: arr(sp.theme),
  };

  const [items, facets] = await Promise.all([getArchive(filters), getFacets()]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        echo={t('echo')}
        intro={t('intro')}
        locale={typed}
      />
      <ArchiveSearchBar />
      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        <FilterRail facets={facets} />
        <div>
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-widest text-[var(--color-cream)]/60">
            <span>{t('resultsCount', { count: items.length })}</span>
          </div>
          {items.length === 0 ? (
            <p className="rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/40 p-8 text-center text-sm text-[var(--color-cream)]/70">
              {t('noResults')}
            </p>
          ) : (
            <ArchiveList items={items} locale={typed} />
          )}
        </div>
      </div>
    </section>
  );
}
