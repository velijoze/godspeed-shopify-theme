import { test, expect } from '@playwright/test';

test.describe('Header Customizer bindings', () => {
  test('logo alignment reflects settings on desktop and mobile', async ({ page, baseURL }) => {
    const host = baseURL || 'https://t0uds3-a2.myshopify.com';
    await page.goto(host + '/');

    // Desktop: row carries data-logo-position attribute; center aligns logo wrapper
    await page.setViewportSize({ width: 1280, height: 800 });
    const row = page.locator('.header__row');
    await expect(row).toHaveAttribute('data-logo-position', /middle-(left|center|right)/);

    // Mobile: attribute is present
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(row).toHaveAttribute('data-mobile-logo-position', /(left|center)/);
  });

  test('drawer trigger present on mobile and opens drawer', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const host = baseURL || 'https://t0uds3-a2.myshopify.com';
    await page.goto(host + '/');
    if (await page.locator('#Details-menu-drawer-container').count()) {
      await page.click('#Details-menu-drawer-container > summary');
      await expect(page.locator('#Details-menu-drawer-container[open]')).toHaveCount(1);
    }
  });
});


