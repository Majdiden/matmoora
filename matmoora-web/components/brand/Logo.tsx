import Image from 'next/image';
import logoFullCream from '@/public/brand/logo-full-cream.png';
import logoIcon from '@/public/brand/logo-icon.png';
import type { Locale } from '@/lib/i18n/config';

/**
 * Matmoora brand mark. Raster assets ship from the identity sheet
 * (public/brand/). The full lockup is used in the header; the icon-only
 * mark is available for tight spaces (mobile condensed nav, share cards).
 */
export function Logo({
  locale,
  className,
  variant = 'full',
}: {
  locale: Locale;
  className?: string;
  variant?: 'full' | 'icon';
}) {
  const isAr = locale === 'ar';
  const label = isAr ? 'مطمورة' : 'Matmoora';

  if (variant === 'icon') {
    return (
      <Image
        src={logoIcon}
        alt={label}
        priority
        width={44}
        height={44}
        className={`h-11 w-11 shrink-0 ${className ?? ''}`}
      />
    );
  }

  return (
    <Image
      src={logoFullCream}
      alt={label}
      priority
      width={logoFullCream.width}
      height={logoFullCream.height}
      className={`w-auto select-none ${className ?? 'h-10'}`}
    />
  );
}
