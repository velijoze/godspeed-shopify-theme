import { test, expect } from '@playwright/test';

test.describe('Size Calculator', () => {
	test('validates inputs and shows result', async ({ page, baseURL }) => {
		const host = baseURL || 'https://t0uds3-a2.myshopify.com';
		await page.goto(host + '/pages/size-guide');

		// Component exists
		const root = page.locator('#size-calculator,[data-size-calculator]');
		await expect(root).toBeVisible();

		// Handle validation dialogs
		const dialogMessages: string[] = [];
		page.on('dialog', async (dialog) => {
			dialogMessages.push(dialog.message());
			await dialog.dismiss();
		});

		// Missing input validation
		await page.click('.calculate-btn');
		await expect.poll(() => dialogMessages.length, { timeout: 3000 }).toBeGreaterThan(0);

		// Invalid ranges
		await page.fill('#height', '100'); // too short
		await page.fill('#inseam', '50'); // borderline invalid
		await page.selectOption('#bike-type', 'city');
		await page.click('.calculate-btn');
		// Should have triggered another dialog
		await expect.poll(() => dialogMessages.length, { timeout: 3000 }).toBeGreaterThan(1);

		// Valid values
		await page.fill('#height', '175');
		await page.fill('#inseam', '80');
		await page.selectOption('#bike-type', 'trekking');
		await page.click('.calculate-btn');

		const resultCard = page.locator('#result');
		await expect(resultCard).toBeVisible();
		await expect(page.locator('#size-result')).toHaveText(/XS|S|M|L|XL/i);
		await expect(page.locator('#size-advice')).toHaveText(/\w+/);

		// No console errors
		const errors: string[] = [];
		page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
		await expect.poll(() => errors.length, { timeout: 1000 }).toBe(0);
	});
});


