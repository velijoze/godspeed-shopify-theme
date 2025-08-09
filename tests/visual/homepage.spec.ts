import { test, expect } from '@playwright/test';

test('homepage visual baseline', async ({ page, baseURL }) => {
  await page.goto((baseURL || 'https://t0uds3-a2.myshopify.com') + '/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1366, height: 900 });
  expect(await page.screenshot({ fullPage: true, path: 'tests/screenshots/homepage-full.png' })).toMatchSnapshot('homepage-full.png', { maxDiffPixelRatio: 0.02 });
});


