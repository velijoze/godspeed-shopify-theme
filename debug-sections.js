const { chromium } = require('playwright');

async function debugSections() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Debugging what sections are actually loaded...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check what sections are actually in the DOM
    const sections = await page.$$eval('section, div[class*="section"]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        hasData: el.hasAttributes() ? Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ') : 'none'
      }))
    );
    
    console.log('Sections found:', sections.slice(0, 10));
    
    // Check for Pipeline-specific classes
    const pipelineElements = await page.$$eval('[class*="pipeline"], [data-pipeline]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id
      }))
    );
    
    console.log('Pipeline elements:', pipelineElements);
    
    // Check for sidebar
    const sidebar = await page.$eval('.collection-sidebar, .pipeline-filters-sidebar, .filters-sidebar', el => 'Found sidebar').catch(() => 'No sidebar found');
    console.log('Sidebar:', sidebar);
    
    // Check for toolbar
    const toolbar = await page.$eval('[class*="toolbar"], [class*="sort"], [class*="view-toggle"]', el => 'Found toolbar').catch(() => 'No toolbar found');
    console.log('Toolbar:', toolbar);
    
    // Check what's in the main content area
    const mainContent = await page.$eval('main, .main-content, .collection-content', el => el.innerHTML.substring(0, 500)).catch(() => 'No main content area');
    console.log('Main content preview:', mainContent);
    
    // Check for errors in console
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('Console errors:', consoleMessages);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

debugSections();