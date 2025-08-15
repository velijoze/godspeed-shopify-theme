import { test, expect } from '@playwright/test';

test.describe('Comprehensive Visual Audit', () => {
  test('should audit e-bikes collection page for ALL visual issues', async ({ page }) => {
    console.log('=== COMPREHENSIVE VISUAL AUDIT ===');
    
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const issues: string[] = [];
    
    // 1. Check product badges
    console.log('\n--- PRODUCT BADGES ---');
    const badges = await page.locator('.pipeline-card-badge').count();
    console.log(`Badges found: ${badges}`);
    
    for (let i = 0; i < badges; i++) {
      const badge = page.locator('.pipeline-card-badge').nth(i);
      const text = await badge.textContent();
      const fontSize = await badge.evaluate(el => window.getComputedStyle(el).fontSize);
      const color = await badge.evaluate(el => window.getComputedStyle(el).color);
      const bgColor = await badge.evaluate(el => window.getComputedStyle(el).backgroundColor);
      
      console.log(`Badge ${i + 1}: "${text?.trim()}" - Font: ${fontSize}, Color: ${color}, BG: ${bgColor}`);
      
      if (fontSize !== '12px') {
        issues.push(`Badge ${i + 1} font size is ${fontSize}, should be 12px`);
      }
    }
    
    // 2. Check sold out text color
    console.log('\n--- SOLD OUT TEXT ---');
    const soldOutTexts = await page.locator('.pipeline-sold-out-text').count();
    console.log(`Sold out texts found: ${soldOutTexts}`);
    
    for (let i = 0; i < soldOutTexts; i++) {
      const text = page.locator('.pipeline-sold-out-text').nth(i);
      const color = await text.evaluate(el => window.getComputedStyle(el).color);
      console.log(`Sold out text ${i + 1} color: ${color}`);
      
      if (color !== 'rgb(153, 153, 153)' && color !== '#999') {
        issues.push(`Sold out text ${i + 1} color is ${color}, should be gray`);
      }
    }
    
    // 3. Check hamburger icon
    console.log('\n--- HAMBURGER ICON ---');
    const hamburgerIcons = await page.locator('.header-drawer-toggle').count();
    console.log(`Hamburger icons found: ${hamburgerIcons}`);
    
    for (let i = 0; i < hamburgerIcons; i++) {
      const icon = page.locator('.header-drawer-toggle').nth(i);
      const isVisible = await icon.isVisible();
      const rect = await icon.boundingBox();
      console.log(`Hamburger icon ${i + 1}: visible=${isVisible}, position=(${rect?.x}, ${rect?.y})`);
      
      if (isVisible) {
        issues.push(`Hamburger icon ${i + 1} is still visible at (${rect?.x}, ${rect?.y})`);
      }
    }
    
    // 4. Check price sidebar alignment
    console.log('\n--- PRICE SIDEBAR ALIGNMENT ---');
    const priceArrows = await page.locator('[data-price-action]').count();
    console.log(`Price arrows found: ${priceArrows}`);
    
    const arrowPositions: Array<{text?: string, x?: number, y?: number}> = [];
    for (let i = 0; i < priceArrows; i++) {
      const arrow = page.locator('[data-price-action]').nth(i);
      const rect = await arrow.boundingBox();
      const text = await arrow.textContent();
      arrowPositions.push({ text: text?.trim(), x: rect?.x, y: rect?.y });
      console.log(`Arrow ${i + 1} "${text?.trim()}": x=${rect?.x}, y=${rect?.y}`);
    }
    
    // Check if arrows are aligned (should be in pairs)
    if (arrowPositions.length >= 4) {
      const firstPair = arrowPositions.slice(0, 2);
      const secondPair = arrowPositions.slice(2, 4);
      
      if (firstPair[0]?.x !== firstPair[1]?.x) {
        issues.push(`First pair of arrows not aligned: ${firstPair[0]?.x} vs ${firstPair[1]?.x}`);
      }
      if (secondPair[0]?.x !== secondPair[1]?.x) {
        issues.push(`Second pair of arrows not aligned: ${secondPair[0]?.x} vs ${secondPair[1]?.x}`);
      }
    }
    
    // 5. Check price inputs
    console.log('\n--- PRICE INPUTS ---');
    const priceInputs = await page.locator('.price-input').count();
    console.log(`Price inputs found: ${priceInputs}`);
    
    for (let i = 0; i < priceInputs; i++) {
      const input = page.locator('.price-input').nth(i);
      const rect = await input.boundingBox();
      console.log(`Price input ${i + 1}: x=${rect?.x}, y=${rect?.y}, width=${rect?.width}`);
    }
    
    // 6. Check toolbar alignment
    console.log('\n--- TOOLBAR ALIGNMENT ---');
    const toolbar = await page.locator('.pipeline-toolbar').first();
    if (await toolbar.count() > 0) {
      const toolbarRect = await toolbar.boundingBox();
      const left = await page.locator('.toolbar-left').first();
      const right = await page.locator('.toolbar-right').first();
      
      if (await left.count() > 0 && await right.count() > 0) {
        const leftRect = await left.boundingBox();
        const rightRect = await right.boundingBox();
        console.log(`Toolbar: width=${toolbarRect?.width}`);
        console.log(`Left: x=${leftRect?.x}, width=${leftRect?.width}`);
        console.log(`Right: x=${rightRect?.x}, width=${rightRect?.width}`);
        
        if (rightRect && leftRect && rightRect.x < leftRect.x + leftRect.width) {
          issues.push('Toolbar left and right sections overlap');
        }
      }
    }
    
    // 7. Check grid view toggle
    console.log('\n--- GRID VIEW TOGGLE ---');
    const viewButtons = await page.locator('.view-btn').count();
    console.log(`View buttons found: ${viewButtons}`);
    
    for (let i = 0; i < viewButtons; i++) {
      const button = page.locator('.view-btn').nth(i);
      const rect = await button.boundingBox();
      const svg = await button.locator('svg').count();
      console.log(`View button ${i + 1}: x=${rect?.x}, y=${rect?.y}, svg=${svg}`);
      
      if (svg === 0) {
        issues.push(`View button ${i + 1} missing SVG icon`);
      }
    }
    
    // 8. Check overall layout spacing
    console.log('\n--- LAYOUT SPACING ---');
    const container = await page.locator('.pipeline-collection-container').first();
    const layout = await page.locator('.pipeline-collection-layout').first();
    const sidebar = await page.locator('.pipeline-filters-sidebar').first();
    
    if (await container.count() > 0 && await layout.count() > 0 && await sidebar.count() > 0) {
      const containerRect = await container.boundingBox();
      const layoutRect = await layout.boundingBox();
      const sidebarRect = await sidebar.boundingBox();
      
      console.log(`Container: width=${containerRect?.width}`);
      console.log(`Layout: x=${layoutRect?.x}, width=${layoutRect?.width}`);
      console.log(`Sidebar: x=${sidebarRect?.x}, width=${sidebarRect?.width}`);
      
      if (layoutRect && sidebarRect && layoutRect.x !== sidebarRect.x) {
        issues.push('Layout and sidebar not properly aligned');
      }
    }
    
    // 9. Check for overlapping elements
    console.log('\n--- OVERLAPPING ELEMENTS ---');
    const overlapping = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const overlaps: Array<{element1: string, element2: string}> = [];
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
            overlaps.push({
              element1: elements[i].className || elements[i].tagName,
              element2: elements[j].className || elements[j].tagName
            });
          }
        }
      }
      return overlaps;
    });
    console.log(`Overlapping elements found: ${overlapping.length}`);
    
    // 10. Check CSS loading
    console.log('\n--- CSS LOADING ---');
    const cssLoaded = await page.evaluate(() => {
      return document.querySelector('link[href*="pipeline-collection.css"]') !== null;
    });
    console.log(`Pipeline collection CSS loaded: ${cssLoaded}`);
    
    if (!cssLoaded) {
      issues.push('Pipeline collection CSS not loaded');
    }
    
    // 11. Check for console errors
    console.log('\n--- CONSOLE ERRORS ---');
    const consoleErrors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    console.log(`Console errors: ${consoleErrors.length}`);
    
    // Take screenshots
    await page.screenshot({ path: 'tests/screenshots/comprehensive-audit-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/comprehensive-audit-mobile.png', fullPage: true });
    
    // Report all issues
    console.log('\n=== VISUAL ISSUES FOUND ===');
    if (issues.length === 0) {
      console.log('✅ No visual issues found!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ❌ ${issue}`);
      });
    }
    
    console.log(`\nTotal issues found: ${issues.length}`);
    console.log('Screenshots saved: comprehensive-audit-desktop.png, comprehensive-audit-mobile.png');
    
    // Fail test if issues found
    expect(issues.length).toBe(0);
  });
}); 