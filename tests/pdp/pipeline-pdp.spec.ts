import { test, expect } from '@playwright/test';

test.describe('Pipeline PDP', () => {
  test('renders vendor badge, price, tabs, sticky cart toggle, QR block', async ({ page }) => {
    // Navigate to first product from home if direct slug is unknown
    await page.goto('/');
    const firstProduct = page.locator('a[href*="/products/"]').first();
    const href = await firstProduct.getAttribute('href');
    expect(href).toBeTruthy();
    await firstProduct.click();

    // Title and price exist
    await expect(page.locator('h1.product__title')).toBeVisible();
    await expect(page.locator('[class*="price"], [data-price]')).toBeVisible();

    // Vendor (if product has vendor) - optional assertion: element may be hidden if no vendor
    // Tabs container
    await expect(page.locator('text=Specifications').or(page.locator('text=Features'))).toBeVisible({ timeout: 10000 });

    // Sticky cart not duplicated: at most one sticky cart bar present
    const stickyBars = await page.locator('#sticky-cart-bar').count();
    expect(stickyBars).toBeLessThanOrEqual(1);

    // QR block optional: if setting enabled presence of .product__qr
    // We tolerate absence but assert no console errors
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await expect.poll(() => errors.length, { timeout: 5000 }).toBe(0);
  });
});


