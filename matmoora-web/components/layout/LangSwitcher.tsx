'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, type Locale } from '@/lib/i18n/config';

export function LangSwitcher({ current }: { current: Locale }) {
  const t = useTranslations('LangSwitcher');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1" aria-label={t('label')}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-current={locale === current ? 'true' : undefined}
          onClick={() => router.replace(pathname, { locale })}
          className={
            locale === current
              ? 'rounded px-2 py-1 text-sm font-semibold text-neutral-900'
              : 'rounded px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900'
          }
        >
          {t(locale)}
        </button>
      ))}
    </div>
  );
}
