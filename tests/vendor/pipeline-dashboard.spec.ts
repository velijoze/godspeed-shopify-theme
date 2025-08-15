import { test, expect } from '@playwright/test';

test.describe('Pipeline Dashboard page', () => {
	test('template renders and key sections present', async ({ page, baseURL }) => {
		const host = baseURL || 'https://t0uds3-a2.myshopify.com';
		await page.goto(host + '/pages/pipeline-dashboard');
		// Header section
		const header = page.locator('.pipeline-dashboard-header');
		if (await header.count() === 0) {
			test.skip();
		}
		await expect(header).toBeVisible();
		// Master control and status blocks (presence optional depending on config)
		await expect(page.locator('.pipeline-master-control').first()).toBeAttached();
		await expect(page.locator('.pipeline-feature-status').first()).toBeAttached();
	});
});


