import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { LangSwitcher } from '@/components/layout/LangSwitcher';
import type { Locale } from '@/lib/i18n/config';

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t('Meta.siteName')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/search" className="text-sm text-neutral-600 hover:text-neutral-900">
            {t('Nav.search')}
          </Link>
          <LangSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
