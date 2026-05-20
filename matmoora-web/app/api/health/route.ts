export const dynamic = 'force-dynamic';

/**
 * Health probe. Returns 200 only if both the WPGraphQL endpoint and
 * Meilisearch respond within 2s, else 503 (TECH_SPEC §20).
 */
async function ping(url: string, init?: RequestInit): Promise<boolean> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const graphqlEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  const meiliHost = process.env.MEILI_HOST;

  const [wp, meili] = await Promise.all([
    graphqlEndpoint
      ? ping(graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' }),
        })
      : Promise.resolve(false),
    meiliHost ? ping(`${meiliHost}/health`) : Promise.resolve(false),
  ]);

  const ok = wp && meili;
  return Response.json(
    { ok, services: { wordpress: wp, meilisearch: meili } },
    { status: ok ? 200 : 503 },
  );
}
