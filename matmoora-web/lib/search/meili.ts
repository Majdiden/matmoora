import { MeiliSearch } from 'meilisearch';

let client: MeiliSearch | undefined;

/**
 * Meilisearch client for server-side use only. Uses the search-only key, which
 * cannot modify data — but it must still never reach client JS. All browser
 * search requests go through /api/search (TECH_SPEC §12.3, §12.4).
 *
 * Constructed lazily so the module can be imported without env vars present
 * (e.g. during build-time page-data collection).
 */
export function getMeiliClient(): MeiliSearch {
  if (!client) {
    const host = process.env.MEILI_HOST;
    if (!host) {
      throw new Error('MEILI_HOST is not set');
    }
    client = new MeiliSearch({ host, apiKey: process.env.MEILI_SEARCH_KEY });
  }
  return client;
}

/** Index naming is `<content_type>_<locale>` (TECH_SPEC §12.1). */
export function indexName(contentType: string, locale: string): string {
  return `${contentType}_${locale}`;
}
