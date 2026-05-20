import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';

/**
 * On-demand ISR endpoint. WordPress fires this on content publish/unpublish
 * via the matmoora-revalidate mu-plugin (TECH_SPEC §7.4).
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { post_type, slug, lang } = await req.json();

  if (typeof post_type !== 'string' || typeof slug !== 'string' || typeof lang !== 'string') {
    return Response.json({ ok: false, error: 'invalid payload' }, { status: 400 });
  }

  revalidatePath(`/${lang}/${post_type}/${slug}`);
  revalidatePath(`/${lang}/${post_type}`);
  revalidateTag('wp');

  return Response.json({ ok: true, revalidated: { post_type, slug, lang } });
}
