import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-neutral-600">{t('intro')}</p>
    </section>
  );
}
