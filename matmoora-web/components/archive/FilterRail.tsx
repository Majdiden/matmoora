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
    <aside className="rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]/80">
          {t('filters')}
        </h2>
        {anyActive && (
          <button type="button" onClick={clearAll} className="text-xs font-medium text-[var(--color-orange)] hover:underline">
            {t('clearAll')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Group
          label={t('type')}
          selectedCount={selected.types.length}
          defaultOpen={selected.types.length > 0}
        >
          {facets.types.map((v) => (
            <Chip key={v} label={tType(v)} active={selected.types.includes(v)} onToggle={() => toggle('type', v)} />
          ))}
        </Group>
        <Group
          label={t('location')}
          selectedCount={selected.locations.length}
          defaultOpen={selected.locations.length > 0}
        >
          {facets.locations.map((v) => (
            <Chip key={v} label={v} active={selected.locations.includes(v)} onToggle={() => toggle('loc', v)} />
          ))}
        </Group>
        <Group
          label={t('year')}
          selectedCount={selected.years.length}
          defaultOpen={selected.years.length > 0}
        >
          {facets.years.map((v) => (
            <Chip key={v} label={v} active={selected.years.includes(v)} onToggle={() => toggle('year', v)} />
          ))}
        </Group>
        <Group
          label={t('theme')}
          selectedCount={selected.themes.length}
          defaultOpen={selected.themes.length > 0}
        >
          {facets.themes.map((v) => (
            <Chip key={v} label={v.replace(/-/g, ' ')} active={selected.themes.includes(v)} onToggle={() => toggle('theme', v)} />
          ))}
        </Group>
      </div>
    </aside>
  );
}

function Group({
  label,
  selectedCount,
  defaultOpen,
  children,
}: {
  label: string;
  selectedCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  // Native <details>/<summary> gives us a keyboard-navigable, accessible
  // disclosure for free; the parent `group` class lets the chevron rotate
  // via `group-open:rotate-180` without extra JS.
  return (
    <details
      className="group overflow-hidden rounded-md border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/30 open:bg-[var(--color-navy-900)]/50"
      open={defaultOpen}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-cream)] [&::-webkit-details-marker]:hidden"
      >
        <span className="flex items-center gap-2">
          <span>{label}</span>
          {selectedCount > 0 && (
            <span className="rounded-full bg-[var(--color-orange)]/20 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-[var(--color-orange)]">
              {selectedCount}
            </span>
          )}
        </span>
        <ChevronGlyph />
      </summary>
      <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
        {children}
      </div>
    </details>
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

function ChevronGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-[var(--color-cream)]/60 transition-transform duration-200 group-open:rotate-180"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
