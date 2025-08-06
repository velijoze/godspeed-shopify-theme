const { chromium } = require('playwright');

async function testProductBadges() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing product badges on e-bikes collection page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for product badges
    const badges = await page.locator('.pipeline-card-badge').count();
    console.log(`Product badges found: ${badges}`);
    
    // Check each badge
    for (let i = 0; i < badges; i++) {
      const badge = page.locator('.pipeline-card-badge').nth(i);
      const badgeText = await badge.textContent();
      const badgeClass = await badge.getAttribute('class');
      const badgeStyle = await badge.getAttribute('style');
      
      console.log(`Badge ${i + 1}:`);
      console.log(`  Text: "${badgeText}"`);
      console.log(`  Class: "${badgeClass}"`);
      console.log(`  Style: "${badgeStyle}"`);
      
      // Get computed styles
      const fontSize = await badge.evaluate(el => window.getComputedStyle(el).fontSize);
      const padding = await badge.evaluate(el => window.getComputedStyle(el).padding);
      const width = await badge.evaluate(el => window.getComputedStyle(el).width);
      const height = await badge.evaluate(el => window.getComputedStyle(el).height);
      
      console.log(`  Font size: ${fontSize}`);
      console.log(`  Padding: ${padding}`);
      console.log(`  Width: ${width}`);
      console.log(`  Height: ${height}`);
    }
    
    // Check product prices to verify discount calculations
    const products = await page.locator('.pipeline-product-card').count();
    console.log(`\nProducts found: ${products}`);
    
    for (let i = 0; i < products; i++) {
      const product = page.locator('.pipeline-product-card').nth(i);
      const productTitle = await product.locator('.pipeline-card-title').textContent();
      const originalPrice = await product.locator('.pipeline-original-price').textContent();
      const salePrice = await product.locator('.pipeline-sale-price').textContent();
      const regularPrice = await product.locator('.pipeline-regular-price').textContent();
      
      console.log(`\nProduct ${i + 1}: ${productTitle}`);
      if (originalPrice) console.log(`  Original price: ${originalPrice}`);
      if (salePrice) console.log(`  Sale price: ${salePrice}`);
      if (regularPrice) console.log(`  Regular price: ${regularPrice}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'product-badges-debug.png', fullPage: true });
    console.log('\nScreenshot saved: product-badges-debug.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

testProductBadges(); 