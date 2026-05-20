import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-neutral-600">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-blue-600 underline underline-offset-4"
      >
        {t('backHome')}
      </Link>
    </section>
  );
}
