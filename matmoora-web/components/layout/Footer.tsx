import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Meta');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-neutral-500">
        © {year} {t('siteName')}
      </div>
    </footer>
  );
}
