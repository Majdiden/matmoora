'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { LangSwitcher } from '@/components/layout/LangSwitcher';
import { Logo } from '@/components/brand/Logo';
import type { Locale } from '@/lib/i18n/config';

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile panel on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-cream)]/10 bg-[var(--color-navy)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group inline-flex items-center transition-opacity hover:opacity-90"
          aria-label={t('Meta.siteName')}
        >
          <Logo locale={locale} className="h-9 sm:h-10" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label={t('Nav.collections')}>
          <NavLink href="/">{t('Nav.collections')}</NavLink>
          <NavLink href="/archive">{t('Nav.archive')}</NavLink>
          <NavLink href="/about">{t('Nav.about')}</NavLink>
          <Link
            href="/search"
            aria-label={t('Nav.search')}
            className="rounded-full p-2 text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/10"
          >
            <SearchGlyph />
          </Link>
          <span className="mx-1 h-4 w-px bg-[var(--color-cream)]/20" aria-hidden />
          <LangSwitcher current={locale} />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/search"
            aria-label={t('Nav.search')}
            className="rounded-full p-2 text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/10"
          >
            <SearchGlyph />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('Nav.closeMenu') : t('Nav.openMenu')}
            className="rounded-full p-2 text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/10"
          >
            {open ? <CloseGlyph /> : <MenuGlyph />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/95 md:hidden"
      >
        <nav
          aria-label={t('Nav.collections')}
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6"
        >
          <MobileLink href="/">{t('Nav.collections')}</MobileLink>
          <MobileLink href="/archive">{t('Nav.archive')}</MobileLink>
          <MobileLink href="/about">{t('Nav.about')}</MobileLink>
          <div className="mt-2 border-t border-[var(--color-cream)]/10 pt-3">
            <LangSwitcher current={locale} />
          </div>
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

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2 py-3 text-base font-medium text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/5 hover:text-[var(--color-orange)]"
    >
      {children}
    </Link>
  );
}

function SearchGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}
