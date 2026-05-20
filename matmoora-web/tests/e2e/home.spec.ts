import { test, expect } from '@playwright/test';

test.describe('home routing', () => {
  test('/ redirects to /ar', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.url()).toMatch(/\/ar$/);
  });

  test('Arabic home renders RTL', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('English home renders LTR', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('language switcher links to the other locale', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: /arabic|العربية/i }).click();
    await expect(page).toHaveURL(/\/ar$/);
  });
});

test('search page renders', async ({ page }) => {
  await page.goto('/ar/search');
  await expect(page.getByRole('searchbox')).toBeVisible();
});
