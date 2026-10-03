import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--color-cream)]/10 bg-[var(--color-navy-900)] text-[var(--color-cream)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold tracking-tight">{t('Meta.siteName')}</p>
          <p className="mt-2 max-w-sm text-sm opacity-80">{t('Meta.tagline')}</p>
        </div>
        <nav aria-label={t('Nav.collections')} className="grid gap-2 text-sm">
          <Link href="/" className="opacity-80 transition hover:opacity-100">{t('Nav.collections')}</Link>
          <Link href="/archive" className="opacity-80 transition hover:opacity-100">{t('Nav.archive')}</Link>
          <Link href="/about" className="opacity-80 transition hover:opacity-100">{t('Nav.about')}</Link>
        </nav>
        <div className="text-sm">
          <p className="font-medium">{t('Footer.contact')}</p>
          <a href="mailto:hello@matmoora.org" className="mt-1 inline-block opacity-80 transition hover:opacity-100">hello@matmoora.org</a>
        </div>
      </div>
      <div className="border-t border-[var(--color-cream)]/10">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs opacity-70">
          © {year} {t('Meta.siteName')} — {t('Footer.rights')}
        </div>
      </div>
    </footer>
  );
}
