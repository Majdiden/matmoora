import { Link } from '@/lib/i18n/navigation';
import { localizedTitle, type ContentPieceFx } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export function RelatedList({
  heading,
  items,
  locale,
  typeBadge = true,
}: {
  heading: string;
  items: ContentPieceFx[];
  locale: Locale;
  typeBadge?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      {heading && (
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-orange)]">
          {heading}
        </h2>
      )}
      <ul className="mt-4 divide-y divide-[var(--color-navy)]/10 rounded-lg border border-[var(--color-navy)]/10 bg-[var(--color-cream)]/95">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/archive/${item.slug}`}
              className="group flex items-baseline gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-cream-strong)]"
            >
              {typeBadge && (
                <span className="rounded-full border border-[var(--color-navy)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-navy)]">
                  {typeLabel(item.type, locale)}
                </span>
              )}
              <span className="flex-1 text-sm font-medium text-[var(--color-navy)] group-hover:text-[var(--color-orange)]">
                {localizedTitle(item.title, locale)}
              </span>
              <span className="text-xs text-[var(--color-navy)]/60">{item.publicationDate.slice(0, 4)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function typeLabel(t: ContentPieceFx['type'], locale: Locale) {
  const ar: Record<ContentPieceFx['type'], string> = {
    investigation: 'تحقيق', article: 'مقال', story: 'قصة', publication: 'كتيّب', video: 'فيديو', audio: 'صوت',
  };
  const en: Record<ContentPieceFx['type'], string> = {
    investigation: 'Investigation', article: 'Article', story: 'Story', publication: 'Publication', video: 'Video', audio: 'Audio',
  };
  return locale === 'ar' ? ar[t] : en[t];
}
