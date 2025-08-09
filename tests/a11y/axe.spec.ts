import { test, expect } from '@playwright/test';

async function runAxe(page: any) {
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js' });
  return await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
  });
}

const PAGES = ['/', '/collections/e-bikes', '/search?q=bike'];

test.describe('Accessibility (axe-core)', () => {
  for (const url of PAGES) {
    test(`a11y: ${url}`, async ({ page, baseURL }) => {
      await page.goto((baseURL || 'https://t0uds3-a2.myshopify.com') + url, { waitUntil: 'networkidle' });
      const results = await runAxe(page);
      const violations = results.violations || [];
      if (violations.length) {
        console.error(JSON.stringify(violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2));
      }
      expect(violations.length).toBe(0);
    });
  }
});


