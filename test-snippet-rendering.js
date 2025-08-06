const { chromium } = require('playwright');

async function testSnippetRendering() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing snippet rendering...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get the full page content to see the exact error
    const pageContent = await page.content();
    
    // Look for the specific error message
    const errorMatch = pageContent.match(/Liquid error.*Could not find asset snippets\/([^"]+)/);
    if (errorMatch) {
      console.log('Found error:', errorMatch[0]);
      console.log('Missing snippet:', errorMatch[1]);
    }
    
    // Check if the snippets are being referenced correctly
    const hasIconGrid3 = pageContent.includes('icon-grid-3');
    const hasIconGrid4 = pageContent.includes('icon-grid-4');
    console.log('Page contains icon-grid-3 reference:', hasIconGrid3);
    console.log('Page contains icon-grid-4 reference:', hasIconGrid4);
    
    // Look for any SVG elements that might be the grid icons
    const svgElements = await page.locator('svg').count();
    console.log('Total SVG elements:', svgElements);
    
    // Check the view buttons specifically
    const viewButtons = await page.locator('.view-btn').count();
    console.log('View buttons found:', viewButtons);
    
    for (let i = 0; i < viewButtons; i++) {
      const button = page.locator('.view-btn').nth(i);
      const buttonText = await button.textContent();
      const buttonHTML = await button.innerHTML();
      console.log(`Button ${i + 1} text: "${buttonText}"`);
      console.log(`Button ${i + 1} HTML: "${buttonHTML}"`);
    }
    
    // Check if there are any console errors
    const consoleLogs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    console.log('Console logs:', consoleLogs);
    
    // Take screenshot
    await page.screenshot({ path: 'snippet-rendering-debug.png', fullPage: true });
    console.log('Screenshot saved: snippet-rendering-debug.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

testSnippetRendering(); 