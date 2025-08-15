import { test, expect } from '@playwright/test';

test.describe('Collection price filter', () => {
  test('sets min/max and persists in URL', async ({ page, baseURL }) => {
    const host = baseURL || 'https://t0uds3-a2.myshopify.com';
    await page.goto(host + '/collections/e-bikes');
    const priceRange = page.locator('price-range');
    if (await priceRange.count() === 0) test.skip();
    await expect(priceRange).toBeVisible();

    const min = page.locator('input[id*="-GTE"]');
    const max = page.locator('input[id*="-LTE"]');
    await min.fill('500');
    await max.fill('2500');
    await max.blur();

    await expect(page).toHaveURL(/(gte|min)=500/i);
    await expect(page).toHaveURL(/(lte|max)=2500/i);

    await page.reload();
    await expect(min).toHaveValue(/500/);
    await expect(max).toHaveValue(/2500/);
  });
});


