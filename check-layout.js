const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Loading https://t0uds3-a2.myshopify.com/...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'homepage-check.png', 
      fullPage: true 
    });
    console.log('Screenshot saved as homepage-check.png');
    
    // Check for layout issues
    const layoutReport = await page.evaluate(() => {
      const issues = [];
      
      // Check for elements bunched in upper left
      const allElements = document.querySelectorAll('*');
      const upperLeftElements = [];
      
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        
        // Elements in upper left corner (< 100px from top/left) that are visible
        if (rect.top < 100 && rect.left < 100 && 
            rect.width > 10 && rect.height > 10 &&
            styles.display !== 'none' && 
            styles.visibility !== 'hidden' &&
            el.offsetParent !== null) {
          upperLeftElements.push({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            text: el.textContent?.trim().slice(0, 30),
            position: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          });
        }
        
        // Check for purple circles
        if (styles.backgroundColor.includes('purple') || 
            styles.backgroundColor.includes('128, 0, 128') ||
            (styles.borderRadius === '50%' && rect.width > 50)) {
          issues.push({
            type: 'purple-circle',
            element: el.tagName + '.' + el.className,
            size: rect.width,
            color: styles.backgroundColor
          });
        }
      });
      
      // Get header info
      const header = document.querySelector('header, .header-clean');
      const headerInfo = header ? {
        height: header.offsetHeight,
        position: header.getBoundingClientRect()
      } : null;
      
      return {
        upperLeftElements,
        issues,
        headerInfo,
        pageTitle: document.title
      };
    });
    
    console.log('\n=== LAYOUT REPORT ===');
    console.log('Page Title:', layoutReport.pageTitle);
    console.log('\nHeader Info:', layoutReport.headerInfo);
    console.log('\nElements in Upper Left Corner:', layoutReport.upperLeftElements.length);
    if (layoutReport.upperLeftElements.length > 0) {
      layoutReport.upperLeftElements.forEach(el => {
        console.log(`  - ${el.tag}${el.class ? '.' + el.class : ''}${el.id ? '#' + el.id : ''}`);
        console.log(`    Position: top=${el.position.top}px, left=${el.position.left}px`);
        console.log(`    Size: ${el.position.width}x${el.position.height}`);
        if (el.text) console.log(`    Text: "${el.text}"`);
      });
    }
    
    if (layoutReport.issues.length > 0) {
      console.log('\nISSUES FOUND:');
      layoutReport.issues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.element} (${issue.size}px)`);
      });
    } else {
      console.log('\nNo purple circles or major issues detected.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();