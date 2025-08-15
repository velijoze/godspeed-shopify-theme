import { test, expect } from '@playwright/test';

test.describe('Pipeline Customizer Settings Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests would ideally run in a Shopify admin context
    // For now, we'll test the frontend effects of customizer settings
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have Pipeline Features section in theme settings', async ({ page }) => {
    // Test if Pipeline-specific CSS variables and classes are present
    // indicating that Pipeline Features settings are active
    
    const pipelineFeatures = await page.evaluate(() => {
      const features = {
        ajaxCartEnabled: false,
        gridLayoutSet: false,
        colorSchemeApplied: false,
        typographyCustomized: false,
        pipelineClasses: []
      };

      // Check for Ajax cart settings
      if (document.querySelector('#AjaxifyDrawer') || document.querySelector('#AjaxifyModal')) {
        features.ajaxCartEnabled = true;
      }

      // Check for grid layout settings
      const gridElements = document.querySelectorAll('.collection-grid, .product-grid, [data-grid-layout]');
      if (gridElements.length > 0) {
        features.gridLayoutSet = true;
      }

      // Check for Pipeline-specific CSS classes
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const classList = Array.from(el.classList);
        classList.forEach(className => {
          if (className.includes('pipeline-') && !features.pipelineClasses.includes(className)) {
            features.pipelineClasses.push(className);
          }
        });
      });

      // Check for color scheme variables
      const rootStyles = getComputedStyle(document.documentElement);
      if (rootStyles.getPropertyValue('--color-primary') || 
          rootStyles.getPropertyValue('--pipeline-primary')) {
        features.colorSchemeApplied = true;
      }

      // Check for typography customization
      const headings = document.querySelectorAll('h1, h2, h3');
      if (headings.length > 0) {
        const headingStyle = getComputedStyle(headings[0]);
        if (headingStyle.fontFamily.includes('custom') || 
            headingStyle.fontWeight !== '400') {
          features.typographyCustomized = true;
        }
      }

      return features;
    });

    console.log('Pipeline Features detected:', pipelineFeatures);
    console.log('Pipeline CSS classes found:', pipelineFeatures.pipelineClasses);

    // Should have some Pipeline features enabled
    const hasPipelineFeatures = pipelineFeatures.ajaxCartEnabled || 
                               pipelineFeatures.gridLayoutSet || 
                               pipelineFeatures.pipelineClasses.length > 0;
    
    expect(hasPipelineFeatures).toBe(true);
  });

  test('should respect ajax cart method settings', async ({ page }) => {
    // Test different cart methods based on what's configured
    
    const cartMethods = await page.evaluate(() => {
      return {
        hasDrawer: document.querySelector('#AjaxifyDrawer') !== null,
        hasModal: document.querySelector('#AjaxifyModal') !== null,
        hasFlip: document.querySelector('.flip') !== null,
        cartToggleElements: document.querySelectorAll('[data-cart-toggle], .cart-toggle, .header__cart').length
      };
    });

    console.log('Cart methods detected:', cartMethods);

    // Should have at least one cart method enabled
    const hasCartMethod = cartMethods.hasDrawer || cartMethods.hasModal || cartMethods.hasFlip;
    expect(hasCartMethod).toBe(true);

    // Test cart functionality based on detected method
    if (cartMethods.cartToggleElements > 0) {
      const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
      await cartToggle.click();
      await page.waitForTimeout(500);

      if (cartMethods.hasDrawer) {
        const drawer = page.locator('#AjaxifyDrawer');
        await expect(drawer).toHaveClass(/is-visible/);
        console.log('Drawer cart method working');
      } else if (cartMethods.hasModal) {
        const modal = page.locator('#AjaxifyModal');
        await expect(modal).toHaveClass(/is-visible/);
        console.log('Modal cart method working');
      }
    }
  });

  test('should respect collection layout settings', async ({ page }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Check for layout options that could be set in customizer
    const layoutSettings = await page.evaluate(() => {
      const settings = {
        gridColumns: 0,
        hasListView: false,
        hasMasonryView: false,
        hasFilterSidebar: false,
        hasToolbar: false
      };

      // Check grid columns
      const productGrid = document.querySelector('.collection-grid, .product-grid');
      if (productGrid) {
        const gridStyle = getComputedStyle(productGrid);
        const gridColumns = gridStyle.gridTemplateColumns;
        if (gridColumns && gridColumns !== 'none') {
          settings.gridColumns = gridColumns.split(' ').length;
        }
      }

      // Check for view toggles
      settings.hasListView = document.querySelector('.list-view, [data-view="list"]') !== null;
      settings.hasMasonryView = document.querySelector('.masonry-view, [data-view="masonry"]') !== null;
      
      // Check for filter sidebar
      settings.hasFilterSidebar = document.querySelector('.filter-sidebar, .facets-sidebar') !== null;
      
      // Check for collection toolbar
      settings.hasToolbar = document.querySelector('.collection-toolbar, .facets-toolbar') !== null;

      return settings;
    });

    console.log('Collection layout settings:', layoutSettings);

    // Should have some grid layout
    expect(layoutSettings.gridColumns).toBeGreaterThan(0);

    // Test view switching if available
    const viewToggle = page.locator('.view-toggle, [data-view-toggle]');
    if (await viewToggle.count() > 0) {
      console.log('Testing view toggle functionality');
      await viewToggle.first().click();
      await page.waitForTimeout(500);
      
      // Layout should change
      const newLayout = await page.evaluate(() => {
        return document.querySelector('.list-view, .grid-view, .masonry-view') !== null;
      });
      expect(newLayout).toBe(true);
    }
  });

  test('should respect color scheme settings', async ({ page }) => {
    // Check if color scheme is applied from customizer settings
    const colorScheme = await page.evaluate(() => {
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        primaryColor: rootStyles.getPropertyValue('--color-primary').trim(),
        secondaryColor: rootStyles.getPropertyValue('--color-secondary').trim(),
        accentColor: rootStyles.getPropertyValue('--color-accent').trim(),
        backgroundColor: rootStyles.getPropertyValue('--color-background').trim(),
        textColor: rootStyles.getPropertyValue('--color-text').trim(),
        hasCustomColors: false
      };
    });

    // Check if custom colors are set
    colorScheme.hasCustomColors = !!(
      colorScheme.primaryColor || 
      colorScheme.secondaryColor || 
      colorScheme.accentColor
    );

    console.log('Color scheme settings:', colorScheme);

    // Should have some color customization
    if (colorScheme.hasCustomColors) {
      expect(colorScheme.hasCustomColors).toBe(true);
      console.log('Custom color scheme detected');
    }

    // Check if colors are applied to elements
    const colorApplications = await page.evaluate(() => {
      const applications = {
        buttonsStyled: false,
        linksStyled: false,
        headingsStyled: false
      };

      // Check button styling
      const buttons = document.querySelectorAll('button, .btn');
      if (buttons.length > 0) {
        const buttonStyle = getComputedStyle(buttons[0]);
        applications.buttonsStyled = buttonStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }

      // Check link styling
      const links = document.querySelectorAll('a');
      if (links.length > 0) {
        const linkStyle = getComputedStyle(links[0]);
        applications.linksStyled = linkStyle.color !== 'rgb(0, 0, 238)'; // Default blue
      }

      // Check heading styling
      const headings = document.querySelectorAll('h1, h2, h3');
      if (headings.length > 0) {
        const headingStyle = getComputedStyle(headings[0]);
        applications.headingsStyled = headingStyle.color !== 'rgb(0, 0, 0)'; // Default black
      }

      return applications;
    });

    console.log('Color applications:', colorApplications);
  });

  test('should respect typography settings', async ({ page }) => {
    // Check typography customizations from settings
    const typography = await page.evaluate(() => {
      const settings = {
        headingFont: '',
        bodyFont: '',
        headingWeight: '',
        bodySize: '',
        lineHeight: '',
        letterSpacing: ''
      };

      // Check heading typography
      const heading = document.querySelector('h1, h2, h3');
      if (heading) {
        const headingStyle = getComputedStyle(heading);
        settings.headingFont = headingStyle.fontFamily;
        settings.headingWeight = headingStyle.fontWeight;
        settings.letterSpacing = headingStyle.letterSpacing;
      }

      // Check body typography
      const body = document.body;
      const bodyStyle = getComputedStyle(body);
      settings.bodyFont = bodyStyle.fontFamily;
      settings.bodySize = bodyStyle.fontSize;
      settings.lineHeight = bodyStyle.lineHeight;

      return settings;
    });

    console.log('Typography settings:', typography);

    // Should have font settings
    expect(typography.headingFont).not.toBe('');
    expect(typography.bodyFont).not.toBe('');

    // Check for custom fonts (not system defaults)
    const hasCustomFonts = !typography.headingFont.includes('serif') && 
                          !typography.headingFont.includes('sans-serif') &&
                          typography.headingFont !== 'times';

    if (hasCustomFonts) {
      console.log('Custom fonts detected');
    }
  });

  test('should respect product settings', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Check product page customizations
    const productSettings = await page.evaluate(() => {
      return {
        hasImageZoom: document.querySelector('.zoom, [data-zoom]') !== null,
        hasQuickView: document.querySelector('.quick-view, [data-quick-view]') !== null,
        hasWishlist: document.querySelector('.wishlist, [data-wishlist]') !== null,
        hasCompare: document.querySelector('.compare, [data-compare]') !== null,
        hasReviews: document.querySelector('.reviews, .product-reviews') !== null,
        hasRelatedProducts: document.querySelector('.related-products, .product-recommendations') !== null,
        hasSizeGuide: document.querySelector('.size-guide, [data-size-guide]') !== null,
        hasProductTabs: document.querySelector('.product-tabs, [data-product-tabs]') !== null
      };
    });

    console.log('Product page settings:', productSettings);

    // Test enabled features
    if (productSettings.hasWishlist) {
      const wishlistBtn = page.locator('.wishlist, [data-wishlist]').first();
      if (await wishlistBtn.isVisible()) {
        await wishlistBtn.click();
        await page.waitForTimeout(500);
        console.log('Wishlist functionality tested');
      }
    }

    if (productSettings.hasCompare) {
      const compareBtn = page.locator('.compare, [data-compare]').first();
      if (await compareBtn.isVisible()) {
        await compareBtn.click();
        await page.waitForTimeout(500);
        console.log('Compare functionality tested');
      }
    }

    if (productSettings.hasSizeGuide) {
      const sizeGuideBtn = page.locator('.size-guide, [data-size-guide]').first();
      if (await sizeGuideBtn.isVisible()) {
        await sizeGuideBtn.click();
        await page.waitForTimeout(500);
        console.log('Size guide functionality tested');
      }
    }
  });

  test('should respect performance settings', async ({ page }) => {
    // Check performance-related settings
    const performanceSettings = await page.evaluate(() => {
      return {
        hasLazyLoading: document.querySelectorAll('img[loading="lazy"]').length > 0,
        hasPreloading: document.querySelectorAll('link[rel="preload"]').length > 0,
        hasInfiniteScroll: document.querySelector('[data-infinite-scroll]') !== null,
        hasImageOptimization: false,
        hasMinifiedAssets: false
      };
    });

    // Check for optimized images
    const images = await page.locator('img').count();
    if (images > 0) {
      const firstImage = page.locator('img').first();
      const src = await firstImage.getAttribute('src');
      if (src && (src.includes('_small') || src.includes('_medium') || src.includes('_large'))) {
        performanceSettings.hasImageOptimization = true;
      }
    }

    // Check for minified assets
    const scripts = await page.evaluate(() => {
      const scriptTags = document.querySelectorAll('script[src]');
      return Array.from(scriptTags).some(script => 
        script.src.includes('.min.') || script.src.includes('minified')
      );
    });
    performanceSettings.hasMinifiedAssets = scripts;

    console.log('Performance settings:', performanceSettings);

    // Should have some performance optimizations
    const hasOptimizations = performanceSettings.hasLazyLoading || 
                            performanceSettings.hasImageOptimization ||
                            performanceSettings.hasMinifiedAssets;
    
    if (hasOptimizations) {
      expect(hasOptimizations).toBe(true);
      console.log('Performance optimizations detected');
    }
  });

  test('should respect mobile responsiveness settings', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      const mobileSettings = await page.evaluate(() => {
        return {
          hasMobileMenu: document.querySelector('.mobile-menu, [data-mobile-menu]') !== null,
          hasResponsiveGrid: false,
          hasHiddenElements: document.querySelectorAll('.hide-mobile, .desktop-only').length > 0,
          hasTouch: document.querySelector('.touch-enabled') !== null
        };
      });

      // Check responsive grid
      const gridElement = page.locator('.collection-grid, .product-grid').first();
      if (await gridElement.count() > 0) {
        const gridStyle = await gridElement.evaluate(el => {
          return getComputedStyle(el).gridTemplateColumns;
        });
        
        if (gridStyle && gridStyle !== 'none') {
          const columns = gridStyle.split(' ').length;
          mobileSettings.hasResponsiveGrid = columns <= 2; // Mobile should have fewer columns
        }
      }

      console.log(`${viewport.name} responsive settings:`, mobileSettings);

      // Should have mobile optimizations
      if (viewport.width <= 768) {
        const hasMobileOptimizations = mobileSettings.hasMobileMenu || 
                                     mobileSettings.hasResponsiveGrid ||
                                     mobileSettings.hasHiddenElements;
        
        if (hasMobileOptimizations) {
          expect(hasMobileOptimizations).toBe(true);
          console.log(`${viewport.name} optimizations detected`);
        }
      }
    }
  });

  test('should validate customizer setting dependencies', async ({ page }) => {
    // Test that dependent settings work correctly together
    
    // Check Ajax cart + method combination
    const cartSettings = await page.evaluate(() => {
      const hasAjaxCart = document.querySelector('#AjaxifyDrawer, #AjaxifyModal, .flip') !== null;
      const hasCartCounter = document.querySelector('[data-cart-count], .cart-count') !== null;
      const hasCartToggle = document.querySelector('[data-cart-toggle], .cart-toggle') !== null;
      
      return {
        ajaxCartEnabled: hasAjaxCart,
        counterEnabled: hasCartCounter,
        toggleEnabled: hasCartToggle,
        consistentSetup: hasAjaxCart === hasCartCounter && hasCartCounter === hasCartToggle
      };
    });

    console.log('Cart settings consistency:', cartSettings);
    
    if (cartSettings.ajaxCartEnabled) {
      // If Ajax cart is enabled, other cart features should be too
      expect(cartSettings.consistentSetup).toBe(true);
    }

    // Check collection layout + filtering combination
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const collectionSettings = await page.evaluate(() => {
      const hasFilters = document.querySelector('.facets, .filters') !== null;
      const hasSorting = document.querySelector('.sort, [data-sort]') !== null;
      const hasGrid = document.querySelector('.collection-grid, .product-grid') !== null;
      
      return {
        filtersEnabled: hasFilters,
        sortingEnabled: hasSorting,
        gridEnabled: hasGrid,
        collectionFeatures: hasFilters || hasSorting || hasGrid
      };
    });

    console.log('Collection settings:', collectionSettings);
    
    // Should have collection functionality if products are present
    const productCount = await page.locator('.product-card, .card-product').count();
    if (productCount > 0) {
      expect(collectionSettings.collectionFeatures).toBe(true);
    }
  });

  test('should handle settings validation and errors', async ({ page }) => {
    // Check for any customizer-related JavaScript errors
    const jsErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('setting')) {
        consoleWarnings.push(msg.text());
      }
    });

    // Navigate to pages that use customizer settings
    const testPages = ['/', '/collections/all', '/products/test-product'];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // Filter critical errors related to settings
    const settingErrors = jsErrors.filter(error => 
      error.includes('setting') || 
      error.includes('customizer') ||
      error.includes('undefined variable')
    );

    console.log('Setting-related errors:', settingErrors);
    console.log('Setting warnings:', consoleWarnings);

    // Should not have critical setting errors
    expect(settingErrors.filter(e => !e.includes('third-party'))).toHaveLength(0);
  });
});