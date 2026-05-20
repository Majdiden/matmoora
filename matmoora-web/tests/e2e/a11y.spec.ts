import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Axe-core smoke checks per locale (TECH_SPEC §15, §19). Catches major
 * violations only — visual + manual QA still required before launch.
 */
for (const locale of ['ar', 'en'] as const) {
  test(`home page has no critical a11y violations (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
