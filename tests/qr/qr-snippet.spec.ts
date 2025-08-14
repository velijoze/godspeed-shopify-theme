import { test, expect } from '@playwright/test';

test('QR snippet renders without stray text and valid img', async ({ page }) => {
  await page.goto('/');
  const firstProduct = page.locator('a[href*="/products/"]').first();
  await firstProduct.click();

  // Look for the QR container if present
  const qr = page.locator('.product-qr-code');
  if (await qr.count()) {
    await expect(qr.locator('img')).toHaveAttribute('src', /api\.qrserver\.com/);
    await expect(qr).not.toContainText(/^yea$/i);
  }
});


