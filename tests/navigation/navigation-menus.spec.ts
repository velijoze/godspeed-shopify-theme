import { test, expect } from '@playwright/test';

test.describe('Navigation menus', () => {
	test('desktop nav visible when menu assigned', async ({ page, baseURL }) => {
		const host = baseURL || 'https://t0uds3-a2.myshopify.com';
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(host + '/');
		await expect(page.locator('header .header__nav-menu').first()).toBeVisible();
	});

	test('mobile drawer opens and contains menu links', async ({ page, baseURL }) => {
		const host = baseURL || 'https://t0uds3-a2.myshopify.com';
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(host + '/');
		const trigger = page.locator('#Details-menu-drawer-container > summary, .header-drawer-toggle');
		if (await trigger.count()) {
			await trigger.first().click();
			// Drawer opens when details gains [open]
			await expect(page.locator('#Details-menu-drawer-container[open]')).toHaveCount(1);
			// At least one link present
			const links = page.locator('#menu-drawer a, nav a');
			expect(await links.count()).toBeGreaterThan(0);
		}
	});
});


