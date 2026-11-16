import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import { ThemePreviewCog } from '@/components/preview/ThemePreviewCog';
import { fontArabic, fontLatin } from '@/lib/fonts';
import { dirForLocale, type Locale } from '@/lib/i18n/config';
import { routing } from '@/lib/i18n/routing';
import { buildPaletteCss, getSiteSettings } from '@/lib/wp/settings';
import '../globals.css';

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
    title: { default: t('siteName'), template: `%s — ${t('siteName')}` },
    description: t('tagline'),
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

  // Both come from WordPress (Settings → Matmoora). Reading them here
  // lets editors swap the active preset and tweak either palette's
  // colours site-wide without a redeploy. The inline <style> emits
  // both palettes so the preview cog can live-swap between them
  // client-side without another server round-trip.
  const { theme, palettes } = await getSiteSettings();
  const paletteCss = buildPaletteCss(palettes);
  const cogEnabled = process.env.NEXT_PUBLIC_MATMOORA_THEME_PREVIEW === '1';

  return (
    <html
      lang={typedLocale}
      dir={dirForLocale(typedLocale)}
      data-theme={theme}
      className={`${fontArabic.variable} ${fontLatin.variable}`}
    >
      <body className="bg-topographic-navy flex min-h-dvh flex-col text-[var(--color-cream)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: paletteCss }} />
        <NextIntlClientProvider>
          <PreviewBanner locale={typedLocale} />
          <Header locale={typedLocale} />
          <main className="flex-1">{children}</main>
          <Footer />
          {cogEnabled && (
            <ThemePreviewCog
              locale={typedLocale}
              savedTheme={theme}
              palettes={palettes}
            />
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
