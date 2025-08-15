import { test, expect } from '@playwright/test';

test.describe('Visual Layout Check', () => {
  test('Homepage layout should be professional and properly aligned', async ({ page }) => {
    // Navigate to the site
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the full page
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-full.png', 
      fullPage: true 
    });
    
    // Check header layout - be more specific about what we're measuring
    const headerWrapper = await page.locator('.header-wrapper').first();
    const headerClean = await page.locator('.header-clean').first();
    const headerRow = await page.locator('.header__row').first();
    
    const wrapperBox = await headerWrapper.boundingBox();
    const cleanBox = await headerClean.boundingBox();
    const rowBox = await headerRow.boundingBox();
    
    console.log('Header wrapper dimensions:', wrapperBox);
    console.log('Header clean dimensions:', cleanBox);
    console.log('Header row dimensions:', rowBox);
    
    // Take header screenshot
    await headerWrapper.screenshot({ 
      path: 'tests/screenshots/header-layout.png' 
    });
    
    // Check if navigation is visible and properly positioned
    const navMenu = await page.locator('.header__nav-menu, nav').first();
    const navVisible = await navMenu.isVisible();
    console.log('Navigation visible:', navVisible);
    
    // Check for any elements in upper left corner that shouldn't be there
    const upperLeftElements = await page.locator('body > *').evaluateAll(elements => {
      return elements
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < 100 && rect.left < 100 && rect.width < 50;
        })
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.textContent?.slice(0, 50),
          position: el.getBoundingClientRect()
        }));
    });
    
    console.log('Elements in upper left corner:', upperLeftElements);
    
    // Check for purple circles or visual artifacts
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const purpleElements = [];
      
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const borderRadius = styles.borderRadius;
        
        // Check for purple colors
        if (bgColor.includes('128, 0, 128') || 
            bgColor.includes('purple') ||
            bgColor.includes('147, 51, 234')) {
          purpleElements.push({
            tag: el.tagName,
            class: el.className,
            bgColor,
            borderRadius,
            position: el.getBoundingClientRect()
          });
        }
        
        // Check for large circles
        if (borderRadius === '50%' && el.offsetWidth > 100) {
          console.log('Large circle found:', {
            tag: el.tagName,
            class: el.className,
            size: el.offsetWidth,
            position: el.getBoundingClientRect()
          });
        }
      });
      
      if (purpleElements.length > 0) {
        console.log('Purple elements found:', purpleElements);
      }
    });
    
    // Check featured products section
    const featuredSection = await page.locator('.collection, [class*="featured"]').first();
    if (await featuredSection.isVisible()) {
      await featuredSection.screenshot({ 
        path: 'tests/screenshots/featured-products.png' 
      });
    }
    
    // Generate a visual report
    const report = await page.evaluate(() => {
      const header = document.querySelector('.header-clean, header');
      const nav = document.querySelector('.header__nav-menu, nav');
      const logo = document.querySelector('.header__logo-link, .header-logo');
      const actions = document.querySelector('.header__actions');
      
      return {
        header: {
          exists: !!header,
          height: header?.offsetHeight,
          position: header?.getBoundingClientRect()
        },
        navigation: {
          exists: !!nav,
          visible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
          position: nav?.getBoundingClientRect()
        },
        logo: {
          exists: !!logo,
          position: logo?.getBoundingClientRect()
        },
        actions: {
          exists: !!actions,
          position: actions?.getBoundingClientRect()
        }
      };
    });
    
    console.log('Layout Report:', JSON.stringify(report, null, 2));
    
    // Assert basic layout requirements - use row height instead of header wrapper
    expect(rowBox).toBeTruthy();
    expect(rowBox.height).toBeGreaterThan(50);
    expect(rowBox.height).toBeLessThan(100);
    
    // Logo should be on the left
    if (report.logo.exists) {
      expect(report.logo.position.left).toBeLessThan(200);
    }
    
    // Actions should be on the right
    if (report.actions.exists && report.header.exists) {
      expect(report.actions.position.right).toBeGreaterThan(report.header.position.width - 200);
    }
  });
});