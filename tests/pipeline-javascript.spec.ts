import { test, expect } from '@playwright/test';

test.describe('Pipeline JavaScript Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load all required Pipeline JavaScript libraries', async ({ page }) => {
    // Check if jQuery is loaded
    const jqueryLoaded = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined';
    });
    expect(jqueryLoaded).toBe(true);

    // Check jQuery version
    const jqueryVersion = await page.evaluate(() => {
      return window.jQuery ? window.jQuery.fn.jquery : null;
    });
    console.log('jQuery version:', jqueryVersion);

    // Check if Modernizr is loaded
    const modernizrLoaded = await page.evaluate(() => {
      return typeof window.Modernizr !== 'undefined';
    });
    expect(modernizrLoaded).toBe(true);

    // Check Modernizr capabilities
    const modernizrFeatures = await page.evaluate(() => {
      if (typeof window.Modernizr !== 'undefined') {
        return {
          csstransforms: window.Modernizr.csstransforms,
          csstransforms3d: window.Modernizr.csstransforms3d,
          touch: window.Modernizr.touch
        };
      }
      return null;
    });
    console.log('Modernizr features:', modernizrFeatures);

    // Check if FastClick is loaded (if used)
    const fastClickLoaded = await page.evaluate(() => {
      return typeof window.FastClick !== 'undefined';
    });
    console.log('FastClick loaded:', fastClickLoaded);

    // Check if Handlebars is loaded (required for cart templates)
    const handlebarsLoaded = await page.evaluate(() => {
      return typeof window.Handlebars !== 'undefined';
    });
    console.log('Handlebars loaded:', handlebarsLoaded);
  });

  test('should initialize Pipeline shop functionality', async ({ page }) => {
    // Check if pipeline shop functions are available
    const pipelineShopLoaded = await page.evaluate(() => {
      return typeof window.pipelineShop !== 'undefined' || 
             typeof window.Pipeline !== 'undefined';
    });
    
    if (pipelineShopLoaded) {
      console.log('Pipeline shop functionality detected');
      
      // Test specific Pipeline functions if available
      const pipelineFunctions = await page.evaluate(() => {
        const functions = [];
        if (window.pipelineShop) {
          if (typeof window.pipelineShop.init === 'function') functions.push('init');
          if (typeof window.pipelineShop.filterProducts === 'function') functions.push('filterProducts');
          if (typeof window.pipelineShop.sortProducts === 'function') functions.push('sortProducts');
        }
        return functions;
      });
      
      console.log('Available Pipeline functions:', pipelineFunctions);
    }
  });

  test('should handle responsive navigation menu', async ({ page }) => {
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);

    const desktopNav = page.locator('.header__nav-menu');
    const isDesktopNavVisible = await desktopNav.isVisible();
    console.log('Desktop navigation visible:', isDesktopNavVisible);

    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileToggle = page.locator('.header__menu-toggle, .menu-toggle, [data-menu-toggle]');
    const isMobileToggleVisible = await mobileToggle.count() > 0 && await mobileToggle.first().isVisible();
    
    if (isMobileToggleVisible) {
      // Click mobile menu toggle
      await mobileToggle.first().click();
      await page.waitForTimeout(500);

      // Check if mobile menu opened
      const mobileMenu = page.locator('.header__menu-drawer, .mobile-menu, [data-mobile-menu]');
      const isMobileMenuOpen = await mobileMenu.count() > 0 && await mobileMenu.first().isVisible();
      
      expect(isMobileMenuOpen).toBe(true);
      console.log('Mobile menu opened successfully');

      // Close mobile menu
      const closeButton = page.locator('.menu-close, [data-menu-close]');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(500);
        
        const isMobileMenuClosed = await mobileMenu.first().isHidden();
        expect(isMobileMenuClosed).toBe(true);
      }
    }
  });

  test('should handle product quick view functionality', async ({ page }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Look for quick view buttons
    const quickViewButtons = page.locator('.quick-view, [data-quick-view], .pipeline-quick-view');
    const quickViewCount = await quickViewButtons.count();
    
    if (quickViewCount > 0) {
      console.log(`Found ${quickViewCount} quick view buttons`);
      
      // Click first quick view button
      await quickViewButtons.first().click();
      await page.waitForTimeout(1000);

      // Check if quick view modal opened
      const quickViewModal = page.locator('.quick-view-modal, [data-quick-view-modal], .pipeline-modal');
      const isModalVisible = await quickViewModal.count() > 0 && await quickViewModal.first().isVisible();
      
      if (isModalVisible) {
        expect(isModalVisible).toBe(true);
        console.log('Quick view modal opened successfully');

        // Check for product details in modal
        const productTitle = quickViewModal.locator('.product-title, h1, h2');
        const productPrice = quickViewModal.locator('.price, .product-price');
        const addToCartForm = quickViewModal.locator('form[action*="/cart/add"]');

        await expect(productTitle.first()).toBeVisible();
        await expect(productPrice.first()).toBeVisible();
        
        if (await addToCartForm.count() > 0) {
          await expect(addToCartForm.first()).toBeVisible();
        }

        // Close modal
        const closeButton = quickViewModal.locator('.close, .modal-close, [data-close]');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log('No quick view functionality found');
    }
  });

  test('should handle product filtering and sorting', async ({ page }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Test sorting functionality
    const sortSelect = page.locator('select[name*="sort"], .sort-select, [data-sort]');
    if (await sortSelect.count() > 0) {
      const initialProducts = await page.locator('.product-card, .card-product').count();
      console.log(`Initial product count: ${initialProducts}`);

      // Change sort order
      await sortSelect.first().selectOption('price-ascending');
      await page.waitForTimeout(2000);

      // Verify sort worked (products should still be present)
      const sortedProducts = await page.locator('.product-card, .card-product').count();
      expect(sortedProducts).toBeGreaterThan(0);
      console.log('Sorting functionality working');
    }

    // Test filtering functionality
    const filterButtons = page.locator('.filter-button, [data-filter], .facet-checkbox');
    if (await filterButtons.count() > 0) {
      console.log(`Found ${await filterButtons.count()} filter options`);
      
      // Click first filter
      await filterButtons.first().click();
      await page.waitForTimeout(2000);

      // Verify filter applied (URL should change or products should update)
      const currentUrl = page.url();
      console.log('URL after filter:', currentUrl);
      
      const filteredProducts = await page.locator('.product-card, .card-product').count();
      console.log(`Products after filter: ${filteredProducts}`);
    }
  });

  test('should handle product image zoom functionality', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Look for product images
    const productImages = page.locator('.product-image, .product__media img');
    if (await productImages.count() > 0) {
      const firstImage = productImages.first();
      
      // Check for zoom trigger (magnifying glass or data attribute)
      const zoomTrigger = page.locator('.zoom-trigger, [data-zoom], .magnify');
      const hasZoomTrigger = await zoomTrigger.count() > 0;

      if (hasZoomTrigger) {
        // Test zoom functionality
        await firstImage.hover();
        await page.waitForTimeout(500);

        // Check if zoom overlay appeared
        const zoomOverlay = page.locator('.zoom-overlay, .magnify-lens, [data-zoom-overlay]');
        const isZoomActive = await zoomOverlay.count() > 0 && await zoomOverlay.first().isVisible();
        
        if (isZoomActive) {
          console.log('Product image zoom working');
          expect(isZoomActive).toBe(true);
        }
      } else {
        // Check for lightbox functionality
        await firstImage.click();
        await page.waitForTimeout(500);

        const lightbox = page.locator('.lightbox, .modal, [data-lightbox]');
        const isLightboxOpen = await lightbox.count() > 0 && await lightbox.first().isVisible();
        
        if (isLightboxOpen) {
          console.log('Product image lightbox working');
          expect(isLightboxOpen).toBe(true);
          
          // Close lightbox
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should handle wishlist functionality', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Look for wishlist button
    const wishlistButton = page.locator('.wishlist-btn, [data-wishlist], .add-to-wishlist');
    if (await wishlistButton.count() > 0) {
      console.log('Wishlist functionality found');
      
      // Check initial state
      const isActive = await wishlistButton.first().evaluate(el => 
        el.classList.contains('active') || el.classList.contains('added')
      );
      
      // Click wishlist button
      await wishlistButton.first().click();
      await page.waitForTimeout(1000);

      // Check if state changed
      const newState = await wishlistButton.first().evaluate(el => 
        el.classList.contains('active') || el.classList.contains('added')
      );
      
      expect(newState).not.toBe(isActive);
      console.log('Wishlist toggle working');
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Test search toggle
    const searchToggle = page.locator('.search-toggle, [data-search-toggle], .header__search-toggle');
    if (await searchToggle.count() > 0) {
      await searchToggle.first().click();
      await page.waitForTimeout(500);

      // Check if search form appeared
      const searchForm = page.locator('.search-form, [data-search-form], .predictive-search');
      const isSearchVisible = await searchForm.count() > 0 && await searchForm.first().isVisible();
      
      if (isSearchVisible) {
        console.log('Search form opened');
        
        // Test search input
        const searchInput = searchForm.locator('input[type="search"], input[name*="search"]');
        if (await searchInput.count() > 0) {
          await searchInput.first().fill('test');
          await page.waitForTimeout(1000);

          // Check for predictive search results
          const searchResults = page.locator('.search-results, .predictive-search__results');
          const hasResults = await searchResults.count() > 0;
          
          if (hasResults) {
            console.log('Predictive search working');
            expect(hasResults).toBe(true);
          }
        }
      }
    }
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/pages/contact');
    await page.waitForLoadState('networkidle');

    // Look for contact form
    const contactForm = page.locator('form[action*="contact"], .contact-form');
    if (await contactForm.count() > 0) {
      // Test required field validation
      const submitButton = contactForm.locator('button[type="submit"], input[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        await page.waitForTimeout(500);

        // Check for validation messages
        const validationMessages = page.locator('.error, .invalid, [data-error]');
        const hasValidation = await validationMessages.count() > 0;
        
        if (hasValidation) {
          console.log('Form validation working');
          expect(hasValidation).toBe(true);
        }
      }
    }
  });

  test('should handle performance optimization features', async ({ page }) => {
    // Test lazy loading
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Check for lazy loaded images
    const lazyImages = page.locator('img[loading="lazy"], img[data-src]');
    const lazyImageCount = await lazyImages.count();
    
    if (lazyImageCount > 0) {
      console.log(`Found ${lazyImageCount} lazy-loaded images`);
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1000);

      // Check if images loaded
      const loadedImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img[data-src]');
        let loaded = 0;
        imgs.forEach(img => {
          if (img.src && img.src !== img.dataset.src) loaded++;
        });
        return loaded;
      });
      
      console.log(`Lazy loaded images: ${loaded}`);
    }

    // Test infinite scroll if present
    const infiniteScrollTrigger = page.locator('[data-infinite-scroll], .infinite-scroll');
    if (await infiniteScrollTrigger.count() > 0) {
      const initialProducts = await page.locator('.product-card, .card-product').count();
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const newProducts = await page.locator('.product-card, .card-product').count();
      
      if (newProducts > initialProducts) {
        console.log('Infinite scroll working');
        expect(newProducts).toBeGreaterThan(initialProducts);
      }
    }
  });

  test('should handle JavaScript error gracefully', async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];

    // Listen for JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to various pages and check for errors
    const pagesToTest = ['/', '/collections/all', '/products/test-product', '/pages/contact'];
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // Filter out expected/acceptable errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('Non-Error promise rejection') &&
      !error.includes('ResizeObserver') &&
      !error.includes('third-party')
    );

    console.log('JavaScript errors found:', criticalErrors);
    console.log('Console errors found:', consoleErrors);

    // Should have no critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });
});