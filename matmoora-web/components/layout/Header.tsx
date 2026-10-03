import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { LangSwitcher } from '@/components/layout/LangSwitcher';
import { Logo } from '@/components/brand/Logo';
import type { Locale } from '@/lib/i18n/config';

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-cream)]/10 bg-[var(--color-navy)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="group inline-flex items-center transition-opacity hover:opacity-90" aria-label={t('Meta.siteName')}>
          <Logo locale={locale} />
        </Link>
        <nav className="flex items-center gap-6" aria-label={t('Nav.collections')}>
          <NavLink href="/">{t('Nav.collections')}</NavLink>
          <NavLink href="/archive">{t('Nav.archive')}</NavLink>
          <NavLink href="/about">{t('Nav.about')}</NavLink>
          <Link
            href="/search"
            aria-label={t('Nav.search')}
            className="rounded-full p-2 text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </Link>
          <span className="mx-1 h-4 w-px bg-[var(--color-cream)]/20" aria-hidden />
          <LangSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative text-sm font-medium text-[var(--color-cream)]/90 transition-colors hover:text-[var(--color-orange)]"
    >
      {children}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-[var(--color-orange)] transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
