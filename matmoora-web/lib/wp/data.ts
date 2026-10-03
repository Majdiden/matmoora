/**
 * Data-layer wrappers. Pages import from here, never from fixtures or
 * the WPGraphQL client directly. Switches between fixture data and the
 * live endpoint based on env.
 */
import { investigations, contentPieces, shouldUseFixtures } from './fixtures';
import type { InvestigationFx, ContentPieceFx, ContentType } from './fixtures';

export interface ArchiveFilters {
  q?: string;
  types?: ContentType[];
  locations?: string[];
  years?: string[];
  themes?: string[];
}

export async function getAllInvestigations(): Promise<InvestigationFx[]> {
  if (shouldUseFixtures()) return investigations;
  return investigations;
}

export async function getInvestigation(slug: string): Promise<InvestigationFx | null> {
  const all = await getAllInvestigations();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function getAllContent(): Promise<ContentPieceFx[]> {
  if (shouldUseFixtures()) return contentPieces;
  return contentPieces;
}

export async function getRelatedContentFor(slugs: string[]): Promise<ContentPieceFx[]> {
  const all = await getAllContent();
  const byslug = new Map(all.map((c) => [c.slug, c]));
  return slugs.map((s) => byslug.get(s)).filter((c): c is ContentPieceFx => Boolean(c));
}

export async function getArchive(filters: ArchiveFilters = {}): Promise<ContentPieceFx[]> {
  const items = await getAllContent();
  return items.filter((item) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = [item.title.ar, item.title.en ?? '', item.location.ar, item.location.en ?? '']
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.types?.length && !filters.types.includes(item.type)) return false;
    if (filters.locations?.length && !filters.locations.some((l) => item.location.en === l || item.location.ar === l))
      return false;
    if (filters.years?.length) {
      const year = (item.eventDate ?? item.publicationDate).slice(0, 4);
      if (!filters.years.includes(year)) return false;
    }
    if (filters.themes?.length && !filters.themes.some((t) => item.themes.includes(t))) return false;
    return true;
  });
}

export async function getFacets(): Promise<{
  types: ContentType[];
  locations: string[];
  years: string[];
  themes: string[];
}> {
  const items = await getAllContent();
  return {
    types: Array.from(new Set(items.map((i) => i.type))),
    locations: Array.from(new Set(items.map((i) => i.location.en ?? i.location.ar))),
    years: Array.from(new Set(items.map((i) => (i.eventDate ?? i.publicationDate).slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
    themes: Array.from(new Set(items.flatMap((i) => i.themes))).sort(),
  };
}

export async function getContentPiece(slug: string): Promise<ContentPieceFx | null> {
  const all = await getAllContent();
  return all.find((c) => c.slug === slug) ?? null;
}
