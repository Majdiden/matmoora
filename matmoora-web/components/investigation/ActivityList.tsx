import { localizedTitle, type InvestigationFx } from '@/lib/wp/fixtures';
import type { Locale } from '@/lib/i18n/config';

export function ActivityList({
  activities,
  heading,
  locale,
}: {
  activities: InvestigationFx['activities'];
  heading: string;
  locale: Locale;
}) {
  if (activities.length === 0) return null;
  return (
    <section id="activities" className="mt-10 scroll-mt-24">
      {heading && (
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-orange)]">
          {heading}
        </h2>
      )}
      <ul className="mt-4 space-y-2">
        {activities.map((a, idx) => (
          <li key={idx} className="flex items-baseline gap-4 rounded-md border border-[var(--color-navy)]/10 bg-[var(--color-cream)]/95 px-5 py-3">
            <span className="text-xs font-semibold text-[var(--color-orange)]">{a.date}</span>
            <span className="flex-1 text-sm font-medium text-[var(--color-navy)]">
              {localizedTitle(a.title, locale)}
            </span>
            <span className="text-xs text-[var(--color-navy)]/60">{a.city}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
