'use client';

import { useEffect, useRef, useState } from 'react';
import type { Palette, SiteTheme } from '@/lib/wp/settings';

const STORAGE_KEY = 'matmoora-theme-preview';

type PresetLabel = { id: SiteTheme; name: string; echo: string };

/**
 * Fixed cog pinned to the viewport edge. Clicking it opens a panel that
 * lets editors flip the active preset live in the browser — no save, no
 * redeploy. Preference is stored in localStorage so the preview survives
 * navigation; "Use dashboard setting" clears the override and falls back
 * to whatever WP currently has saved.
 *
 * Visibility is gated on `NEXT_PUBLIC_MATMOORA_THEME_PREVIEW=1` so the
 * cog never leaks to the public site. Turn it on for preview deploys,
 * leave it off for production.
 *
 * `locale` only drives button copy. The theme switch is a DOM attribute
 * toggle on `<html>` and is locale-agnostic.
 */
export function ThemePreviewCog({
  locale,
  savedTheme,
  palettes,
}: {
  locale: 'ar' | 'en';
  savedTheme: SiteTheme;
  palettes: { day: Palette; dusk: Palette };
}) {
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState<SiteTheme | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Restore the editor's last choice on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'day' || saved === 'dusk') {
        document.documentElement.setAttribute('data-theme', saved);
        setPreviewing(saved);
      }
    } catch {}
  }, []);

  // Close the panel when the editor clicks outside of it or hits Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apply = (theme: SiteTheme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    setPreviewing(theme);
  };

  const reset = () => {
    document.documentElement.setAttribute('data-theme', savedTheme);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPreviewing(null);
  };

  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const active: SiteTheme = previewing ?? savedTheme;
  const presets: PresetLabel[] = [
    { id: 'day',  name: t('نهار', 'Day'),  echo: 'Day'  },
    { id: 'dusk', name: t('غسق', 'Dusk'), echo: 'Dusk' },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-6 end-6 z-50" dir="ltr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('خيارات الألوان', 'Theme preview')}
        aria-expanded={open}
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-cream)]/20 bg-[var(--color-navy-900)]/90 text-[var(--color-cream)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur transition-all hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]"
      >
        <CogGlyph spinning={open} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('خيارات الألوان', 'Theme preview')}
          className="absolute bottom-16 end-0 w-72 overflow-hidden rounded-xl border border-[var(--color-cream)]/15 bg-[var(--color-navy-900)]/95 text-[var(--color-cream)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur"
        >
          <header className="border-b border-[var(--color-cream)]/10 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-orange)]">
              Theme preview
            </p>
            <h2 className="mt-1 text-sm font-semibold">
              {t('اختبر الألوان مباشرة', 'See it live')}
            </h2>
          </header>

          <ul className="divide-y divide-[var(--color-cream)]/10">
            {presets.map((p) => {
              const palette = palettes[p.id];
              const isActive = active === p.id;
              const isSaved = savedTheme === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => apply(p.id)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-start transition-colors ${
                      isActive
                        ? 'bg-[var(--color-cream)]/10'
                        : 'hover:bg-[var(--color-cream)]/5'
                    }`}
                  >
                    <PaletteSwatch palette={palette} />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {p.name}
                        {isSaved && (
                          <span className="rounded-full border border-[var(--color-cream)]/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[var(--color-cream)]/70">
                            {t('محفوظ', 'Saved')}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-[var(--color-cream)]/50">
                        {p.echo}
                      </span>
                    </span>
                    {isActive && <ActiveDot />}
                  </button>
                </li>
              );
            })}
          </ul>

          <footer className="flex items-center justify-between border-t border-[var(--color-cream)]/10 px-4 py-3">
            <p className="max-w-[12rem] text-[10px] leading-relaxed text-[var(--color-cream)]/50">
              {t(
                'المعاينة محلية ولا تؤثر على الإعداد المحفوظ.',
                'Preview only — doesn’t change the saved setting.',
              )}
            </p>
            {previewing !== null && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-[var(--color-cream)]/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-cream)]/80 transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]"
              >
                {t('رجوع', 'Reset')}
              </button>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}

function PaletteSwatch({ palette }: { palette: Palette }) {
  const bits: { color: string; label: string }[] = [
    { color: palette.bg,      label: 'Background' },
    { color: palette.surface, label: 'Surface' },
    { color: palette.accent,  label: 'Accent' },
    { color: palette.ink,     label: 'Ink' },
  ];
  return (
    <span className="flex h-7 shrink-0 overflow-hidden rounded-md border border-[var(--color-cream)]/20">
      {bits.map((b) => (
        <span
          key={b.label}
          title={`${b.label}: ${b.color}`}
          style={{ background: b.color, width: 12 }}
          className="h-full"
        />
      ))}
    </span>
  );
}

function ActiveDot() {
  return (
    <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[var(--color-orange)]" />
  );
}

function CogGlyph({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={spinning ? 'animate-[spin_6s_linear_infinite]' : ''}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
    </svg>
  );
}
