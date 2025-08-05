const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing pixel-perfect layout...');
  await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
  
  // Wait for new structure
  await page.waitForSelector('.products-grid', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Check the new structure
  const productCount = await page.locator('.product-card').count();
  console.log(`Found ${productCount} products in new layout`);
  
  const hasTopBar = await page.locator('.collection-top-bar').count();
  console.log(`Top toolbar present: ${hasTopBar > 0}`);
  
  const hasSidebar = await page.locator('.filters-sidebar').count();
  console.log(`Sidebar present: ${hasSidebar > 0}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'pixel-perfect-test.png', 
    fullPage: true 
  });
  
  console.log('Screenshot saved: pixel-perfect-test.png');
  
  await browser.close();
})();