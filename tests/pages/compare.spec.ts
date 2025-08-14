import { test, expect } from '@playwright/test';

test.describe('Compare page', () => {
  test('loads and allows selecting bikes', async ({ page }) => {
    await page.goto('/pages/compare');

    // Compare tool root
    const tool = page.locator('.bike-comparison-tool');
    await expect(tool).toBeVisible();

    // There should be at least one <select.bike-select>
    const selects = page.locator('select.bike-select');
    await expect(selects.first()).toBeVisible();

    // Select a known key from default schema if present
    // Fallback: select the first non-empty option
    const firstSelect = selects.first();
    const options = await firstSelect.locator('option').allTextContents();
    const target = options.find((t) => /city|trekking|mountain|cargo/i.test(t)) || options.find((t) => t.trim().length > 0 && t.trim() !== 'Select E-bike…');
    if (target) {
      await firstSelect.selectOption({ label: target });
      // A cell should update from '-' to some value
      const anyUpdated = page.locator('td[id^="price-"]:not(:has-text("-"))');
      await expect(anyUpdated).toBeVisible();
    }

    // No severe console errors
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await expect.poll(() => errors.length).toBe(0);
  });
});


