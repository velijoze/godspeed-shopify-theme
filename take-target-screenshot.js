const { chromium } = require('playwright');

async function takeTargetScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Taking screenshot of target e-bikes page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for any lazy loading
    await page.waitForTimeout(5000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'target-e-bikes-layout.png', 
      fullPage: true,
      animations: 'disabled'
    });
    console.log('Target layout screenshot saved as: target-e-bikes-layout.png');
    
    // Take desktop viewport screenshot  
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: 'target-e-bikes-desktop.png',
      fullPage: false 
    });
    console.log('Desktop viewport screenshot saved as: target-e-bikes-desktop.png');
    
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
  }
  
  await browser.close();
}

takeTargetScreenshot();