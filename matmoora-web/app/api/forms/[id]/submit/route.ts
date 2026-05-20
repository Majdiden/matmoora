import type { NextRequest } from 'next/server';
import { schemaToZod } from '@/lib/forms/schemaToZod';
import { formSubmitEndpoint, getFormSchema } from '@/lib/wp/forms';
import { verifyTurnstile } from '@/lib/turnstile/verify';

/**
 * Form submission proxy (TECH_SPEC §13.4).
 *
 *   client -> POST /api/forms/[id]/submit
 *          -> Turnstile verify (server-side)
 *          -> schema fetch + Zod re-validation (never trust the client)
 *          -> forward to WP REST endpoint (Fluent Forms by default)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as { data?: unknown; turnstileToken?: string };

  const turnstile = await verifyTurnstile(
    body.turnstileToken,
    req.headers.get('cf-connecting-ip') ?? undefined,
  );
  if (!turnstile.ok) {
    return Response.json({ ok: false, error: 'turnstile', reason: turnstile.reason }, { status: 400 });
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
