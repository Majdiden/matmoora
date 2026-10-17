import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

const socials: { kind: 'twitter' | 'instagram' | 'youtube'; label: string; href: string }[] = [
  { kind: 'twitter',   label: 'Twitter / X', href: 'https://x.com/matmoora' },
  { kind: 'instagram', label: 'Instagram',   href: 'https://instagram.com/matmoora' },
  { kind: 'youtube',   label: 'YouTube',     href: 'https://youtube.com/@matmoora' },
];

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
          {/* Socials live in the footer per the visual-structure feedback (image 18). */}
          <ul className="mt-4 flex items-center gap-4" aria-label="Social links">
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

function SocialGlyph({ kind }: { kind: 'twitter' | 'instagram' | 'youtube' }) {
  const c = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (kind) {
    case 'twitter':
      return <svg {...c}><path d="M4 4l7.5 10.2L4.5 20h2.4l6-6.7L17 20h3L12.2 9.4 19.2 4h-2.4L11.2 9.9 7 4z" fill="currentColor" stroke="none" /></svg>;
    case 'instagram':
      return <svg {...c}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>;
    case 'youtube':
      return <svg {...c}><rect x="2.5" y="6" width="19" height="12" rx="3" /><path d="m10.5 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" /></svg>;
  }
}
