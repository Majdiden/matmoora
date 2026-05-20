import { draftMode } from 'next/headers';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/config';

/**
 * Visible only when draft mode is on (TECH_SPEC §8). Lets editors leave
 * preview without hand-editing the URL.
 */
export async function PreviewBanner({ locale }: { locale: Locale }) {
  const draft = await draftMode();
  if (!draft.isEnabled) return null;

  return <PreviewBannerView locale={locale} />;
}

function PreviewBannerView({ locale }: { locale: Locale }) {
  const t = useTranslations('Preview');
  return (
    <div className="bg-amber-200 px-4 py-2 text-center text-sm text-amber-900">
      <span className="font-medium">{t('label')}</span>{' '}
      <a
        href={`/api/exit-preview?locale=${locale}`}
        className="underline underline-offset-4"
      >
        {t('exit')}
      </a>
    </div>
  );
}
