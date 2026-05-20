import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import { fontArabic, fontLatin } from '@/lib/fonts';
import { dirForLocale, type Locale } from '@/lib/i18n/config';
import { routing } from '@/lib/i18n/routing';
import { alternatesFor } from '@/lib/metadata/alternates';
import '../globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('siteName'), template: `%s — ${t('siteName')}` },
    description: t('tagline'),
    alternates: alternatesFor('/', locale),
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_AR'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  return (
    <html
      lang={typedLocale}
      dir={dirForLocale(typedLocale)}
      className={`${fontArabic.variable} ${fontLatin.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-white text-neutral-900 antialiased">
        <NextIntlClientProvider>
          <PreviewBanner locale={typedLocale} />
          <Header locale={typedLocale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
