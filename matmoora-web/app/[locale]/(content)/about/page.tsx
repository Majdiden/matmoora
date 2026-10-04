import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { PageHeader } from '@/components/design/PageHeader';
import { SectionMarker } from '@/components/design/SectionMarker';
import { TopoDivider } from '@/components/design/TopoDivider';
import { StatsBar } from '@/components/design/StatsBar';
import { SectionIcon } from '@/components/design/SectionIcon';
import { getAllContent, getAllInvestigations } from '@/lib/wp/data';
import type { Locale } from '@/lib/i18n/config';

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typed = locale as Locale;
  const t = await getTranslations('About');
  const [investigations, content] = await Promise.all([getAllInvestigations(), getAllContent()]);

  const stats = [
    { value: String(investigations.length), label: t('statInvestigations') },
    { value: `${content.length}+`, label: t('statPieces') },
    { value: 'AR · EN', label: t('statLanguages') },
    { value: '1000+', label: t('statMethodology') },
  ];

  const sections: { n: number; icon: 'who' | 'what' | 'how'; id: string; title: string; echo: string; body: string; align: 'start' | 'end' }[] = [
    { n: 1, icon: 'who',  id: 'who',         title: t('whoTitle'),  echo: t('whoEcho'),  body: t('whoBody'),  align: 'start' },
    { n: 2, icon: 'what', id: 'what',        title: t('whatTitle'), echo: t('whatEcho'), body: t('whatBody'), align: 'end' },
    { n: 3, icon: 'how',  id: 'methodology', title: t('howTitle'),  echo: t('howEcho'),  body: t('howBody'),  align: 'start' },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 pb-24 pt-14">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        echo={t('echo')}
        intro={t('intro')}
        locale={typed}
      >
        <div className="w-full md:w-[420px]">
          <StatsBar items={stats} />
        </div>
      </PageHeader>

      <div className="relative">
        {sections.map((s, idx) => (
          <div key={s.id}>
            <DocumentCard section={s} idx={idx} />
            {idx < sections.length - 1 && <TopoDivider />}
          </div>
        ))}

        <TopoDivider />
        <ContactCard
          title={t('contactTitle')}
          echo={t('contactEcho')}
          body={t('contactBody')}
          email={t('contactEmail')}
          actionLabel={t('contactActionLabel')}
          locale={typed}
        />
      </div>

      <footer className="mt-14 flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <p className="w-full text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-cream)]/60 sm:w-auto">
          {t('continueExploring')}
        </p>
        <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-cream)] transition-colors hover:text-[var(--color-orange)]">
          <span>{t('continueInvestigations')}</span>
          <ArrowGlyph locale={typed} />
        </Link>
        <Link href="/archive" className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-cream)] transition-colors hover:text-[var(--color-orange)]">
          <span>{t('continueArchive')}</span>
          <ArrowGlyph locale={typed} />
        </Link>
      </footer>
    </section>
  );
}

function DocumentCard({ section, idx }: {
  section: { n: number; icon: 'who' | 'what' | 'how'; id: string; title: string; echo: string; body: string; align: 'start' | 'end' };
  idx: number;
}) {
  const align = section.align === 'end';
  return (
    <article
      id={section.id}
      className={`scroll-mt-24 ${align ? 'md:ms-16' : 'md:me-16'}`}
      style={{ animation: `fade-up 600ms ease-out ${idx * 100}ms both` }}
    >
      <div className="group relative overflow-hidden rounded-lg border border-[var(--color-cream-strong)]/30 bg-[var(--color-cream)] text-[var(--color-ink)] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:-translate-y-0.5">
        <span aria-hidden className="absolute end-0 top-0 h-6 w-6">
          <span className="absolute inset-y-0 end-0 w-px bg-[var(--color-orange)]" />
          <span className="absolute inset-x-0 top-0 h-px bg-[var(--color-orange)]" />
        </span>
        <div className="grid gap-6 p-8 md:grid-cols-[220px_1fr] md:p-10">
          <div className="flex items-start justify-between md:flex-col md:justify-start md:gap-5">
            <SectionMarker n={section.n} />
            <span className="text-[var(--color-navy)]" aria-hidden>
              <SectionIcon name={section.icon} size={36} />
            </span>
          </div>
          <div>
            <p
              lang={section.echo.match(/[A-Za-z]/) ? 'en' : 'ar'}
              dir={section.echo.match(/[A-Za-z]/) ? 'ltr' : 'rtl'}
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-orange)]"
            >
              {section.echo}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-[var(--color-navy)] md:text-3xl">
              {section.title}
            </h2>
            <p className="mt-5 text-sm leading-loose text-[var(--color-navy-900)]/85 md:text-base">
              {section.body}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ContactCard({ title, echo, body, email, actionLabel, locale }: {
  title: string; echo: string; body: string; email: string; actionLabel: string; locale: Locale;
}) {
  return (
    <article id="contact" className="scroll-mt-24" style={{ animation: 'fade-up 700ms ease-out 320ms both' }}>
      <div className="relative overflow-hidden rounded-lg border-2 border-[var(--color-orange)] bg-[var(--color-cream)] text-[var(--color-ink)] shadow-[0_24px_60px_-40px_rgba(228,100,39,0.5)]">
        <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-[var(--color-orange)]" />
        <div className="grid gap-6 p-8 md:grid-cols-[220px_1fr_auto] md:items-center md:p-10">
          <div className="flex items-start justify-between md:flex-col md:justify-start md:gap-5">
            <SectionMarker n={4} />
            <span className="text-[var(--color-orange)]" aria-hidden>
              <SectionIcon name="contact" size={36} />
            </span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-orange)]">{echo}</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-[var(--color-navy)] md:text-3xl">{title}</h2>
            <p className="mt-4 text-sm leading-loose text-[var(--color-navy-900)]/85 md:text-base">{body}</p>
          </div>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-orange)] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-navy)] md:whitespace-nowrap"
          >
            <span>{actionLabel}</span>
            <ArrowGlyph locale={locale} />
          </a>
        </div>

        <div className="grid grid-cols-1 border-t border-[var(--color-navy)]/10 md:grid-cols-3">
          <div className="border-b border-[var(--color-navy)]/10 px-6 py-4 md:border-b-0 md:border-e md:border-[var(--color-navy)]/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-navy)]/60">
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </p>
            <a href={`mailto:${email}`} className="mt-1 block truncate text-sm font-medium text-[var(--color-navy)] hover:text-[var(--color-orange)]">
              {email}
            </a>
          </div>
          <div className="border-b border-[var(--color-navy)]/10 px-6 py-4 md:border-b-0 md:border-e md:border-[var(--color-navy)]/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-navy)]/60">
              {locale === 'ar' ? 'اللغات' : 'Languages'}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-navy)]">العربية · English</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-navy)]/60">
              {locale === 'ar' ? 'الشبكات الاجتماعية' : 'Social'}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[var(--color-navy)]">
              <SocialGlyph kind="twitter" />
              <SocialGlyph kind="instagram" />
              <SocialGlyph kind="youtube" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ArrowGlyph({ locale }: { locale: Locale }) {
  const path = locale === 'ar' ? 'M14 5l-7 7 7 7' : 'M10 5l7 7-7 7';
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
      className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
    >
      <path d={path} />
    </svg>
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
