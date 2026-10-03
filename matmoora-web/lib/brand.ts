/**
 * Matmoora brand tokens (visual identity — Drive: Fonts and Colors).
 * Single source of truth for palette + motif references.
 * Tailwind reads them via CSS variables in globals.css.
 */
export const brand = {
  colors: {
    ink: '#0d0d0d',
    navy: '#20234f',
    cream: '#f7e6d2',
    orange: '#e46427',
  },
  fonts: {
    arabicTitle: 'DIN Next LT Arabic',
    arabicBody: 'DIN Next Arabic',
    english: 'Poppins',
  },
  motif: 'topographic-contour',
} as const;

export type BrandColor = keyof typeof brand.colors;
