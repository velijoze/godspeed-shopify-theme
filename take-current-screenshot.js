const { chromium } = require('playwright');

async function takeCurrentScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Taking screenshot of current e-bikes page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for any lazy loading
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'current-e-bikes-layout.png', 
      fullPage: true 
    });
    console.log('Current layout screenshot saved as: current-e-bikes-layout.png');
    
    // Also take viewport screenshot
    await page.screenshot({ 
      path: 'current-e-bikes-viewport.png',
      fullPage: false 
    });
    console.log('Viewport screenshot saved as: current-e-bikes-viewport.png');
    
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
  }
  
  await browser.close();
}

takeCurrentScreenshot();