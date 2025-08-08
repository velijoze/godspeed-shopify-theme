import { test, expect } from '@playwright/test';

test.describe('Homepage does not render 404', () => {
  test('no 404 content and key sections present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("Page not found")')).toHaveCount(0);
    await expect(page.locator('main#MainContent')).toBeVisible();
    // At least one prominent section exists
    const sectionCount = await page.locator('section, [id*="hero"], [id*="featured"], .shopify-section').count();
    expect(sectionCount).toBeGreaterThan(0);
  });
});


