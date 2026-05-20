/**
 * Server-side Cloudflare Turnstile verification (TECH_SPEC §13.4, §14.3).
 * Used by the forms and comments submission proxies before forwarding to WP.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET;
  // When no secret is configured (local dev), skip verification rather than block.
  if (!secret) return { ok: true };
  if (!token) return { ok: false, reason: 'missing-token' };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return { ok: false, reason: 'verify-http-error' };

  const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  return data.success
    ? { ok: true }
    : { ok: false, reason: (data['error-codes']?.[0]) ?? 'verify-failed' };
}
