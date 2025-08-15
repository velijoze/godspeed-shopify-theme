import { test, expect } from '@playwright/test';

test.describe('Pipeline Sections Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render pipeline-collection-advanced section', async ({ page }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Check for advanced collection features
    const advancedCollection = page.locator('.pipeline-collection-advanced, [data-section-type="pipeline-collection-advanced"]');
    if (await advancedCollection.count() > 0) {
      console.log('Pipeline advanced collection section found');
      
      // Check for enhanced filtering
      const filterOptions = page.locator('.filter-group, .facet-filters, [data-filter]');
      const filterCount = await filterOptions.count();
      console.log(`Filter options found: ${filterCount}`);

      // Check for sorting options
      const sortSelector = page.locator('.sort-selector, [data-sort], select[name*="sort"]');
      if (await sortSelector.count() > 0) {
        const sortOptions = await sortSelector.first().locator('option').count();
        console.log(`Sort options available: ${sortOptions}`);
        expect(sortOptions).toBeGreaterThan(1);
      }

      // Check for view toggle (grid/list)
      const viewToggle = page.locator('.view-toggle, [data-view-toggle]');
      if (await viewToggle.count() > 0) {
        console.log('View toggle found');
        await viewToggle.first().click();
        await page.waitForTimeout(500);
        
        // Check if view changed
        const gridView = page.locator('.grid-view, .collection-grid');
        const listView = page.locator('.list-view, .collection-list');
        const hasViewChange = await gridView.count() > 0 || await listView.count() > 0;
        expect(hasViewChange).toBe(true);
      }

      // Check for infinite scroll or pagination
      const loadMoreButton = page.locator('.load-more, [data-load-more]');
      const pagination = page.locator('.pagination, .paginate');
      const hasLoadMoreOrPagination = await loadMoreButton.count() > 0 || await pagination.count() > 0;
      
      if (hasLoadMoreOrPagination) {
        console.log('Load more or pagination functionality found');
      }
    }
  });

  test('should render pipeline-product-advanced section', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Check for advanced product features
    const advancedProduct = page.locator('.pipeline-product-advanced, [data-section-type="pipeline-product-advanced"]');
    if (await advancedProduct.count() > 0) {
      console.log('Pipeline advanced product section found');

      // Check for product tabs
      const productTabs = page.locator('.product-tabs, [data-product-tabs]');
      if (await productTabs.count() > 0) {
        const tabs = await productTabs.locator('.tab, [data-tab]').count();
        console.log(`Product tabs found: ${tabs}`);
        
        if (tabs > 0) {
          // Click on different tabs
          const firstTab = productTabs.locator('.tab, [data-tab]').first();
          await firstTab.click();
          await page.waitForTimeout(500);
          
          // Check if tab content is visible
          const tabContent = page.locator('.tab-content, [data-tab-content]');
          await expect(tabContent.first()).toBeVisible();
        }
      }

      // Check for size guide integration
      const sizeGuide = page.locator('.size-guide-btn, [data-size-guide]');
      if (await sizeGuide.count() > 0) {
        console.log('Size guide integration found');
        await sizeGuide.first().click();
        await page.waitForTimeout(500);
        
        // Check if size guide modal/section opened
        const sizeGuideModal = page.locator('.size-guide-modal, .size-guide-section');
        if (await sizeGuideModal.count() > 0) {
          await expect(sizeGuideModal.first()).toBeVisible();
        }
      }

      // Check for wishlist integration
      const wishlistBtn = page.locator('.wishlist-btn, [data-wishlist]');
      if (await wishlistBtn.count() > 0) {
        console.log('Wishlist integration found');
        
        const initialState = await wishlistBtn.first().getAttribute('data-added') || 'false';
        await wishlistBtn.first().click();
        await page.waitForTimeout(500);
        
        const newState = await wishlistBtn.first().getAttribute('data-added') || 'false';
        expect(newState).not.toBe(initialState);
      }

      // Check for comparison integration
      const compareBtn = page.locator('.compare-btn, [data-compare]');
      if (await compareBtn.count() > 0) {
        console.log('Product comparison integration found');
        await compareBtn.first().click();
        await page.waitForTimeout(500);
        
        // Should show some feedback (notification, modal, etc.)
        const feedback = page.locator('.notification, .modal, .toast, [data-compare-feedback]');
        if (await feedback.count() > 0) {
          await expect(feedback.first()).toBeVisible();
        }
      }
    }
  });

  test('should render pipeline-index-slideshow section', async ({ page }) => {
    // Check for enhanced slideshow on homepage
    const slideshow = page.locator('.pipeline-slideshow, [data-section-type="pipeline-index-slideshow"]');
    if (await slideshow.count() > 0) {
      console.log('Pipeline slideshow section found');

      // Check for slides
      const slides = await slideshow.locator('.slide, [data-slide]').count();
      console.log(`Slideshow slides found: ${slides}`);
      expect(slides).toBeGreaterThan(0);

      // Check for navigation controls
      const prevButton = slideshow.locator('.prev, .slide-prev, [data-prev]');
      const nextButton = slideshow.locator('.next, .slide-next, [data-next]');
      
      if (await prevButton.count() > 0 && await nextButton.count() > 0) {
        console.log('Slideshow navigation controls found');
        
        // Test navigation
        await nextButton.first().click();
        await page.waitForTimeout(1000);
        
        // Check if slide changed (look for active slide)
        const activeSlide = slideshow.locator('.slide.active, [data-slide].active');
        await expect(activeSlide).toBeVisible();
      }

      // Check for auto-play functionality
      const isAutoPlay = await slideshow.evaluate(el => {
        return el.hasAttribute('data-autoplay') || el.classList.contains('autoplay');
      });
      
      if (isAutoPlay) {
        console.log('Slideshow auto-play enabled');
        
        // Wait and check if slide changes automatically
        const initialActiveSlide = await slideshow.locator('.slide.active, [data-slide].active').first().getAttribute('data-slide-index') || '0';
        await page.waitForTimeout(5000);
        const newActiveSlide = await slideshow.locator('.slide.active, [data-slide].active').first().getAttribute('data-slide-index') || '0';
        
        // Note: This might not always change depending on timing
        console.log(`Auto-play check: ${initialActiveSlide} -> ${newActiveSlide}`);
      }

      // Check for responsive behavior
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      const mobileSlideshow = slideshow.first();
      await expect(mobileSlideshow).toBeVisible();
      console.log('Slideshow responsive behavior verified');
    }
  });

  test('should render pipeline-index-collection-grid section', async ({ page }) => {
    // Check for enhanced collection grid
    const collectionGrid = page.locator('.pipeline-collection-grid, [data-section-type="pipeline-index-collection-grid"]');
    if (await collectionGrid.count() > 0) {
      console.log('Pipeline collection grid section found');

      // Check for collection cards
      const collectionCards = await collectionGrid.locator('.collection-card, [data-collection]').count();
      console.log(`Collection cards found: ${collectionCards}`);
      expect(collectionCards).toBeGreaterThan(0);

      // Test hover effects
      const firstCard = collectionGrid.locator('.collection-card, [data-collection]').first();
      await firstCard.hover();
      await page.waitForTimeout(500);

      // Check for enhanced card features
      const cardFeatures = {
        hasImage: await firstCard.locator('img').count() > 0,
        hasTitle: await firstCard.locator('.title, h2, h3').count() > 0,
        hasDescription: await firstCard.locator('.description, p').count() > 0,
        hasButton: await firstCard.locator('.btn, button, a').count() > 0
      };

      console.log('Collection card features:', cardFeatures);
      expect(cardFeatures.hasImage).toBe(true);
      expect(cardFeatures.hasTitle).toBe(true);

      // Test card click functionality
      await firstCard.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to collection page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/collections/');
      console.log('Collection card navigation working');
    }
  });

  test('should render pipeline-index-product section', async ({ page }) => {
    // Check for featured product section
    const featuredProduct = page.locator('.pipeline-featured-product, [data-section-type="pipeline-index-product"]');
    if (await featuredProduct.count() > 0) {
      console.log('Pipeline featured product section found');

      // Check for product information
      const productInfo = {
        hasTitle: await featuredProduct.locator('.product-title, h2, h3').count() > 0,
        hasPrice: await featuredProduct.locator('.price, .product-price').count() > 0,
        hasImage: await featuredProduct.locator('img').count() > 0,
        hasAddToCart: await featuredProduct.locator('form[action*="/cart/add"], .add-to-cart').count() > 0
      };

      console.log('Featured product info:', productInfo);
      expect(productInfo.hasTitle).toBe(true);
      expect(productInfo.hasPrice).toBe(true);

      // Test add to cart functionality if available
      if (productInfo.hasAddToCart) {
        const addToCartBtn = featuredProduct.locator('button[type="submit"], .add-to-cart').first();
        if (await addToCartBtn.isVisible()) {
          await addToCartBtn.click();
          await page.waitForTimeout(2000);
          
          // Check for cart update or modal
          const cartUpdate = page.locator('.cart-notification, .modal, [data-cart-added]');
          if (await cartUpdate.count() > 0) {
            console.log('Featured product add to cart working');
          }
        }
      }

      // Check for quick view functionality
      const quickViewBtn = featuredProduct.locator('.quick-view, [data-quick-view]');
      if (await quickViewBtn.count() > 0) {
        await quickViewBtn.first().click();
        await page.waitForTimeout(500);
        
        const quickViewModal = page.locator('.quick-view-modal, [data-quick-view-modal]');
        if (await quickViewModal.count() > 0) {
          await expect(quickViewModal.first()).toBeVisible();
          console.log('Quick view functionality working');
        }
      }
    }
  });

  test('should render pipeline-index-video section', async ({ page }) => {
    // Check for video section
    const videoSection = page.locator('.pipeline-video, [data-section-type="pipeline-index-video"]');
    if (await videoSection.count() > 0) {
      console.log('Pipeline video section found');

      // Check for video element
      const video = videoSection.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
      const hasVideo = await video.count() > 0;
      
      if (hasVideo) {
        console.log('Video element found');
        await expect(video.first()).toBeVisible();

        // Check for video controls
        const playButton = videoSection.locator('.play-btn, [data-play], .video-play');
        if (await playButton.count() > 0) {
          console.log('Video play button found');
          
          // Test play functionality (be careful with autoplay)
          await playButton.first().click();
          await page.waitForTimeout(1000);
          
          // Check if video started playing (look for playing class or controls)
          const isPlaying = await video.first().evaluate(el => {
            if (el.tagName === 'VIDEO') {
              return !el.paused;
            }
            return false; // For iframes, harder to detect
          });
          
          if (isPlaying) {
            console.log('Video playback started');
          }
        }

        // Check for video overlay/poster
        const videoOverlay = videoSection.locator('.video-overlay, .video-poster');
        if (await videoOverlay.count() > 0) {
          console.log('Video overlay/poster found');
        }
      }
    }
  });

  test('should render pipeline-index-instagram section', async ({ page }) => {
    // Check for Instagram feed section
    const instagramSection = page.locator('.pipeline-instagram, [data-section-type="pipeline-index-instagram"]');
    if (await instagramSection.count() > 0) {
      console.log('Pipeline Instagram section found');

      // Check for Instagram posts
      const instagramPosts = await instagramSection.locator('.instagram-post, [data-instagram-post]').count();
      console.log(`Instagram posts found: ${instagramPosts}`);

      if (instagramPosts > 0) {
        // Check post structure
        const firstPost = instagramSection.locator('.instagram-post, [data-instagram-post]').first();
        
        const postFeatures = {
          hasImage: await firstPost.locator('img').count() > 0,
          hasLink: await firstPost.locator('a').count() > 0,
          hasCaption: await firstPost.locator('.caption, .post-text').count() > 0
        };

        console.log('Instagram post features:', postFeatures);
        expect(postFeatures.hasImage).toBe(true);

        // Test post interaction
        if (postFeatures.hasLink) {
          // Note: Don't actually click Instagram links in tests
          const link = firstPost.locator('a').first();
          const href = await link.getAttribute('href');
          console.log('Instagram post link found:', href ? 'Yes' : 'No');
        }
      }

      // Check for Instagram feed loading
      const loadingIndicator = instagramSection.locator('.loading, .spinner, [data-loading]');
      if (await loadingIndicator.count() > 0) {
        console.log('Instagram feed loading indicator found');
        
        // Wait for loading to complete
        await page.waitForTimeout(3000);
        
        // Check if loading indicator disappeared
        const stillLoading = await loadingIndicator.first().isVisible();
        expect(stillLoading).toBe(false);
      }
    }
  });

  test('should handle section settings and customization', async ({ page }) => {
    // This test checks if sections respond to their settings
    // We'll check various section containers for customization classes

    const sections = [
      '.pipeline-slideshow',
      '.pipeline-collection-grid', 
      '.pipeline-featured-product',
      '.pipeline-video',
      '.pipeline-instagram'
    ];

    for (const sectionSelector of sections) {
      const section = page.locator(sectionSelector).first();
      if (await section.count() > 0) {
        console.log(`Checking customization for ${sectionSelector}`);

        // Check for common customization attributes
        const customization = {
          hasColorScheme: await section.evaluate(el => {
            return el.classList.toString().includes('color-') || 
                   el.style.backgroundColor || 
                   el.style.color;
          }),
          hasSpacing: await section.evaluate(el => {
            return el.classList.toString().includes('spacing-') ||
                   el.classList.toString().includes('padding-') ||
                   el.classList.toString().includes('margin-');
          }),
          hasAlignment: await section.evaluate(el => {
            return el.classList.toString().includes('align-') ||
                   el.classList.toString().includes('text-');
          })
        };

        console.log(`${sectionSelector} customization:`, customization);
      }
    }
  });

  test('should be responsive across device sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      // Check if sections are still visible and properly laid out
      const visibleSections = await page.evaluate(() => {
        const sections = document.querySelectorAll('[data-section-type*="pipeline-index"]');
        let visible = 0;
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            visible++;
          }
        });
        return visible;
      });

      console.log(`${viewport.name}: ${visibleSections} Pipeline sections visible`);
      expect(visibleSections).toBeGreaterThan(0);

      // Check for responsive navigation on mobile
      if (viewport.width <= 768) {
        const mobileMenu = page.locator('.mobile-menu, .header__menu-drawer, [data-mobile-menu]');
        if (await mobileMenu.count() > 0) {
          console.log(`${viewport.name}: Mobile menu available`);
        }
      }

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `tests/screenshots/pipeline-sections-${viewport.name.toLowerCase()}.png`,
        fullPage: false
      });
    }
  });

  test('should load sections without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through pages with Pipeline sections
    const pagesWithSections = [
      '/',
      '/collections/all',
      '/products/test-product'
    ];

    for (const pagePath of pagesWithSections) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Filter out acceptable errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('ResizeObserver') &&
      !error.includes('third-party') &&
      !error.includes('google') &&
      !error.includes('facebook')
    );

    console.log('JavaScript errors found:', criticalErrors);
    console.log('Console errors found:', consoleErrors);

    expect(criticalErrors).toHaveLength(0);
  });
});