import { test, expect } from '@playwright/test';

test.describe('I18n fallbacks', () => {
	test('German/French/Italian fall back to EN for missing keys', async ({ page, baseURL }) => {
		const host = baseURL || 'https://t0uds3-a2.myshopify.com';
		// Home is fine for generic keys
		for (const locale of ['de', 'fr', 'it']) {
			await page.goto(`${host}/?locale=${locale}`, { waitUntil: 'domcontentloaded' });
			await expect(page.locator('main')).toBeVisible();
			const anyText = await page.locator('main').innerText();
			expect(anyText).not.toMatch(/\bsize_calculator\.|translation missing/i);
		}
	});
});


