import type { NextRequest } from 'next/server';
import { getMeiliClient, indexName } from '@/lib/search/meili';

export const dynamic = 'force-dynamic';

/**
 * Search proxy. The browser never talks to Meilisearch directly — the
 * search-only key stays server-side (TECH_SPEC §12.3, §12.4). Locale-scoped:
 * /api/search?locale=ar only queries `*_ar` indexes.
 *
 * Content types are a Phase 1 decision; extend SEARCHABLE_TYPES once locked.
 */
const SEARCHABLE_TYPES: string[] = [];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ar';

  if (SEARCHABLE_TYPES.length === 0) {
    return Response.json({ results: [], note: 'no content types indexed yet' });
  }

  const results = await getMeiliClient().multiSearch({
    queries: SEARCHABLE_TYPES.map((type) => ({
      indexUid: indexName(type, locale),
      q,
      limit: 10,
    })),
  });

  return Response.json(results);
}
