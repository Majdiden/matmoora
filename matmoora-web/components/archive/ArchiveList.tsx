import { Link } from '@/lib/i18n/navigation';
import { localizedTitle, type ContentPieceFx } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

const typeLabels: Record<ContentPieceFx['type'], { ar: string; en: string }> = {
  investigation: { ar: 'تحقيق', en: 'Investigation' },
  article: { ar: 'مقال', en: 'Article' },
  story: { ar: 'قصة', en: 'Story' },
  publication: { ar: 'كتيّب', en: 'Publication' },
  video: { ar: 'فيديو', en: 'Video' },
  audio: { ar: 'صوت', en: 'Audio' },
};

export function ArchiveList({ items, locale }: { items: ContentPieceFx[]; locale: Locale }) {
  return (
    <ul className="space-y-4">
      {items.map((item, idx) => (
        <li key={item.slug} style={{ animation: `card-in 400ms ease-out ${idx * 40}ms both` }}>
          <Link
            href={`/archive/${item.slug}`}
            className="group block rounded-lg bg-[var(--color-cream)] p-5 text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)] md:p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  <span className="rounded-full border border-[var(--color-orange)]/50 px-2 py-0.5 text-[var(--color-orange)]">
                    {typeLabels[item.type][locale]}
                  </span>
                  <span className="text-[var(--color-navy)]/50">
                    {(item.eventDate ?? item.publicationDate).slice(0, 4)}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[var(--color-navy)] group-hover:text-[var(--color-orange)] md:text-lg">
                  {localizedTitle(item.title, locale)}
                </h3>
                {item.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-navy-900)]/80">
                    {localizedTitle(item.excerpt, locale)}
                  </p>
                )}
              </div>
              <div className="hidden shrink-0 text-end text-xs text-[var(--color-navy)]/70 md:block">
                <p className="font-medium">{localizedTitle(item.location, locale)}</p>
                {item.contributors && <p className="mt-1">{item.contributors}</p>}
                {item.downloadable && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[var(--color-orange)]">
                    PDF
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 3v14m0 0-5-5m5 5 5-5" strokeLinecap="round" />
                    </svg>
                  </p>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
