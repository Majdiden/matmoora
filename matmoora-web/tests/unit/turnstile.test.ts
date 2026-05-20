import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyTurnstile } from '@/lib/turnstile/verify';

describe('verifyTurnstile', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    delete process.env.TURNSTILE_SECRET;
  });

  it('skips verification when no secret is configured (dev convenience)', async () => {
    expect(await verifyTurnstile('any-token')).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed when a secret is configured but no token is supplied', async () => {
    process.env.TURNSTILE_SECRET = 'secret';
    const result = await verifyTurnstile(undefined);
    expect(result).toEqual({ ok: false, reason: 'missing-token' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('passes valid tokens through Cloudflare', async () => {
    process.env.TURNSTILE_SECRET = 'secret';
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    expect(await verifyTurnstile('good')).toEqual({ ok: true });
  });

  it('reports the first error code from Cloudflare', async () => {
    process.env.TURNSTILE_SECRET = 'secret';
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
        { status: 200 },
      ),
    );
    expect(await verifyTurnstile('bad')).toEqual({
      ok: false,
      reason: 'invalid-input-response',
    });
  });
});
