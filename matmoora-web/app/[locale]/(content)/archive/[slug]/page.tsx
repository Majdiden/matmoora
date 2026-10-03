import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { getContentPiece, getInvestigation } from '@/lib/wp/data';
import { localizedTitle, type ContentType } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export const revalidate = 3600;

const typeLabels: Record<ContentType, { ar: string; en: string }> = {
  investigation: { ar: 'تحقيق', en: 'Investigation' },
  article: { ar: 'مقال', en: 'Article' },
  story: { ar: 'قصة', en: 'Story' },
  publication: { ar: 'كتيّب', en: 'Publication' },
  video: { ar: 'فيديو', en: 'Video' },
  audio: { ar: 'صوت', en: 'Audio' },
};

export default async function ArchivePiecePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typed = locale as Locale;
  const t = await getTranslations();

  const item = await getContentPiece(slug);
  if (!item) notFound();

  const parent = item.investigationSlug ? await getInvestigation(item.investigationSlug) : null;

  return (
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link
        href="/archive"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-orange)]"
      >
        <span aria-hidden>{typed === 'ar' ? '→' : '←'}</span>
        {t('Nav.archive')}
      </Link>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-cream)]/15 bg-[var(--color-cream)] text-[var(--color-ink)]"
           style={{ animation: 'fade-up 500ms ease-out both' }}>
        <div className="border-b border-[var(--color-navy)]/15 bg-[var(--color-cream-strong)] px-6 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-orange)]">
            {typeLabels[item.type][typed]}
          </p>
          <h1 className="mt-1 text-lg font-bold leading-snug text-[var(--color-navy)] md:text-xl">
            {localizedTitle(item.title, typed)}
          </h1>
        </div>
        <dl className="grid grid-cols-1 divide-y divide-[var(--color-navy)]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <Cell label={t('Investigation.location')} value={localizedTitle(item.location, typed)} />
          <Cell label={t('Investigation.eventDate')} value={item.eventDate ?? '—'} />
          <Cell label={t('Investigation.partners')} value={item.contributors ?? '—'} />
        </dl>
        <dl className="grid grid-cols-1 divide-y divide-[var(--color-navy)]/10 border-t border-[var(--color-navy)]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <Cell
            label={typed === 'ar' ? 'تحقيق مرتبط' : 'Related investigation'}
            value={parent ? localizedTitle(parent.title, typed) : '—'}
            href={parent ? `/investigations/${parent.slug}` : undefined}
          />
          <Cell
            label={typed === 'ar' ? 'اللغة' : 'Language'}
            value={item.language === 'both' ? (typed === 'ar' ? 'ثنائي' : 'Bilingual') : item.language.toUpperCase()}
          />
          <Cell label={t('Investigation.publishedOn')} value={item.publicationDate} />
        </dl>
        {item.downloadable && (
          <div className="flex items-center justify-center border-t border-[var(--color-navy)]/10 bg-[var(--color-navy)] px-6 py-3">
            <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-cream)]">
              {typed === 'ar' ? 'تحميل المحتوى (PDF)' : 'Download content (PDF)'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v14m0 0-5-5m5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-cream)] p-8 text-[var(--color-ink)] md:p-10"
           style={{ animation: 'fade-up 600ms ease-out 100ms both' }}>
        <div className="mx-auto max-w-3xl">
          {item.excerpt ? (
            <p className="text-base leading-loose text-[var(--color-navy-900)]/90 md:text-lg">
              {localizedTitle(item.excerpt, typed)}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-navy)]/70">
              {typed === 'ar'
                ? 'محتوى هذه القطعة سيُعرض هنا (نصّ، أو فيديو، أو صوت، أو كتيّب) عندما يُربط النظام بالتخزين الحيّ.'
                : 'The full content (text, video, audio, or booklet) will render here once the live CMS is wired.'}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function Cell({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="px-6 py-5 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-orange)]">{label}</dt>
      <dd className="mt-2 line-clamp-2 text-sm font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block bg-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream-strong)]">
        {inner}
      </Link>
    );
  }
  return inner;
}
