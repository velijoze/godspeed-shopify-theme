const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUGGING SECTION USAGE');
  console.log('==========================');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const pageSource = await page.content();
    
    // Check which collection section is actually being used
    const sectionChecks = [
      { name: 'pipeline-collection-grid', found: pageSource.includes('Custom – Pipeline Collection Grid') },
      { name: 'main-collection-product-grid', found: pageSource.includes('main-collection-product-grid') },
      { name: 'collection.liquid template', found: pageSource.includes('sections/collection.liquid') },
      { name: 'Pipeline collection grid section', found: pageSource.includes('pipeline-collection-container') },
      { name: 'Standard collection grid', found: pageSource.includes('product-grid-container') }
    ];
    
    console.log('\n📋 COLLECTION SECTION DETECTION:');
    console.log('=================================');
    
    sectionChecks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.found ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    // Check if our conditional logic is present in page source
    const conditionalChecks = [
      { name: 'Quick-add conditional CSS', found: pageSource.includes('unless section.settings.quick_add == \'none\'') },
      { name: 'Quick-add conditional JS', found: pageSource.includes('if section.settings.quick_add == \'standard\'') },
      { name: 'Quick-add section setting', found: pageSource.includes('"quick_add"') }
    ];
    
    console.log('\n🔧 CONDITIONAL LOGIC CHECK:');
    console.log('============================');
    
    conditionalChecks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.found ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    // Check actual asset loading
    const assetChecks = [
      { name: 'pipeline-collection.css', found: pageSource.includes('pipeline-collection.css') },
      { name: 'quick-add.css', found: pageSource.includes('quick-add.css') },
      { name: 'quick-add.js', found: pageSource.includes('quick-add.js') },
      { name: 'cart-bridge.js', found: pageSource.includes('cart-bridge.js') },
      { name: 'ajaxify.js', found: pageSource.includes('ajaxify.js') }
    ];
    
    console.log('\n📜 ASSET LOADING STATUS:');
    console.log('========================');
    
    assetChecks.forEach(asset => {
      const status = asset.found ? '✅' : '❌';
      console.log(`${status} ${asset.name}: ${asset.found ? 'LOADED' : 'NOT LOADED'}`);
    });
    
    // Look for template information in page source
    const templateInfo = pageSource.match(/template["\']:\s*["\']([^"']+)["\']/) || 
                        pageSource.match(/data-template["\']:\s*["\']([^"']+)["\']/) ||
                        pageSource.match(/body.*class[^>]*template-([^"\s]+)/);
    
    if (templateInfo) {
      console.log(`\n🏗️  TEMPLATE INFO: ${templateInfo[1] || templateInfo[0]}`);
    }
    
    // Extract relevant HTML structure
    const collectionContainer = await page.locator('[class*="collection"], [id*="collection"], [data-id*="collection"]').count();
    const pipelineCards = await page.locator('.pipeline-product-card').count();
    const standardCards = await page.locator('.grid__item').count();
    
    console.log('\n🎯 DOM STRUCTURE:');
    console.log('=================');
    console.log(`Collection containers: ${collectionContainer}`);
    console.log(`Pipeline product cards: ${pipelineCards}`);
    console.log(`Standard product cards: ${standardCards}`);
    
    // Check if the issue is that we're using the wrong template
    if (pipelineCards === 0 && standardCards > 0) {
      console.log('\n⚠️  DIAGNOSIS: Using standard collection template, not pipeline-collection-grid');
      console.log('    SOLUTION: Configure collection template to use Pipeline Collection Grid section');
    } else if (pipelineCards > 0) {
      console.log('\n✅ GOOD: Using Pipeline Collection Grid section');
      console.log('    NEXT: Check section settings configuration in Shopify admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
})();