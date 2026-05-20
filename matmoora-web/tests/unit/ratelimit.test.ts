import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRateLimiter, callerIp } from '@/lib/ratelimit';

describe('rate limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('admits the first N requests within the window', async () => {
    const limiter = createRateLimiter(3, 1000);
    expect((await limiter.check('a')).ok).toBe(true);
    expect((await limiter.check('a')).ok).toBe(true);
    expect((await limiter.check('a')).ok).toBe(true);
    expect((await limiter.check('a')).ok).toBe(false);
  });

  it('isolates separate keys', async () => {
    const limiter = createRateLimiter(1, 1000);
    expect((await limiter.check('a')).ok).toBe(true);
    expect((await limiter.check('b')).ok).toBe(true);
    expect((await limiter.check('a')).ok).toBe(false);
  });

  it('resets after the window elapses', async () => {
    const limiter = createRateLimiter(1, 1000);
    expect((await limiter.check('a')).ok).toBe(true);
    expect((await limiter.check('a')).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect((await limiter.check('a')).ok).toBe(true);
  });
});

describe('callerIp', () => {
  it('prefers Cloudflare over forwarded-for', () => {
    const h = new Headers({
      'cf-connecting-ip': '1.2.3.4',
      'x-forwarded-for': '5.6.7.8',
    });
    expect(callerIp(h)).toBe('1.2.3.4');
  });

  it('takes the first entry in x-forwarded-for', () => {
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(callerIp(h)).toBe('1.2.3.4');
  });

  it('falls back to unknown', () => {
    expect(callerIp(new Headers())).toBe('unknown');
  });
});
