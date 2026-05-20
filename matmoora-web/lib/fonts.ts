import { Inter, Noto_Sans_Arabic } from 'next/font/google';

/**
 * Placeholder fonts (TECH_SPEC §6.3, §21 Open Question 2). The final Arabic and
 * English faces are a Phase 1 decision. Swapping them later is a one-file change
 * — keep all font wiring in this module.
 */
export const fontArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-ar',
});

export const fontLatin = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-en',
});
