import { test, expect } from '@playwright/test';

test('no mixed-content http:// resources on homepage', async ({ page, baseURL }) => {
  const url = (baseURL || 'https://t0uds3-a2.myshopify.com') + '/';
  const responses: string[] = [];
  page.on('response', resp => {
    const u = resp.url();
    if (u.startsWith('http://')) responses.push(u);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (responses.length) console.error('Mixed content:', responses);
  expect(responses).toEqual([]);
});


