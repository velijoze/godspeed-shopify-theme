import { test, expect } from '@playwright/test';

// Key collections we expect to be reachable. These should exist in Shopify.
const requiredCollections: string[] = [
  '/collections/e-bikes',
  '/collections/bicycles',
  '/collections/accessories',
  '/collections/city-bikes',
  '/collections/mountain-bikes',
  '/collections/road-bikes',
  '/collections/helmets',
  '/collections/baskets',
  '/collections/lights',
  '/collections/fenders',
  '/collections/racks',
  '/collections/cargo-e-bikes',
  '/collections/all',
];

test.describe('Collections availability', () => {
  for (const path of requiredCollections) {
    test(`Collection resolves and is not 404: ${path}`, async ({ page, baseURL }) => {
      const url = (baseURL || '') + path;
      const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(res, `No response for ${url}`).toBeTruthy();
      expect(res!.ok(), `Non-OK status for ${url}: ${res!.status()}`).toBeTruthy();

      await expect(page.locator('h1:has-text("Page not found")')).toHaveCount(0);
      await expect(page.locator('main#MainContent')).toBeVisible();

      // The collection layout should be present: either a product grid or an empty-state wrapper
      const grid = page.locator('#product-grid');
      const emptyState = page.locator('.collection.collection--empty, .collection:has(.title--primary)');
      await expect(grid.or(emptyState)).toHaveCountGreaterThan(0);
    });
  }
});


