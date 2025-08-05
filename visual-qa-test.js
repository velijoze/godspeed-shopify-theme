const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 COMPREHENSIVE VISUAL QA TEST');
  await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Take full screenshot for reference
  await page.screenshot({ path: 'qa-full-analysis.png', fullPage: true });
  
  console.log('\n🚨 CHECKING FOR VISUAL ISSUES:');
  
  // Check navigation issues
  const menuItems = await page.locator('nav a, header a').allInnerTexts();
  const duplicateEbikes = menuItems.filter(item => item.includes('E-BIKES') || item.includes('E-Bikes')).length;
  if (duplicateEbikes > 1) {
    console.log(`❌ DUPLICATE E-BIKES IN MENU: Found ${duplicateEbikes} instances`);
  }
  
  // Check hamburger menu
  const hamburger = await page.locator('.hamburger, .menu-toggle, button[aria-label*="menu"]').count();
  if (hamburger > 0) {
    console.log('❌ HAMBURGER MENU PRESENT (should be desktop layout)');
  }
  
  // Check triangles/arrows in navigation
  const triangles = await page.locator('text=/▼|▲|►|◄|∨|∧/').count();
  if (triangles > 0) {
    console.log(`❌ TRIANGLES/ARROWS IN NAVIGATION: ${triangles} found`);
  }
  
  // Check sidebar alignment
  const sidebarItems = await page.locator('.facets-wrapper *').count();
  console.log(`📊 SIDEBAR ELEMENTS: ${sidebarItems} items`);
  
  // Check for overlapping elements
  const overlaps = await page.evaluate(() => {
    const elements = document.querySelectorAll('.facets-wrapper *');
    let overlapCount = 0;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) overlapCount++;
    });
    return overlapCount;
  });
  if (overlaps > 0) {
    console.log(`❌ OVERLAPPING/ZERO-SIZE ELEMENTS: ${overlaps} found`);
  }
  
  // Check for duplicate checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').count();
  console.log(`📊 CHECKBOXES FOUND: ${checkboxes}`);
  
  // Check cart icon
  const cartIcon = await page.locator('.cart, [href*="cart"]').count();
  console.log(`🛒 CART ICONS: ${cartIcon} found`);
  
  // Check grid toggle buttons
  const gridButtons = await page.locator('.grid-toggle, [class*="grid"]').count();
  console.log(`⊞ GRID BUTTONS: ${gridButtons} found`);
  
  // Product visibility
  const products = await page.locator('.grid__item, .product-card, [class*="product"]').count();
  const visibleProducts = await page.locator('.grid__item:visible, .product-card:visible').count();
  console.log(`📦 PRODUCTS: ${products} total, ${visibleProducts} visible`);
  
  console.log('\n📸 VISUAL ANALYSIS COMPLETE');
  console.log('Check qa-full-analysis.png for full visual inspection');
  
  await browser.close();
})();