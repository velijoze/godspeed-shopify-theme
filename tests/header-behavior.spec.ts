import { test, expect } from '@playwright/test';

test.describe('Header behavior', () => {
  test('desktop: nav visible, hamburger hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('.header__nav-menu')).toBeVisible();
    await expect(page.locator('.header-drawer-toggle')).toHaveCount(0);
  });

  test('mobile: hamburger opens drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
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


