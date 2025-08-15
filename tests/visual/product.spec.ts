import { test, expect } from '@playwright/test';

test('product page visual baseline (first product in All)', async ({ page, baseURL }) => {
  const root = baseURL || 'https://t0uds3-a2.myshopify.com';
  await page.goto(root + '/collections/all', { waitUntil: 'networkidle' });
  const first = page.locator('a[href*="/products/"]').first();
  const href = await first.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(root + href, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1366, height: 900 });
  expect(await page.screenshot({ fullPage: true, path: 'tests/screenshots/product-page.png' })).toMatchSnapshot('product-page.png', { maxDiffPixelRatio: 0.02 });
});


