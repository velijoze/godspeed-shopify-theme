const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to e-bikes page...');
  await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
  
  // Wait for products to load completely
  console.log('Waiting for products to load...');
  await page.waitForSelector('.grid.product-grid', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Extra wait for any lazy loading
  
  // Check what's actually on the page
  const productCount = await page.locator('.grid__item').count();
  console.log(`Found ${productCount} products on page`);
  
  const hasProducts = await page.locator('.grid.product-grid .grid__item').count();
  console.log(`Products in grid: ${hasProducts}`);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'debug-full-page.png', 
    fullPage: true 
  });
  
  // Take viewport screenshot  
  await page.screenshot({ 
    path: 'debug-viewport.png' 
  });
  
  console.log('Screenshots saved: debug-full-page.png and debug-viewport.png');
  
  await browser.close();
})();