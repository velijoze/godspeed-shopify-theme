import { test, expect } from '@playwright/test';

test.describe('Customizer Audit', () => {
  test('should audit all custom elements and customizer functionality', async ({ page }) => {
    console.log('=== CUSTOMIZER AUDIT ===');
    
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const issues: string[] = [];
    
    // 1. Check for custom prefix in class names
    console.log('\n--- CUSTOM PREFIX AUDIT ---');
    const customElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const customClasses: string[] = [];
      elements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ');
          classes.forEach(cls => {
            if (cls.startsWith('pipeline-') && !cls.startsWith('pipeline-custom-')) {
              customClasses.push(cls);
            }
          });
        }
      });
      return [...new Set(customClasses)];
    });
    
    console.log('Elements missing custom prefix:', customElements);
    customElements.forEach(cls => {
      issues.push(`Class "${cls}" should have 'custom' prefix`);
    });
    
    // 2. Check if customizer settings are applied
    console.log('\n--- CUSTOMIZER SETTINGS AUDIT ---');
    
    // Check products per page
    const productsPerPage = await page.locator('.pipeline-product-card').count();
    console.log(`Products displayed: ${productsPerPage}`);
    
    // Check desktop columns
    const gridStyle = await page.locator('.pipeline-products-grid').getAttribute('style');
    console.log(`Grid style: ${gridStyle}`);
    
    // Check mobile columns
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileGridStyle = await page.locator('.pipeline-products-grid').getAttribute('style');
    console.log(`Mobile grid style: ${mobileGridStyle}`);
    
    // 3. Check if settings are actually configurable
    console.log('\n--- CUSTOMIZER FUNCTIONALITY AUDIT ---');
    
    // Check if padding settings work
    const container = await page.locator('.pipeline-collection-container').first();
    const containerClass = await container.getAttribute('class');
    console.log(`Container class: ${containerClass}`);
    
    if (!containerClass?.includes('section-')) {
      issues.push('Section padding classes not applied');
    }
    
    // Check if image ratio settings work
    const productImages = await page.locator('.pipeline-product-image').count();
    console.log(`Product images found: ${productImages}`);
    
    for (let i = 0; i < Math.min(productImages, 3); i++) {
      const img = page.locator('.pipeline-product-image').nth(i);
      const imgStyle = await img.getAttribute('style');
      console.log(`Image ${i + 1} style: ${imgStyle}`);
    }
    
    // 4. Check for hardcoded values that should be configurable
    console.log('\n--- HARDCODED VALUES AUDIT ---');
    
    // Check sidebar width
    const layout = await page.locator('.pipeline-collection-layout').first();
    const layoutStyle = await layout.getAttribute('style');
    console.log(`Layout style: ${layoutStyle}`);
    
    if (layoutStyle?.includes('--sidebar-width: 280px')) {
      issues.push('Sidebar width is hardcoded, should be configurable');
    }
    
    // Check badge colors
    const badges = await page.locator('.pipeline-card-badge').count();
    console.log(`Badges found: ${badges}`);
    
    for (let i = 0; i < Math.min(badges, 3); i++) {
      const badge = page.locator('.pipeline-card-badge').nth(i);
      const badgeStyle = await badge.getAttribute('style');
      console.log(`Badge ${i + 1} style: ${badgeStyle}`);
      
      if (badgeStyle?.includes('background-color: #dc2626')) {
        issues.push('Badge colors are hardcoded, should be configurable');
      }
    }
    
    // 5. Check for missing customizer controls
    console.log('\n--- MISSING CUSTOMIZER CONTROLS ---');
    
    // These should be configurable but aren't in schema:
    const missingControls = [
      'Badge colors',
      'Badge font size',
      'Sidebar width',
      'Layout gap',
      'Toolbar styling',
      'Filter colors',
      'Price slider colors',
      'Grid gap',
      'Card border radius',
      'Card padding'
    ];
    
    missingControls.forEach(control => {
      issues.push(`Missing customizer control: ${control}`);
    });
    
    // 6. Check if existing controls actually work
    console.log('\n--- EXISTING CONTROLS FUNCTIONALITY ---');
    
    // Test if padding controls work
    const containerRect = await container.boundingBox();
    console.log(`Container padding: top=${containerRect?.y}, height=${containerRect?.height}`);
    
    // Test if column controls work
    const gridRect = await page.locator('.pipeline-products-grid').first().boundingBox();
    console.log(`Grid dimensions: width=${gridRect?.width}, height=${gridRect?.height}`);
    
    // 7. Check for responsive issues
    console.log('\n--- RESPONSIVE AUDIT ---');
    
    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    const desktopLayout = await page.locator('.pipeline-collection-layout').first().boundingBox();
    console.log(`Desktop layout: width=${desktopLayout?.width}`);
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileLayout = await page.locator('.pipeline-collection-layout').first().boundingBox();
    console.log(`Mobile layout: width=${mobileLayout?.width}`);
    
    if (desktopLayout?.width === mobileLayout?.width) {
      issues.push('Layout not responsive - desktop and mobile have same width');
    }
    
    // Take screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.screenshot({ path: 'tests/screenshots/customizer-audit-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/screenshots/customizer-audit-mobile.png', fullPage: true });
    
    // Report all issues
    console.log('\n=== CUSTOMIZER ISSUES FOUND ===');
    if (issues.length === 0) {
      console.log('✅ No customizer issues found!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ❌ ${issue}`);
      });
    }
    
    console.log(`\nTotal customizer issues found: ${issues.length}`);
    console.log('Screenshots saved: customizer-audit-desktop.png, customizer-audit-mobile.png');
    
    // Fail test if issues found
    expect(issues.length).toBe(0);
  });
}); 