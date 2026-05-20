import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyTurnstile } from '@/lib/turnstile/verify';
import { callerIp, createRateLimiter, rateLimitedResponse } from '@/lib/ratelimit';

const Payload = z.object({
  post_id: z.coerce.number().int().positive(),
  parent_id: z.coerce.number().int().positive().optional(),
  author_name: z.string().min(1).max(120),
  author_email: z.email().max(254),
  content: z.string().min(1).max(8000),
  turnstileToken: z.string().optional(),
});

// 5 comment submissions per IP per 10 minutes.
const limiter = createRateLimiter(5, 10 * 60 * 1000);

/**
 * Comment submission proxy (TECH_SPEC §14.2-§14.3).
 *
 *   client -> POST /api/comments/submit
 *          -> rate limit by IP
 *          -> Turnstile verify
 *          -> Zod validation
 *          -> forward to wp/v2/comments (Akismet runs server-side, comments
 *             default to 'unapproved' awaiting moderation)
 */
export async function POST(req: NextRequest) {
  const ip = callerIp(req.headers);
  const limit = await limiter.check(`comments:${ip}`);
  if (!limit.ok) return rateLimitedResponse(limit);

  const json = await req.json().catch(() => null);
  const parsed = Payload.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: 'validation', errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!turnstile.ok) {
    return Response.json(
      { ok: false, error: 'turnstile', reason: turnstile.reason },
      { status: 400 },
    );
  }

  const base = process.env.WP_BASE_URL;
  if (!base) {
    return Response.json({ ok: false, error: 'wp-not-configured' }, { status: 500 });
  }

  const wpResponse = await fetch(`${base.replace(/\/$/, '')}/wp-json/wp/v2/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post: parsed.data.post_id,
      parent: parsed.data.parent_id,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email,
      content: parsed.data.content,
    }),
  });

  if (!wpResponse.ok) {
    return Response.json({ ok: false, error: 'wp-rejected' }, { status: 502 });
  }

  return Response.json({ ok: true, status: 'pending-moderation' });
}
