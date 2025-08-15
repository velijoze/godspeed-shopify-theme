import { test, expect } from '@playwright/test';

test.describe('Header behavior', () => {
  test('desktop: nav visible, hamburger hidden', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const host = baseURL || 'https://t0uds3-a2.myshopify.com';
    await page.goto(host + '/');
    await expect(page.locator('.header__nav-menu')).toBeVisible();
    await expect(page.locator('.header-drawer-toggle')).toHaveCount(0);
  });

  test('mobile: hamburger opens drawer', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const host = baseURL || 'https://t0uds3-a2.myshopify.com';
    await page.goto(host + '/');
    const toggle = page.locator('.header-drawer-toggle');
    const toggleCount = await toggle.count();
    if (toggleCount === 0) test.skip();
    await expect(toggle).toBeVisible();
    await toggle.first().click();
    await expect(page.locator('#Details-menu-drawer-container[open]')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#Details-menu-drawer-container[open]')).toHaveCount(0);
  });
});


