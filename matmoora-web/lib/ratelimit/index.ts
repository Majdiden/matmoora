/**
 * Per-key sliding-window rate limiter.
 *
 * In-memory implementation: cheap, no dependencies, but per-instance. On
 * Vercel's auto-scaling functions this is best-effort — duplicated buckets
 * mean a determined caller can squeeze through more requests than the limit
 * suggests. Good enough for ambient spam protection on form/comment endpoints.
 *
 * Swap with `@upstash/ratelimit` once an Upstash Redis is provisioned; the
 * `RateLimiter` interface below stays the same.
 */

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

interface Bucket {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      this.gc(now);
      return { ok: true, limit: this.limit, remaining: this.limit - 1, resetAt };
    }

    if (existing.count >= this.limit) {
      return { ok: false, limit: this.limit, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count++;
    return {
      ok: true,
      limit: this.limit,
      remaining: this.limit - existing.count,
      resetAt: existing.resetAt,
    };
  }

  private gc(now: number): void {
    if (this.buckets.size < 1024) return;
    for (const [k, b] of this.buckets) {
      if (b.resetAt <= now) this.buckets.delete(k);
    }
  }
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  return new InMemoryRateLimiter(limit, windowMs);
}

/** Best-effort caller IP from common proxy headers. */
export function callerIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Build a 429 response with the standard headers. */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return Response.json(
    { ok: false, error: 'rate-limited' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    },
  );
}
