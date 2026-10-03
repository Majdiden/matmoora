import { draftMode } from 'next/headers';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/config';

export async function PreviewBanner({ locale }: { locale: Locale }) {
  const draft = await draftMode();
  if (!draft.isEnabled) return null;
  return <PreviewBannerView locale={locale} />;
}

function PreviewBannerView({ locale }: { locale: Locale }) {
  const t = useTranslations('Preview');
  return (
    <div className="bg-[var(--color-orange)] px-4 py-2 text-center text-sm font-medium text-[var(--color-ink)]">
      <span className="font-semibold">{t('label')}</span>{' '}
      <a href={`/api/exit-preview?locale=${locale}`} className="underline underline-offset-4">
        {t('exit')}
      </a>
    </div>
  );
}
