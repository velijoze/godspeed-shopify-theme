const { chromium } = require('playwright');

async function testCollectionStatus() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing collection status...');
  
  const collections = [
    'e-bikes',
    'mountain-bikes', 
    'road-bikes', 
    'city-bikes', 
    'gravel-bikes',
    'accessories',
    'bicycles'
  ];
  
  for (const collection of collections) {
    try {
      console.log(`\n=== Testing ${collection} collection ===`);
      
      await page.goto(`https://t0uds3-a2.myshopify.com/collections/${collection}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check page title
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      // Check for collection title
      const collectionTitle = await page.locator('h1, .collection-hero__title').first().textContent();
      console.log(`Collection title: "${collectionTitle}"`);
      
      // Check for products
      const products = await page.locator('.pipeline-product-card, .product-card, .grid__item').count();
      console.log(`Products found: ${products}`);
      
      // Check for empty collection message
      const emptyMessage = await page.locator('.collection--empty, .no-products, .empty').count();
      console.log(`Empty collection message: ${emptyMessage > 0}`);
      
      // Check for 404
      const is404 = await page.locator('.error-404, .page-not-found').count();
      console.log(`404 error: ${is404 > 0}`);
      
      // Check if page is using the correct template
      const pageContent = await page.content();
      const hasPipelineGrid = pageContent.includes('pipeline-collection-grid');
      console.log(`Using pipeline-collection-grid: ${hasPipelineGrid}`);
      
      // Take screenshot
      await page.screenshot({ path: `${collection}-status.png`, fullPage: true });
      console.log(`Screenshot saved: ${collection}-status.png`);
      
    } catch (error) {
      console.error(`Error testing ${collection}:`, error.message);
    }
  }
  
  await browser.close();
}

testCollectionStatus(); 