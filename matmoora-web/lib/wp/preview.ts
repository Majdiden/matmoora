import { draftMode } from 'next/headers';
import { GraphQLClient } from 'graphql-request';
import { wpClient, wpPreviewClient } from './client';

/**
 * Returns the right WPGraphQL client for the current request: the
 * authenticated preview client when draft mode is on, the cached public
 * client otherwise (TECH_SPEC §7-§8).
 *
 * Use this in page components that need to render drafts when an editor
 * arrived through /api/preview.
 */
export async function getWpClient(): Promise<GraphQLClient> {
  const draft = await draftMode();
  if (draft.isEnabled) {
    const token = process.env.WP_PREVIEW_TOKEN;
    if (token) return wpPreviewClient(token);
  }
  return wpClient;
}

/** Convenience: is the current request being rendered in preview mode? */
export async function isPreview(): Promise<boolean> {
  return (await draftMode()).isEnabled;
}
