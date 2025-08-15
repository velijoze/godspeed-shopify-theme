import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	timeout: 30_000,
	expect: { timeout: 5_000 },
	retries: 0,
	workers: 4,
	reporter: [['list']],
	use: {
		baseURL: process.env.BASE_URL || 'https://t0uds3-a2.myshopify.com',
		headless: true,
		trace: 'off',
		screenshot: 'off',
		video: 'off'
	},
	globalSetup: 'tests/utils/global-setup.ts',
	globalTeardown: 'tests/utils/global-teardown.ts'
});


