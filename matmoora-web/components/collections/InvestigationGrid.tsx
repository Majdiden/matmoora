import { Link } from '@/lib/i18n/navigation';
import { localizedTitle, type InvestigationFx } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export function InvestigationGrid({ items, locale }: { items: InvestigationFx[]; locale: Locale }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((inv, idx) => (
        <li key={inv.slug}>
          <Card inv={inv} locale={locale} idx={idx} />
        </li>
      ))}
    </ul>
  );
}

function Card({ inv, locale, idx }: { inv: InvestigationFx; locale: Locale; idx: number }) {
  const title = localizedTitle(inv.title, locale);
  const location = localizedTitle(inv.location, locale);
  const summary = localizedTitle(inv.summary, locale);
  const accent =
    inv.cover.hue === 'orange'
      ? 'from-[var(--color-orange)]/25 via-[var(--color-cream)] to-[var(--color-cream)]'
      : inv.cover.hue === 'navy'
        ? 'from-[var(--color-navy-200)] via-[var(--color-cream)] to-[var(--color-cream)]'
        : 'from-[var(--color-cream-strong)] via-[var(--color-cream)] to-[var(--color-cream)]';

  return (
    <Link
      href={`/investigations/${inv.slug}`}
      className="group relative block h-full overflow-hidden rounded-lg bg-[var(--color-cream)] text-[var(--color-ink)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.6)] focus-visible:-translate-y-1"
      style={{ animation: `card-in 500ms ease-out ${idx * 60}ms both` }}
    >
      <div className={`bg-gradient-to-br ${accent} p-6 pb-4`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-orange)]">
          {inv.eventYear}
        </p>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-[var(--color-navy)]">
          {title}
        </h3>
      </div>
      <div className="relative border-t border-[var(--color-navy)]/10 px-6 py-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-navy-900)]/80">
          {summary}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt className="text-[var(--color-navy)]/60">{locale === 'ar' ? 'الموقع' : 'Location'}</dt>
          <dt className="text-[var(--color-navy)]/60">{locale === 'ar' ? 'المحتوى' : 'Content'}</dt>
          <dd className="font-medium text-[var(--color-navy)]">{location}</dd>
          <dd className="font-medium text-[var(--color-navy)]">
            {inv.relatedContentSlugs.length} {locale === 'ar' ? 'قطعة' : 'pieces'}
          </dd>
        </dl>
      </div>
      <span aria-hidden className="absolute inset-x-4 bottom-2 h-px scale-x-0 bg-[var(--color-orange)] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
    </Link>
  );
}
