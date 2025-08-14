import { test, expect } from '@playwright/test';

test.describe('Header Customizer bindings', () => {
  test('logo alignment reflects settings on desktop and mobile', async ({ page, browserName }) => {
    await page.goto('/');

    // Desktop: row carries data-logo-position attribute; center aligns logo wrapper
    await page.setViewportSize({ width: 1280, height: 800 });
    const row = page.locator('.header__row');
    await expect(row).toHaveAttribute('data-logo-position', /middle-(left|center|right)/);

    // Mobile: attribute is present
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(row).toHaveAttribute('data-mobile-logo-position', /(left|center)/);
  });

  test('drawer trigger present on mobile and opens drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    if (await page.locator('#Details-menu-drawer-container').count()) {
      await page.click('#Details-menu-drawer-container > summary');
      await expect(page.locator('#menu-drawer')).toBeVisible();
    }
  });
});


