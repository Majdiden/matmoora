import { Cairo, Poppins } from 'next/font/google';

/**
 * Brand fonts (visual identity — Drive: Fonts and Colors).
 *
 * Locked faces per the identity sheet:
 *   Arabic titles: DIN Next LT Arabic
 *   Arabic body:   DIN Next Arabic
 *   English:       Poppins
 *
 * DIN Next is a licensed Monotype family and is not served by Google Fonts.
 * Until the licensed files are placed at `public/fonts/din-next-arabic/`
 * (and this module is switched to `next/font/local`), we ship Cairo as the
 * closest permissively licensed Arabic substitute.
 */
export const fontArabic = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  weight: ['400', '500', '700', '900'],
  variable: '--font-ar',
});

export const fontLatin = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-en',
});
