'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import type { ContentType } from '@/lib/wp/fixtures';

interface Facets {
  types: ContentType[];
  locations: string[];
  years: string[];
  themes: string[];
}

export function FilterRail({ facets }: { facets: Facets }) {
  const t = useTranslations('Archive');
  const tType = useTranslations('ContentType');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = useMemo(
    () => ({
      types: params.getAll('type') as ContentType[],
      locations: params.getAll('loc'),
      years: params.getAll('year'),
      themes: params.getAll('theme'),
    }),
    [params],
  );

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    next.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      [...current, value].forEach((v) => next.append(key, v));
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const anyActive =
    selected.types.length + selected.locations.length + selected.years.length + selected.themes.length > 0;

  return (
    <aside className="rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]/80">
          {t('filters')}
        </h2>
        {anyActive && (
          <button type="button" onClick={clearAll} className="text-xs font-medium text-[var(--color-orange)] hover:underline">
            {t('clearAll')}
          </button>
        )}
      </div>

      <Group label={t('type')}>
        {facets.types.map((v) => (
          <Chip key={v} label={tType(v)} active={selected.types.includes(v)} onToggle={() => toggle('type', v)} />
        ))}
      </Group>
      <Group label={t('location')}>
        {facets.locations.map((v) => (
          <Chip key={v} label={v} active={selected.locations.includes(v)} onToggle={() => toggle('loc', v)} />
        ))}
      </Group>
      <Group label={t('year')}>
        {facets.years.map((v) => (
          <Chip key={v} label={v} active={selected.years.includes(v)} onToggle={() => toggle('year', v)} />
        ))}
      </Group>
      <Group label={t('theme')}>
        {facets.themes.map((v) => (
          <Chip key={v} label={v.replace(/-/g, ' ')} active={selected.themes.includes(v)} onToggle={() => toggle('theme', v)} />
        ))}
      </Group>
    </aside>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]/60">{label}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}

function Chip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={
        'rounded-full border px-3 py-1 text-xs transition-all ' +
        (active
          ? 'border-[var(--color-orange)] bg-[var(--color-orange)]/15 text-[var(--color-orange)]'
          : 'border-[var(--color-cream)]/20 bg-transparent text-[var(--color-cream)]/80 hover:border-[var(--color-cream)]/50 hover:text-[var(--color-cream)]')
      }
    >
      {label}
    </button>
  );
}
