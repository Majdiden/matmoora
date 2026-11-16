import { gql } from 'graphql-request';
import { wpClient } from './client';
import { shouldUseFixtures } from './fixtures';

/**
 * Site-wide settings editors control from the WordPress dashboard
 * (Settings → Matmoora). Read on every request on the Next.js side and
 * handed to the root layout so the palette, theme preset, and future
 * global dials change without a redeploy.
 */
export type SiteTheme = 'day' | 'dusk';

export interface Palette {
  /** Page background — maps to `--color-navy`. */
  bg: string;
  /** Card / panel background — maps to `--color-cream`. */
  surface: string;
  /** Accent / highlight — maps to `--color-orange`. */
  accent: string;
  /** Text on surface — maps to `--color-ink`. */
  ink: string;
}

export interface SiteSettings {
  theme: SiteTheme;
  palettes: { day: Palette; dusk: Palette };
}

/**
 * Hard defaults. Mirror the mu-plugin's defaults so the site renders
 * identically whether or not the CMS has been reached yet.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  theme: 'day',
  palettes: {
    day:  { bg: '#20234f', surface: '#f7e6d2', accent: '#e46427', ink: '#0d0d0d' },
    dusk: { bg: '#9e3a11', surface: '#f7e6d2', accent: '#20234f', ink: '#0d0d0d' },
  },
};

const QUERY = gql`
  query MatmooraSiteSettings {
    matmooraSettings {
      theme
      palettes {
        day  { bg surface accent ink }
        dusk { bg surface accent ink }
      }
    }
  }
`;

interface RawPalette {
  bg?: string | null;
  surface?: string | null;
  accent?: string | null;
  ink?: string | null;
}

interface Resp {
  matmooraSettings?: {
    theme?: string | null;
    palettes?: {
      day?:  RawPalette | null;
      dusk?: RawPalette | null;
    } | null;
  } | null;
}

/** Strict hex validator — only `#rgb` or `#rrggbb` passes. */
function hex(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
    ? value.toLowerCase()
    : fallback;
}

function coerceTheme(value: unknown): SiteTheme {
  return value === 'dusk' ? 'dusk' : 'day';
}

function coercePalette(raw: RawPalette | null | undefined, fallback: Palette): Palette {
  return {
    bg:      hex(raw?.bg,      fallback.bg),
    surface: hex(raw?.surface, fallback.surface),
    accent:  hex(raw?.accent,  fallback.accent),
    ink:     hex(raw?.ink,     fallback.ink),
  };
}

/**
 * Load the current site settings. Precedence:
 *   1. WPGraphQL `matmooraSettings` (what the dashboard writes).
 *   2. `MATMOORA_THEME` env var (deploy-level override, preview builds).
 *   3. Hard defaults.
 *
 * Any network/parse failure falls through to the defaults so the public
 * site never breaks over a settings read.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const envTheme = coerceTheme(process.env.MATMOORA_THEME);

  if (shouldUseFixtures() || !process.env.WORDPRESS_GRAPHQL_ENDPOINT) {
    return { ...DEFAULT_SETTINGS, theme: envTheme };
  }

  try {
    const data = await wpClient.request<Resp>(QUERY);
    const s = data.matmooraSettings;
    return {
      theme: coerceTheme(s?.theme ?? envTheme),
      palettes: {
        day:  coercePalette(s?.palettes?.day,  DEFAULT_SETTINGS.palettes.day),
        dusk: coercePalette(s?.palettes?.dusk, DEFAULT_SETTINGS.palettes.dusk),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS, theme: envTheme };
  }
}

/**
 * Build the inline `<style>` body that drives the live palette. The
 * palette-token mapping (bg → --color-navy, etc.) is centralised here
 * so component code keeps using the semantic var names it already does.
 */
export function buildPaletteCss(palettes: SiteSettings['palettes']): string {
  const forPreset = (preset: SiteTheme) => {
    const p = palettes[preset];
    return [
      `--color-navy: ${p.bg}`,
      `--color-cream: ${p.surface}`,
      `--color-orange: ${p.accent}`,
      `--color-ink: ${p.ink}`,
    ].join('; ');
  };
  return [
    `:root { ${forPreset('day')} }`,
    `:root[data-theme="dusk"] { ${forPreset('dusk')} }`,
  ].join('\n');
}
