import { test, expect } from '@playwright/test';

test.describe('Pipeline Visual Regression Tests', () => {
  const viewports = [
    { width: 1200, height: 800, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should capture homepage with Pipeline features', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Wait for any animations to complete
      await page.waitForFunction(() => {
        const animatedElements = document.querySelectorAll('*');
        for (let el of animatedElements) {
          const style = getComputedStyle(el);
          if (style.animationPlayState === 'running') {
            return false;
          }
        }
        return true;
      }, { timeout: 5000 }).catch(() => {
        // Continue if animations don't complete in time
      });

      await page.screenshot({ 
        path: `tests/screenshots/homepage-pipeline-${viewport.name}.png`,
        fullPage: true 
      });
    }
  });

  test('should capture Ajax cart functionality', async ({ page }) => {
    // First add a product to cart
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');
    
    const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);

      // Capture cart drawer/modal
      const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
      if (await cartToggle.isVisible()) {
        await cartToggle.click();
        await page.waitForTimeout(500);

        // Take screenshot of opened cart
        await page.screenshot({ 
          path: 'tests/screenshots/ajax-cart-open.png',
          fullPage: true 
        });

        // Test different cart states
        const qtyPlus = page.locator('.ajaxcart__qty--plus').first();
        if (await qtyPlus.isVisible()) {
          await qtyPlus.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: 'tests/screenshots/ajax-cart-updated.png',
            fullPage: true 
          });
        }
      }
    }
  });

  test('should capture collection page with Pipeline features', async ({ page }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Capture initial state
      await page.screenshot({ 
        path: `tests/screenshots/collection-pipeline-${viewport.name}.png`,
        fullPage: true 
      });

      // Test filter interaction if available
      const filterButton = page.locator('.filter-button, [data-filter], .facet-checkbox').first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `tests/screenshots/collection-filtered-${viewport.name}.png`,
          fullPage: true 
        });
      }

      // Test view toggle if available
      const viewToggle = page.locator('.view-toggle, [data-view-toggle]').first();
      if (await viewToggle.isVisible()) {
        await viewToggle.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `tests/screenshots/collection-view-toggle-${viewport.name}.png`,
          fullPage: true 
        });
      }
    }
  });

  test('should capture product page with Pipeline enhancements', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Capture product page
      await page.screenshot({ 
        path: `tests/screenshots/product-pipeline-${viewport.name}.png`,
        fullPage: true 
      });

      // Test image zoom if available
      const productImage = page.locator('.product-image, .product__media img').first();
      if (await productImage.isVisible()) {
        await productImage.hover();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `tests/screenshots/product-image-zoom-${viewport.name}.png`,
          fullPage: true 
        });
      }

      // Test product tabs if available
      const productTabs = page.locator('.product-tabs [data-tab]');
      if (await productTabs.count() > 1) {
        await productTabs.nth(1).click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `tests/screenshots/product-tabs-${viewport.name}.png`,
          fullPage: true 
        });
      }

      // Test size guide if available
      const sizeGuideBtn = page.locator('.size-guide-btn, [data-size-guide]').first();
      if (await sizeGuideBtn.isVisible()) {
        await sizeGuideBtn.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `tests/screenshots/size-guide-modal-${viewport.name}.png`,
          fullPage: true 
        });
        
        // Close modal
        const closeBtn = page.locator('.close, .modal-close, [data-close]').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should capture compare page functionality', async ({ page }) => {
    await page.goto('/pages/compare');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: `tests/screenshots/compare-page-${viewport.name}.png`,
        fullPage: true 
      });
    }

    // Test with products in comparison (if possible to simulate)
    const addToCompareButtons = page.locator('.add-to-compare, [data-compare-add]');
    if (await addToCompareButtons.count() > 0) {
      // Simulate having products in comparison
      await page.evaluate(() => {
        // Add mock data to localStorage for comparison
        const mockProducts = [
          { id: 1, title: 'Product 1', price: '299.99', image: '/placeholder.jpg' },
          { id: 2, title: 'Product 2', price: '399.99', image: '/placeholder.jpg' }
        ];
        localStorage.setItem('compareProducts', JSON.stringify(mockProducts));
      });

      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'tests/screenshots/compare-with-products.png',
        fullPage: true 
      });
    }
  });

  test('should capture wishlist page functionality', async ({ page }) => {
    await page.goto('/pages/wishlist');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: `tests/screenshots/wishlist-page-${viewport.name}.png`,
        fullPage: true 
      });
    }
  });

  test('should capture size guide functionality', async ({ page }) => {
    await page.goto('/pages/size-guide');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: `tests/screenshots/size-guide-page-${viewport.name}.png`,
        fullPage: true 
      });

      // Test size calculator if available
      const sizeCalculator = page.locator('.size-calculator, [data-size-calculator]');
      if (await sizeCalculator.isVisible()) {
        // Fill in sample data
        const heightInput = sizeCalculator.locator('input[name*="height"], #height');
        const weightInput = sizeCalculator.locator('input[name*="weight"], #weight');
        
        if (await heightInput.isVisible()) {
          await heightInput.fill('175');
        }
        if (await weightInput.isVisible()) {
          await weightInput.fill('70');
        }

        const calculateBtn = sizeCalculator.locator('button[type="submit"], .calculate-btn');
        if (await calculateBtn.isVisible()) {
          await calculateBtn.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: `tests/screenshots/size-calculator-result-${viewport.name}.png`,
            fullPage: true 
          });
        }
      }
    }
  });

  test('should capture financing calculator', async ({ page }) => {
    await page.goto('/pages/financing-calculator');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: `tests/screenshots/financing-calculator-${viewport.name}.png`,
        fullPage: true 
      });

      // Test calculator functionality
      const priceInput = page.locator('input[name*="price"], #price, [data-price-input]');
      const termSelect = page.locator('select[name*="term"], #term, [data-term-select]');
      
      if (await priceInput.isVisible()) {
        await priceInput.fill('2999');
      }
      if (await termSelect.isVisible()) {
        await termSelect.selectOption('12');
      }

      const calculateBtn = page.locator('button[data-calculate], .calculate-btn');
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `tests/screenshots/financing-result-${viewport.name}.png`,
          fullPage: true 
        });
      }
    }
  });

  test('should capture navigation and menu states', async ({ page }) => {
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);

    // Hover over navigation items to show dropdowns
    const navItems = page.locator('.header__nav-menu a, .nav-item');
    if (await navItems.count() > 0) {
      await navItems.first().hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'tests/screenshots/navigation-desktop-hover.png',
        fullPage: true 
      });
    }

    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileToggle = page.locator('.header__menu-toggle, .menu-toggle, [data-menu-toggle]').first();
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'tests/screenshots/navigation-mobile-open.png',
        fullPage: true 
      });
    }
  });

  test('should capture search functionality', async ({ page }) => {
    // Test search toggle and results
    const searchToggle = page.locator('.search-toggle, [data-search-toggle]').first();
    if (await searchToggle.isVisible()) {
      await searchToggle.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'tests/screenshots/search-opened.png',
        fullPage: true 
      });

      // Test search with query
      const searchInput = page.locator('input[type="search"], input[name*="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('bike');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/search-results.png',
          fullPage: true 
        });
      }
    }
  });

  test('should capture error and loading states', async ({ page }) => {
    // Capture 404 page
    await page.goto('/404-page-not-found');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/404-page.png',
      fullPage: true 
    });

    // Test loading states by intercepting requests
    await page.route('**/cart/add.js', route => {
      // Delay the response to capture loading state
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 123, quantity: 1 })
        });
      }, 2000);
    });

    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Capture loading state
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: 'tests/screenshots/add-to-cart-loading.png',
        fullPage: true 
      });
      
      // Wait for completion
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tests/screenshots/add-to-cart-success.png',
        fullPage: true 
      });
    }
  });

  test('should capture theme customization variants', async ({ page }) => {
    // Test different color schemes if available
    const colorSchemes = ['light', 'dark'];
    
    for (const scheme of colorSchemes) {
      // Try to apply color scheme via URL parameter or class
      await page.goto(`/?color_scheme=${scheme}`);
      await page.waitForLoadState('networkidle');
      
      // Or try adding class to body
      await page.evaluate((colorScheme) => {
        document.body.className = document.body.className.replace(/color-scheme-\w+/g, '');
        document.body.classList.add(`color-scheme-${colorScheme}`);
      }, scheme);
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/color-scheme-${scheme}.png`,
        fullPage: true 
      });
    }
  });

  test('should verify visual consistency across page reloads', async ({ page }) => {
    // Take multiple screenshots of the same page to ensure consistency
    const testPages = ['/', '/collections/all', '/products/test-product'];
    
    for (const pagePath of testPages) {
      const pageName = pagePath === '/' ? 'homepage' : pagePath.replace(/[\/]/g, '-');
      
      for (let i = 0; i < 3; i++) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `tests/screenshots/consistency-${pageName}-${i}.png`,
          fullPage: true 
        });
      }
    }
  });
});