import { test, expect } from '@playwright/test';

test.describe('Customizer Functionality Test', () => {
  test('should verify all customizer settings work properly', async ({ page }) => {
    console.log('=== CUSTOMIZER FUNCTIONALITY TEST ===');
    
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const issues: string[] = [];
    
    // 1. Check if custom CSS variables are applied
    console.log('\n--- CSS VARIABLES TEST ---');
    
    const layout = await page.locator('.custom-collection-layout').first();
    const layoutStyle = await layout.getAttribute('style');
    console.log(`Layout style: ${layoutStyle}`);
    
    if (!layoutStyle?.includes('--custom-sidebar-width')) {
      issues.push('Custom sidebar width CSS variable not applied');
    }
    
    if (!layoutStyle?.includes('--custom-layout-gap')) {
      issues.push('Custom layout gap CSS variable not applied');
    }
    
    if (!layoutStyle?.includes('--custom-max-width')) {
      issues.push('Custom max width CSS variable not applied');
    }
    
    // 2. Check if grid columns are configurable
    console.log('\n--- GRID COLUMNS TEST ---');
    
    const grid = await page.locator('.custom-products-grid').first();
    const gridStyle = await grid.getAttribute('style');
    console.log(`Grid style: ${gridStyle}`);
    
    if (!gridStyle?.includes('--custom-columns-desktop')) {
      issues.push('Custom columns desktop CSS variable not applied');
    }
    
    if (!gridStyle?.includes('--custom-columns-mobile')) {
      issues.push('Custom columns mobile CSS variable not applied');
    }
    
    // 3. Check if card styling is configurable
    console.log('\n--- CARD STYLING TEST ---');
    
    const card = await page.locator('.custom-product-card').first();
    const cardStyle = await card.getAttribute('style');
    console.log(`Card style: ${cardStyle}`);
    
    if (!gridStyle?.includes('--custom-card-padding')) {
      issues.push('Custom card padding CSS variable not applied');
    }
    
    if (!gridStyle?.includes('--custom-card-border-radius')) {
      issues.push('Custom card border radius CSS variable not applied');
    }
    
    if (!gridStyle?.includes('--custom-card-title-size')) {
      issues.push('Custom card title size CSS variable not applied');
    }
    
    if (!gridStyle?.includes('--custom-card-price-size')) {
      issues.push('Custom card price size CSS variable not applied');
    }
    
    // 4. Check if badge colors are configurable
    console.log('\n--- BADGE COLORS TEST ---');
    
    const badges = await page.locator('.custom-card-badge').count();
    console.log(`Badges found: ${badges}`);
    
    for (let i = 0; i < Math.min(badges, 3); i++) {
      const badge = page.locator('.custom-card-badge').nth(i);
      const badgeStyle = await badge.getAttribute('style');
      console.log(`Badge ${i + 1} style: ${badgeStyle}`);
      
      if (badgeStyle?.includes('background-color: #dc2626')) {
        issues.push('Badge colors are hardcoded, should use customizer settings');
      }
      
      if (badgeStyle?.includes('font-size: 12px')) {
        issues.push('Badge font size is hardcoded, should use customizer settings');
      }
    }
    
    // 5. Check if image ratio settings work
    console.log('\n--- IMAGE RATIO TEST ---');
    
    const images = await page.locator('.custom-product-image').count();
    console.log(`Images found: ${images}`);
    
    for (let i = 0; i < Math.min(images, 3); i++) {
      const img = page.locator('.custom-product-image').nth(i);
      const imgStyle = await img.getAttribute('style');
      console.log(`Image ${i + 1} style: ${imgStyle}`);
      
      if (!imgStyle?.includes('aspect-ratio')) {
        issues.push('Image aspect ratio not applied');
      }
    }
    
    // 6. Check if secondary images are conditional
    console.log('\n--- SECONDARY IMAGES TEST ---');
    
    const secondaryImages = await page.locator('.custom-product-image-secondary').count();
    console.log(`Secondary images found: ${secondaryImages}`);
    
    // 7. Check if vendor display is conditional
    console.log('\n--- VENDOR DISPLAY TEST ---');
    
    const vendors = await page.locator('.custom-card-vendor').count();
    console.log(`Vendor elements found: ${vendors}`);
    
    // 8. Check if rating display is conditional
    console.log('\n--- RATING DISPLAY TEST ---');
    
    const ratings = await page.locator('.custom-card-rating').count();
    console.log(`Rating elements found: ${ratings}`);
    
    // 9. Check if sold out text color is configurable
    console.log('\n--- SOLD OUT TEXT TEST ---');
    
    const soldOutTexts = await page.locator('.custom-sold-out-text').count();
    console.log(`Sold out texts found: ${soldOutTexts}`);
    
    for (let i = 0; i < soldOutTexts; i++) {
      const text = page.locator('.pipeline-custom-sold-out-text').nth(i);
      const color = await text.evaluate(el => window.getComputedStyle(el).color);
      console.log(`Sold out text ${i + 1} color: ${color}`);
      
      if (color !== 'rgb(153, 153, 153)' && color !== '#999') {
        issues.push(`Sold out text color is ${color}, should be gray`);
      }
    }
    
    // 10. Check if all custom class names are used
    console.log('\n--- CUSTOM CLASS NAMES TEST ---');
    
    const customClasses = [
      'custom-collection-container',
      'custom-collection-layout',
      'custom-filters-sidebar',
      'custom-main-content',
      'custom-toolbar',
      'custom-sort-select',
      'custom-products-container',
      'custom-products-grid',
      'custom-product-card',
      'custom-card-media',
      'custom-card-image-link',
      'custom-product-image',
      'custom-product-image-secondary',
      'custom-card-badge',
      'custom-card-content',
      'custom-card-title',
      'custom-card-vendor',
      'custom-card-rating',
      'custom-card-price',
      'custom-regular-price',
      'custom-sale-price',
      'custom-original-price',
      'custom-sold-out-text'
    ];
    
    for (const className of customClasses) {
      const elements = await page.locator(`.${className}`).count();
      if (elements === 0) {
        issues.push(`Custom class "${className}" not found on page`);
      } else {
        console.log(`✓ Found ${elements} elements with class "${className}"`);
      }
    }
    
    // 11. Check if hamburger icon is hidden
    console.log('\n--- HAMBURGER ICON TEST ---');
    
    const hamburgerIcons = await page.locator('.header-drawer-toggle').count();
    console.log(`Hamburger icons found: ${hamburgerIcons}`);
    
    for (let i = 0; i < hamburgerIcons; i++) {
      const icon = page.locator('.header-drawer-toggle').nth(i);
      const isVisible = await icon.isVisible();
      console.log(`Hamburger icon ${i + 1} visible: ${isVisible}`);
      
      if (isVisible) {
        issues.push(`Hamburger icon ${i + 1} is still visible`);
      }
    }
    
    // 12. Check if price sidebar alignment is fixed
    console.log('\n--- PRICE SIDEBAR ALIGNMENT TEST ---');
    
    const priceArrows = await page.locator('[data-price-action]').count();
    console.log(`Price arrows found: ${priceArrows}`);
    
    if (priceArrows >= 4) {
      const arrowPositions: Array<{x?: number, y?: number}> = [];
      for (let i = 0; i < priceArrows; i++) {
        const arrow = page.locator('[data-price-action]').nth(i);
        const rect = await arrow.boundingBox();
        arrowPositions.push({ x: rect?.x, y: rect?.y });
      }
      
      // Check if arrows are aligned in pairs
      const firstPair = arrowPositions.slice(0, 2);
      const secondPair = arrowPositions.slice(2, 4);
      
      if (firstPair[0]?.x !== firstPair[1]?.x) {
        issues.push('First pair of price arrows not aligned');
      }
      
      if (secondPair[0]?.x !== secondPair[1]?.x) {
        issues.push('Second pair of price arrows not aligned');
      }
    }
    
    // Take screenshots
    await page.screenshot({ path: 'tests/screenshots/customizer-test-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/customizer-test-mobile.png', fullPage: true });
    
    // Report all issues
    console.log('\n=== CUSTOMIZER FUNCTIONALITY ISSUES ===');
    if (issues.length === 0) {
      console.log('✅ All customizer functionality working correctly!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ❌ ${issue}`);
      });
    }
    
    console.log(`\nTotal customizer issues found: ${issues.length}`);
    console.log('Screenshots saved: customizer-test-desktop.png, customizer-test-mobile.png');
    
    // Fail test if issues found
    expect(issues.length).toBe(0);
  });
}); 