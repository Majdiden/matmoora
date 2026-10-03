'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, type Locale } from '@/lib/i18n/config';

export function LangSwitcher({ current }: { current: Locale }) {
  const t = useTranslations('LangSwitcher');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-sm" aria-label={t('label')}>
      {locales.map((locale, i) => (
        <span key={locale} className="inline-flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-[var(--color-cream)]/30">·</span>}
          <button
            type="button"
            aria-current={locale === current ? 'true' : undefined}
            onClick={() => router.replace(pathname, { locale })}
            className={
              locale === current
                ? 'font-semibold text-[var(--color-orange)]'
                : 'text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-cream)]'
            }
          >
            {t(locale)}
          </button>
        </span>
      ))}
    </div>
  );
}
