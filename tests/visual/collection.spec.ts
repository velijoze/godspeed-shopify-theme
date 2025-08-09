import { test, expect } from '@playwright/test';

const COLLECTIONS = ['/collections/e-bikes', '/collections/mountain-bikes', '/collections/road-bikes'];

for (const c of COLLECTIONS) {
  test(`collection visual: ${c}`, async ({ page, baseURL }) => {
    await page.goto((baseURL || 'https://t0uds3-a2.myshopify.com') + c, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1366, height: 900 });
    const fileName = `${c.replace(/\//g, '-')}.png`;
    expect(await page.screenshot({ fullPage: true, path: `tests/screenshots/${fileName}` })).toMatchSnapshot(fileName, { maxDiffPixelRatio: 0.02 });
  });
}


