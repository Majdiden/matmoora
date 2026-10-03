import type { Locale } from '@/lib/i18n/config';

/**
 * Matmoora wordmark. Topographic contour blob with "eye" negative space
 * next to the bilingual name. SVG-based so it adopts the surrounding
 * text color via CSS variables. When the raster from Drive is placed at
 * `public/brand/logo-full-cream.png`, swap this for next/image.
 */
export function Logo({ locale, className }: { locale: Locale; className?: string }) {
  const isAr = locale === 'ar';
  return (
    <span
      className={`inline-flex items-center gap-3 ${className ?? ''}`}
      aria-label={isAr ? 'مطمورة' : 'Matmoora'}
    >
      <ContourMark />
      <span aria-hidden className="leading-tight">
        {isAr ? (
          <>
            <span className="block text-xl font-bold tracking-tight text-[var(--color-cream)]">
              مطمورة
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-cream)]/70">
              Matmoora
            </span>
          </>
        ) : (
          <>
            <span className="block text-xl font-bold tracking-tight text-[var(--color-cream)]">
              Matmoora
            </span>
            <span className="block text-[10px] font-medium tracking-[0.14em] text-[var(--color-cream)]/70">
              مطمورة
            </span>
          </>
        )}
      </span>
    </span>
  );
}

function ContourMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className="shrink-0">
      <path
        d="M14 20 C 20 8, 44 6, 52 20 C 58 32, 48 50, 34 52 C 20 54, 10 42, 12 32 Z"
        stroke="var(--color-orange)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <path
        d="M18 24 C 22 14, 42 12, 48 24 C 52 34, 44 46, 34 47 C 22 48, 14 40, 17 32 Z"
        stroke="var(--color-cream)"
        strokeWidth="1.4"
      />
      <ellipse cx="34" cy="30" rx="6" ry="4" fill="var(--color-cream)" />
      <ellipse cx="34" cy="30" rx="3.4" ry="2.2" fill="var(--color-navy)" />
    </svg>
  );
}
