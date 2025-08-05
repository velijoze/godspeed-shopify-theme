const { chromium } = require('playwright');

async function testTranslations() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing e-bikes page for translation errors...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check for translation missing text
    const translationErrors = await page.locator(':text("Translation missing")').count();
    console.log(`Found ${translationErrors} "Translation missing" errors`);
    
    if (translationErrors > 0) {
      // Get specific translation errors
      const errors = await page.locator(':text("Translation missing")').allTextContents();
      console.log('Specific errors found:');
      errors.slice(0, 10).forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`);
      }
    }
    
    // Check if site loads completely
    const loadState = await page.evaluate(() => document.readyState);
    console.log(`Page load state: ${loadState}`);
    
    // Check for infinite loading indicators
    const loadingElements = await page.locator('.loading, .loader, [data-loading]').count();
    console.log(`Loading elements found: ${loadingElements}`);
    
    // Take screenshot
    await page.screenshot({ path: 'e-bikes-page-current.png', fullPage: true });
    console.log('Screenshot saved as e-bikes-page-current.png');
    
    // Check specific elements
    const productCount = await page.locator('.product-card, .card-product, .pipeline-product-card').count();
    console.log(`Products displayed: ${productCount}`);
    
    const filterElements = await page.locator('[data-facet], .facets, .filter').count();
    console.log(`Filter elements found: ${filterElements}`);
    
  } catch (error) {
    console.error('Error testing page:', error.message);
  }
  
  await browser.close();
}

testTranslations();