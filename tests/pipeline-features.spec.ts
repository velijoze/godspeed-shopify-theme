import { test, expect } from '@playwright/test';

test.describe('Pipeline Features Testing', () => {
  test('should display Pipeline-style product cards with enhanced features', async ({ page }) => {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    console.log('Testing Pipeline product card features...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for product cards
    const productCards = await page.locator('.pipeline-product-card').count();
    console.log(`Found ${productCards} Pipeline product cards`);
    
    if (productCards > 0) {
      // Test hover effects on first card
      const firstCard = page.locator('.pipeline-product-card').first();
      await firstCard.hover();
      
      // Check for quick buy button visibility on hover
      const quickBuyVisible = await firstCard.locator('.quick-buy-wrapper').isVisible();
      console.log('Quick buy button visible on hover:', quickBuyVisible);
      
      // Check for image hover effect
      const hoverImage = await firstCard.locator('.product-card-image-hover').isVisible();
      console.log('Hover image present:', hoverImage);
      
      // Check for color swatches
      const colorSwatches = await firstCard.locator('.color-swatches').count();
      console.log(`Color swatches found: ${colorSwatches}`);
      
      // Check for product badges
      const badges = await firstCard.locator('.card__badge .badge').count();
      console.log(`Product badges found: ${badges}`);
    }
    
    // Take screenshot of product grid
    await page.screenshot({ 
      path: 'tests/screenshots/pipeline-product-cards.png',
      fullPage: true 
    });
  });

  test('should test countdown timer functionality', async ({ page }) => {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    console.log('Testing countdown timer features...');
    
    // Look for countdown timers
    const countdownTimers = await page.locator('[data-countdown]').count();
    console.log(`Countdown timers found: ${countdownTimers}`);
    
    if (countdownTimers > 0) {
      const timer = page.locator('[data-countdown]').first();
      
      // Wait for countdown to initialize
      await page.waitForTimeout(2000);
      
      // Check countdown display
      const days = await timer.locator('[data-days]').textContent();
      const hours = await timer.locator('[data-hours]').textContent();
      const minutes = await timer.locator('[data-minutes]').textContent();
      const seconds = await timer.locator('[data-seconds]').textContent();
      
      console.log(`Countdown display: ${days}d ${hours}h ${minutes}m ${seconds}s`);
      
      // Verify countdown is updating
      await page.waitForTimeout(1000);
      const newSeconds = await timer.locator('[data-seconds]').textContent();
      const isUpdating = newSeconds !== seconds;
      console.log('Countdown is updating:', isUpdating);
    }
  });

  test('should test hero banner with parallax', async ({ page }) => {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    console.log('Testing hero banner parallax...');
    
    // Look for hero banner
    const heroBanner = await page.locator('.hero-banner-pipeline').count();
    console.log(`Hero banners found: ${heroBanner}`);
    
    if (heroBanner > 0) {
      const banner = page.locator('.hero-banner-pipeline').first();
      
      // Check for parallax attribute
      const hasParallax = await banner.getAttribute('data-parallax');
      console.log('Parallax enabled:', hasParallax === 'true');
      
      // Check for content blocks
      const headings = await banner.locator('.hero-banner__heading').count();
      const text = await banner.locator('.hero-banner__text').count();
      const buttons = await banner.locator('.hero-banner__buttons').count();
      
      console.log(`Hero content: ${headings} headings, ${text} text blocks, ${buttons} buttons`);
      
      // Test scroll behavior (basic check)
      const initialImageTransform = await page.evaluate(() => {
        const img = document.querySelector('.hero-banner__image');
        return img ? window.getComputedStyle(img).transform : 'none';
      });
      
      // Scroll down a bit
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(100);
      
      const scrolledImageTransform = await page.evaluate(() => {
        const img = document.querySelector('.hero-banner__image');
        return img ? window.getComputedStyle(img).transform : 'none';
      });
      
      const parallaxWorking = initialImageTransform !== scrolledImageTransform;
      console.log('Parallax effect working:', parallaxWorking);
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/pipeline-hero-banner.png',
      fullPage: false 
    });
  });

  test('should test mega menu enhancements', async ({ page }) => {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    console.log('Testing mega menu features...');
    
    // Look for navigation
    const navigation = await page.locator('nav, .header__nav-menu').first();
    
    if (await navigation.isVisible()) {
      // Look for menu items that might have mega menus
      const menuItems = await navigation.locator('a').count();
      console.log(`Navigation items found: ${menuItems}`);
      
      // Try to hover over first menu item to trigger mega menu
      if (menuItems > 0) {
        const firstMenuItem = navigation.locator('a').first();
        await firstMenuItem.hover();
        
        // Wait for potential mega menu to appear
        await page.waitForTimeout(500);
        
        // Check for mega menu
        const megaMenu = await page.locator('.mega-menu__content').count();
        console.log(`Mega menus found: ${megaMenu}`);
        
        if (megaMenu > 0) {
          const menuContent = page.locator('.mega-menu__content').first();
          const isVisible = await menuContent.isVisible();
          console.log('Mega menu visible on hover:', isVisible);
        }
      }
    }
  });

  test('should test overall Pipeline design improvements', async ({ page }) => {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    
    console.log('Testing overall Pipeline design...');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check typography improvements
    const typography = await page.evaluate(() => {
      const heading = document.querySelector('h1, .title');
      const body = document.querySelector('body');
      
      return {
        headingFontWeight: heading ? window.getComputedStyle(heading).fontWeight : 'not found',
        bodyFontSize: body ? window.getComputedStyle(body).fontSize : 'not found',
        headingLetterSpacing: heading ? window.getComputedStyle(heading).letterSpacing : 'not found'
      };
    });
    
    console.log('Typography styles:', typography);
    
    // Check for Pipeline CSS classes
    const pipelineElements = await page.evaluate(() => {
      const elements = [];
      if (document.querySelector('.pipeline-product-card')) elements.push('product-cards');
      if (document.querySelector('.hero-banner-pipeline')) elements.push('hero-banner');
      if (document.querySelector('.countdown-timer-section')) elements.push('countdown-timer');
      if (document.querySelector('.mega-menu__content')) elements.push('mega-menu');
      return elements;
    });
    
    console.log('Pipeline elements found:', pipelineElements);
    
    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/pipeline-full-design.png',
      fullPage: true 
    });
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/pipeline-mobile-design.png',
      fullPage: true 
    });
    
    // Test performance impact
    const performanceMetrics = await page.evaluate(() => {
      return {
        loadTime: performance.now(),
        domElements: document.querySelectorAll('*').length,
        cssRules: Array.from(document.styleSheets).reduce((total, sheet) => {
          try {
            return total + sheet.cssRules.length;
          } catch (e) {
            return total;
          }
        }, 0)
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      features: pipelineElements,
      typography: typography,
      performance: performanceMetrics,
      status: pipelineElements.length > 0 ? 'Pipeline features detected' : 'No Pipeline features found'
    };
    
    console.log('\n=== PIPELINE FEATURES TEST REPORT ===');
    console.log(JSON.stringify(report, null, 2));
  });
});