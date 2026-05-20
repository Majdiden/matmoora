import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

/**
 * Draft-mode entry. Editors open this from WordPress to preview unpublished
 * content; guarded by PREVIEW_SECRET (TECH_SPEC §8).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  const slug = url.searchParams.get('slug');
  const type = url.searchParams.get('type');
  const locale = url.searchParams.get('locale') ?? 'ar';

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }
  if (!slug || !type) {
    return new Response('Missing slug or type', { status: 400 });
  }

  (await draftMode()).enable();
  redirect(`/${locale}/${type}/${slug}`);
}
