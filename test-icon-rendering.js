const { chromium } = require('playwright');

async function testIconRendering() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing icon rendering on e-bikes collection page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for grid view toggle buttons
    const viewButtons = await page.locator('.view-btn').count();
    console.log(`View buttons found: ${viewButtons}`);
    
    // Check what's inside the view buttons
    for (let i = 0; i < viewButtons; i++) {
      const button = page.locator('.view-btn').nth(i);
      const buttonHTML = await button.innerHTML();
      console.log(`Button ${i + 1} HTML:`, buttonHTML);
      
      // Check for SVG elements
      const svgCount = await button.locator('svg').count();
      console.log(`Button ${i + 1} SVG count:`, svgCount);
      
      if (svgCount > 0) {
        const svgHTML = await button.locator('svg').first().outerHTML();
        console.log(`Button ${i + 1} SVG HTML:`, svgHTML);
      }
    }
    
    // Check for any SVG elements on the page
    const allSvgs = await page.locator('svg').count();
    console.log(`Total SVG elements on page: ${allSvgs}`);
    
    // Check for specific grid icons by looking at the SVG content
    const grid3Icons = await page.locator('svg').filter({ hasText: /rect.*x="1".*y="1".*width="4"/ }).count();
    const grid4Icons = await page.locator('svg').filter({ hasText: /rect.*x="1".*y="1".*width="3"/ }).count();
    console.log(`Grid 3 icons found: ${grid3Icons}`);
    console.log(`Grid 4 icons found: ${grid4Icons}`);
    
    // Check if the icon snippets are being rendered at all
    const pageContent = await page.content();
    const hasIconGrid3 = pageContent.includes('icon-grid-3');
    const hasIconGrid4 = pageContent.includes('icon-grid-4');
    console.log(`Page contains icon-grid-3 reference: ${hasIconGrid3}`);
    console.log(`Page contains icon-grid-4 reference: ${hasIconGrid4}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'icon-rendering-debug.png', fullPage: true });
    console.log('Screenshot saved: icon-rendering-debug.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

testIconRendering(); 