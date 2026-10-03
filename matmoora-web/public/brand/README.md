# Brand assets

Drop the licensed raster logos from the Drive visual identity here:

- `logo-full-cream.png` — bilingual mark on cream (used in the header)
- `logo-full-navy.png` — bilingual mark on navy
- `logo-simplified.png` — Latin-only horizontal mark
- `logo-icon.png` — square favicon / app icon

Once placed, swap the SVG wordmark in `components/brand/Logo.tsx` for `<Image src="/brand/logo-full-cream.png" ... />`.

Also drop the licensed DIN Next Arabic .woff2 files at `public/fonts/din-next-arabic/` and switch `lib/fonts.ts` from Cairo → `next/font/local`.
