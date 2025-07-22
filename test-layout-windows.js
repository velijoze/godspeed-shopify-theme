const { chromium } = require('playwright');

(async () => {
  console.log('Testing layout from Windows environment...');
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log('Loading https://t0uds3-a2.myshopify.com/...');
    await page.goto('https://t0uds3-a2.myshopify.com/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'homepage-test.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved as homepage-test.png');
    
    // Check header dimensions
    const headerDimensions = await page.evaluate(() => {
      const headerWrapper = document.querySelector('.header-wrapper');
      const headerClean = document.querySelector('.header-clean');  
      const headerRow = document.querySelector('.header__row');
      const nav = document.querySelector('.header__nav-menu');
      const logo = document.querySelector('.header__logo-link');
      const actions = document.querySelector('.header__actions');
      
      return {
        wrapper: headerWrapper ? {
          height: headerWrapper.offsetHeight,
          rect: headerWrapper.getBoundingClientRect()
        } : null,
        clean: headerClean ? {
          height: headerClean.offsetHeight,
          rect: headerClean.getBoundingClientRect()  
        } : null,
        row: headerRow ? {
          height: headerRow.offsetHeight,
          rect: headerRow.getBoundingClientRect()
        } : null,
        navigation: nav ? {
          visible: window.getComputedStyle(nav).display !== 'none',
          rect: nav.getBoundingClientRect()
        } : null,
        logo: logo ? {
          rect: logo.getBoundingClientRect()
        } : null,
        actions: actions ? {
          rect: actions.getBoundingClientRect()  
        } : null
      };
    });
    
    console.log('\n=== HEADER DIMENSIONS ===');
    console.log('Wrapper height:', headerDimensions.wrapper?.height, 'px');
    console.log('Clean height:', headerDimensions.clean?.height, 'px');  
    console.log('Row height:', headerDimensions.row?.height, 'px');
    
    // Test the layout
    let issues = [];
    
    if (!headerDimensions.row) {
      issues.push('❌ Header row not found');
    } else if (headerDimensions.row.height > 100) {
      issues.push(`❌ Header row too tall: ${headerDimensions.row.height}px (should be ~70px)`);
    } else if (headerDimensions.row.height < 50) {
      issues.push(`❌ Header row too short: ${headerDimensions.row.height}px`);
    } else {
      console.log('✓ Header row height is good:', headerDimensions.row.height, 'px');
    }
    
    if (!headerDimensions.navigation?.visible) {
      issues.push('❌ Navigation menu not visible');
    } else {
      console.log('✓ Navigation menu is visible');
    }
    
    // Check if logo is on left
    if (headerDimensions.logo && headerDimensions.logo.rect.left > 200) {
      issues.push(`❌ Logo too far right: ${headerDimensions.logo.rect.left}px from left`);
    } else if (headerDimensions.logo) {
      console.log('✓ Logo positioned on left:', headerDimensions.logo.rect.left, 'px from left');
    }
    
    // Check if actions are on right
    if (headerDimensions.actions && headerDimensions.row) {
      const rightPosition = headerDimensions.actions.rect.right;
      const pageWidth = headerDimensions.row.rect.width;
      if (rightPosition < pageWidth - 200) {
        issues.push(`❌ Actions not on right side: ${rightPosition}px from left`);
      } else {
        console.log('✓ Actions positioned on right');
      }
    }
    
    console.log('\n=== TEST RESULTS ===');
    if (issues.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Layout looks good.');
    } else {
      console.log('❌ ISSUES FOUND:');
      issues.forEach(issue => console.log('  ', issue));
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error testing layout:', error.message);
    process.exit(1);
  }
})();