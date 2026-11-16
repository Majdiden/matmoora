import { gql } from 'graphql-request';
import { wpClient } from './client';
import { shouldUseFixtures } from './fixtures';

/**
 * Site-wide settings editors control from the WordPress dashboard
 * (Settings → Matmoora). Read on every request on the Next.js side and
 * handed to the root layout so the palette, email, and other global
 * dials can be changed without a redeploy.
 */
export type SiteTheme = 'day' | 'dusk';

export interface SiteSettings {
  theme: SiteTheme;
}

const DEFAULT: SiteSettings = { theme: 'day' };

const QUERY = gql`
  query MatmooraSiteSettings {
    matmooraSettings {
      theme
    }
  }
`;

interface Resp {
  matmooraSettings?: { theme?: string | null } | null;
}

function coerce(theme: unknown): SiteTheme {
  return theme === 'dusk' ? 'dusk' : 'day';
}

/**
 * Preview override: `?theme=dusk` on any URL applies dusk for that
 * request only, so editors can audition the orange palette before
 * flipping it live in the dashboard. Callers pass the Next.js
 * searchParams they already have.
 */
export function overrideTheme(searchParams?: URLSearchParams | Record<string, string | string[] | undefined>): SiteTheme | null {
  if (!searchParams) return null;
  const raw = searchParams instanceof URLSearchParams
    ? searchParams.get('theme')
    : (typeof searchParams.theme === 'string' ? searchParams.theme : Array.isArray(searchParams.theme) ? searchParams.theme[0] : undefined);
  if (raw === 'day' || raw === 'dusk') return raw;
  return null;
}

/**
 * Load the current site settings. Order of precedence:
 *   1. WPGraphQL `matmooraSettings` (what the dashboard writes)
 *   2. `MATMOORA_THEME` env var (deploy-level override, useful in previews)
 *   3. Defaults ({ theme: 'day' })
 *
 * In fixture mode we skip the network round-trip entirely.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const envTheme = process.env.MATMOORA_THEME;

  if (shouldUseFixtures() || !process.env.WORDPRESS_GRAPHQL_ENDPOINT) {
    return { theme: coerce(envTheme ?? DEFAULT.theme) };
  }

  try {
    const data = await wpClient.request<Resp>(QUERY);
    const theme = data.matmooraSettings?.theme ?? envTheme ?? DEFAULT.theme;
    return { theme: coerce(theme) };
  } catch {
    // WP down, CORS, or the mu-plugin not yet installed — fall back
    // gracefully so the public site never breaks over a settings read.
    return { theme: coerce(envTheme ?? DEFAULT.theme) };
  }
}
