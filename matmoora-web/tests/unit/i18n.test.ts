import { describe, it, expect } from 'vitest';
import { dirForLocale, locales, defaultLocale } from '@/lib/i18n/config';

describe('i18n config', () => {
  it('lists ar and en', () => {
    expect(locales).toEqual(['ar', 'en']);
  });

  it('defaults to Arabic', () => {
    expect(defaultLocale).toBe('ar');
  });

  it('maps Arabic to RTL', () => {
    expect(dirForLocale('ar')).toBe('rtl');
    expect(dirForLocale('en')).toBe('ltr');
  });
});
