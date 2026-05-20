import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT!;

/**
 * Public WPGraphQL client. Tagged `wp` so the whole content surface can be
 * revalidated at once via revalidateTag('wp') (TECH_SPEC §7.1, §7.4).
 */
export const wpClient = new GraphQLClient(endpoint, {
  fetch: (url, init) => fetch(url, { ...init, next: { tags: ['wp'] } }),
});

/**
 * Authenticated client for preview/draft mode. Fetches unpublished content
 * with a bearer token; never cached (TECH_SPEC §8).
 */
export const wpPreviewClient = (token: string) =>
  new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }),
  });
