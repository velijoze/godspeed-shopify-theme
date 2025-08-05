const { chromium } = require('playwright');

async function testProducts() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing product display on e-bikes page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for products to load
    await page.waitForTimeout(3000);
    
    // Check various product selectors
    const productSelectors = [
      '.product-card',
      '.card-product', 
      '.pipeline-product-card',
      '.grid__item',
      '.product-item',
      '[data-product-id]'
    ];
    
    for (const selector of productSelectors) {
      const count = await page.locator(selector).count();
      console.log(`${selector}: ${count} found`);
    }
    
    // Check if collection exists
    const collectionTitle = await page.locator('h1, .collection-title, .page-title').first().textContent();
    console.log(`Collection title: "${collectionTitle}"`);
    
    // Check for error messages
    const errorMessages = await page.locator('.collection--empty, .no-products, .empty').count();
    console.log(`Error/empty messages: ${errorMessages}`);
    
    // Check the actual HTML structure
    const productGrid = await page.locator('.product-grid, .collection-grid, .grid').first().innerHTML();
    console.log('Product grid HTML (first 200 chars):', productGrid.substring(0, 200));
    
    // Take screenshot of current state
    await page.screenshot({ path: 'e-bikes-products-debug.png', fullPage: true });
    console.log('Debug screenshot saved');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

testProducts();