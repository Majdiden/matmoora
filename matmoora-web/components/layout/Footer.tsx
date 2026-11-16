import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

type SocialKind = 'facebook' | 'linkedin' | 'instagram';

const socials: { kind: SocialKind; label: string; href: string }[] = [
  { kind: 'facebook',  label: 'Facebook',  href: 'https://www.facebook.com/Matmooraa' },
  { kind: 'linkedin',  label: 'LinkedIn',  href: 'https://www.linkedin.com/company/matmoora' },
  { kind: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/matmoora' },
];

const CONTACT_EMAIL = 'info@matmoora.org';

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
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 inline-block opacity-80 transition hover:opacity-100"
          >
            {CONTACT_EMAIL}
          </a>
          <ul className="mt-4 flex items-center gap-4" aria-label={t('Footer.socials')}>
            {socials.map((s) => (
              <li key={s.kind}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-cream)]/15 text-[var(--color-cream)]/80 transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]"
                >
                  <SocialGlyph kind={s.kind} />
                </a>
              </li>
            ))}
          </ul>
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

function SocialGlyph({ kind }: { kind: SocialKind }) {
  const c = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (kind) {
    case 'facebook':
      // Classic "f" glyph in a rounded square.
      return (
        <svg {...c}>
          <path d="M14 7h2V4h-2.5A3.5 3.5 0 0 0 10 7.5V10H8v3h2v7h3v-7h2.2l.6-3H13V7.8c0-.44.36-.8.8-.8z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'linkedin':
      // "in" block with the dot.
      return (
        <svg {...c}>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M8 10v7" />
          <circle cx="8" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
          <path d="M12 17v-4.2a2.3 2.3 0 0 1 4.6 0V17M12 10v7" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...c}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
  }
}
