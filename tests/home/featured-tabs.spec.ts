import { test, expect } from '@playwright/test';

test('Featured Collections Tabs renders with pipeline cards', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.featured-collections-tabs');
  await expect(section).toBeVisible();
  await expect(section.locator('.featured-collections-tabs__products .featured-collections-tabs__product-item').first()).toBeVisible();
  // Ensure pipeline card snippet used
  await expect(section.locator('.card-product-pipeline, [class*="pipeline"]').first()).toBeVisible();
});


