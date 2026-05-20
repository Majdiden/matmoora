import type { NextRequest } from 'next/server';
import { schemaToZod } from '@/lib/forms/schemaToZod';
import { formSubmitEndpoint, getFormSchema } from '@/lib/wp/forms';
import { verifyTurnstile } from '@/lib/turnstile/verify';
import { callerIp, createRateLimiter, rateLimitedResponse } from '@/lib/ratelimit';

// 10 form submissions per IP per 10 minutes.
const limiter = createRateLimiter(10, 10 * 60 * 1000);

/**
 * Form submission proxy (TECH_SPEC §13.4).
 *
 *   client -> POST /api/forms/[id]/submit
 *          -> rate limit by IP
 *          -> Turnstile verify (server-side)
 *          -> schema fetch + Zod re-validation (never trust the client)
 *          -> forward to WP REST endpoint (Fluent Forms by default)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = callerIp(req.headers);
  const limit = await limiter.check(`forms:${id}:${ip}`);
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = (await req.json().catch(() => null)) as
    | { data?: unknown; turnstileToken?: string }
    | null;
  if (!body) {
    return Response.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(body.turnstileToken, ip);
  if (!turnstile.ok) {
    return Response.json(
      { ok: false, error: 'turnstile', reason: turnstile.reason },
      { status: 400 },
    );
  }

  const schema = await getFormSchema(id);
  if (!schema) {
    return Response.json({ ok: false, error: 'unknown-form' }, { status: 404 });
  }

  const parsed = schemaToZod(schema).safeParse(body.data);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: 'validation', errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const wpResponse = await fetch(formSubmitEndpoint(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (!wpResponse.ok) {
    return Response.json({ ok: false, error: 'wp-rejected' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
