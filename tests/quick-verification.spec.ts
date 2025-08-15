import { test, expect } from '@playwright/test';

test.describe('Quick Verification', () => {
  test('should check current site state', async ({ page }) => {
    console.log('=== QUICK VERIFICATION ===');
    
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check what elements are actually present
    console.log('\n--- ELEMENT CHECK ---');
    
    const oldElements = await page.locator('.pipeline-custom-collection-container').count();
    const newElements = await page.locator('.custom-collection-container').count();
    const anyCollectionElements = await page.locator('[class*="collection"]').count();
    
    console.log(`Old pipeline-custom elements: ${oldElements}`);
    console.log(`New custom elements: ${newElements}`);
    console.log(`Any collection elements: ${anyCollectionElements}`);
    
    // Check for any elements with "custom" in class name
    const customElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const customClasses: string[] = [];
      elements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ');
          classes.forEach(cls => {
            if (cls.includes('custom')) {
              customClasses.push(cls);
            }
          });
        }
      });
      return [...new Set(customClasses)];
    });
    
    console.log('Elements with "custom" in class name:', customElements);
    
    // Check for hamburger icon
    const hamburgerIcons = await page.locator('.header-drawer-toggle').count();
    console.log(`Hamburger icons found: ${hamburgerIcons}`);
    
    for (let i = 0; i < hamburgerIcons; i++) {
      const icon = page.locator('.header-drawer-toggle').nth(i);
      const isVisible = await icon.isVisible();
      console.log(`Hamburger icon ${i + 1} visible: ${isVisible}`);
    }
    
    // Check for logo
    const logos = await page.locator('.header__logo-clean').count();
    console.log(`Logos found: ${logos}`);
    
    // Check for menu
    const menus = await page.locator('.header__nav-menu').count();
    console.log(`Navigation menus found: ${menus}`);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/current-state.png', fullPage: true });
    console.log('Screenshot saved: current-state.png');
    
    // Don't fail the test, just report findings
    console.log('\n=== VERIFICATION COMPLETE ===');
  });
}); 