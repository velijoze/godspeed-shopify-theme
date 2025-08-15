import { test, expect } from '@playwright/test';

test.describe('Ajax Cart Functionality', () => {
  const testProduct = '/products/test-product';
  
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/cart/clear');
    await page.waitForLoadState('networkidle');
  });

  test('should initialize ajaxify cart with correct settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if ajaxifyShopify is loaded and initialized
    const ajaxifyLoaded = await page.evaluate(() => {
      return typeof window.ajaxifyShopify !== 'undefined';
    });
    
    expect(ajaxifyLoaded).toBe(true);

    // Check if Shopify object is available with required methods
    const shopifyMethods = await page.evaluate(() => {
      return {
        addItem: typeof Shopify.addItem === 'function',
        getCart: typeof Shopify.getCart === 'function',
        changeItem: typeof Shopify.changeItem === 'function',
        formatMoney: typeof Shopify.formatMoney === 'function'
      };
    });

    expect(shopifyMethods.addItem).toBe(true);
    expect(shopifyMethods.getCart).toBe(true);
    expect(shopifyMethods.changeItem).toBe(true);
    expect(shopifyMethods.formatMoney).toBe(true);
  });

  test('should add product to cart via Ajax', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Find the product form
    const productForm = page.locator('form[action*="/cart/add"]').first();
    await expect(productForm).toBeVisible();

    // Get initial cart count
    const initialCartCount = await page.evaluate(() => {
      const cartCountElement = document.querySelector('[data-cart-count]');
      return cartCountElement ? parseInt(cartCountElement.textContent || '0') : 0;
    });

    // Add to cart
    const addToCartButton = productForm.locator('button[type="submit"], input[type="submit"]').first();
    await addToCartButton.click();

    // Wait for Ajax request to complete
    await page.waitForTimeout(2000);

    // Check if cart count increased
    const newCartCount = await page.evaluate(() => {
      const cartCountElement = document.querySelector('[data-cart-count]');
      return cartCountElement ? parseInt(cartCountElement.textContent || '0') : 0;
    });

    expect(newCartCount).toBeGreaterThan(initialCartCount);
  });

  test('should display cart drawer when enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if drawer method is set and drawer elements exist
    const drawerExists = await page.evaluate(() => {
      return document.querySelector('#AjaxifyDrawer') !== null;
    });

    if (drawerExists) {
      // Try to open cart drawer
      const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
      
      if (await cartToggle.isVisible()) {
        await cartToggle.click();
        await page.waitForTimeout(500);

        // Check if drawer is visible
        const drawer = page.locator('#AjaxifyDrawer');
        await expect(drawer).toHaveClass(/is-visible/);

        // Check for close button
        const closeButton = page.locator('.ajaxcart__close');
        await expect(closeButton).toBeVisible();

        // Close drawer
        await closeButton.click();
        await page.waitForTimeout(500);

        // Verify drawer is hidden
        await expect(drawer).not.toHaveClass(/is-visible/);
      }
    }
  });

  test('should display cart modal when modal method is enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if modal method is set and modal elements exist
    const modalExists = await page.evaluate(() => {
      return document.querySelector('#AjaxifyModal') !== null;
    });

    if (modalExists) {
      // Try to open cart modal
      const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
      
      if (await cartToggle.isVisible()) {
        await cartToggle.click();
        await page.waitForTimeout(500);

        // Check if modal is visible
        const modal = page.locator('#AjaxifyModal');
        await expect(modal).toHaveClass(/is-visible/);

        // Check for modal overlay
        const overlay = page.locator('.ajaxcart__overlay');
        await expect(overlay).toBeVisible();

        // Close modal by clicking overlay
        await overlay.click();
        await page.waitForTimeout(500);

        // Verify modal is hidden
        await expect(modal).not.toHaveClass(/is-visible/);
      }
    }
  });

  test('should handle flip cart method', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Check if flip elements exist
    const flipContainer = page.locator('.flip');
    const flipExists = await flipContainer.count() > 0;

    if (flipExists) {
      // Check for flip front (add to cart button)
      const flipFront = page.locator('.flip__front');
      await expect(flipFront).toBeVisible();

      // Add product to cart
      await flipFront.click();
      await page.waitForTimeout(1000);

      // Check if flip animation occurred
      const isFlipped = await flipContainer.evaluate(el => el.classList.contains('is-flipped'));
      expect(isFlipped).toBe(true);

      // Check for flip back (checkout button)
      const flipBack = page.locator('.flip__back');
      await expect(flipBack).toBeVisible();

      // Check for view cart button
      const viewCartButton = page.locator('.flip__cart');
      if (await viewCartButton.isVisible()) {
        await viewCartButton.click();
        await page.waitForTimeout(500);

        // Should open drawer/modal
        const drawerOrModal = page.locator('#AjaxifyDrawer, #AjaxifyModal');
        await expect(drawerOrModal).toHaveClass(/is-visible/);
      }
    }
  });

  test('should update cart quantities via Ajax', async ({ page }) => {
    // First add a product to cart
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');
    
    const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
    await addToCartButton.click();
    await page.waitForTimeout(2000);

    // Open cart
    const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
    if (await cartToggle.isVisible()) {
      await cartToggle.click();
      await page.waitForTimeout(500);

      // Look for quantity controls
      const qtyPlus = page.locator('.ajaxcart__qty--plus').first();
      const qtyMinus = page.locator('.ajaxcart__qty--minus').first();
      const qtyInput = page.locator('.ajaxcart__qty-num').first();

      if (await qtyPlus.isVisible() && await qtyInput.isVisible()) {
        // Get initial quantity
        const initialQty = await qtyInput.inputValue();
        
        // Increase quantity
        await qtyPlus.click();
        await page.waitForTimeout(1000);

        // Check if quantity increased
        const newQty = await qtyInput.inputValue();
        expect(parseInt(newQty)).toBeGreaterThan(parseInt(initialQty));

        // Test decrease quantity
        if (await qtyMinus.isVisible()) {
          await qtyMinus.click();
          await page.waitForTimeout(1000);

          const finalQty = await qtyInput.inputValue();
          expect(parseInt(finalQty)).toBeLessThan(parseInt(newQty));
        }
      }
    }
  });

  test('should remove items from cart via Ajax', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');
    
    const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
    await addToCartButton.click();
    await page.waitForTimeout(2000);

    // Open cart
    const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
    if (await cartToggle.isVisible()) {
      await cartToggle.click();
      await page.waitForTimeout(500);

      // Look for remove button
      const removeButton = page.locator('.ajaxcart__remove').first();
      
      if (await removeButton.isVisible()) {
        // Get initial item count
        const initialItems = await page.locator('.cart__row, .ajaxcart__row').count();
        
        // Remove item
        await removeButton.click();
        await page.waitForTimeout(2000);

        // Check if item was removed
        const finalItems = await page.locator('.cart__row, .ajaxcart__row').count();
        expect(finalItems).toBeLessThan(initialItems);
      }
    }
  });

  test('should handle cart note updates', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');
    
    const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
    await addToCartButton.click();
    await page.waitForTimeout(2000);

    // Open cart
    const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
    if (await cartToggle.isVisible()) {
      await cartToggle.click();
      await page.waitForTimeout(500);

      // Look for cart note textarea
      const noteTextarea = page.locator('textarea[name="note"]');
      
      if (await noteTextarea.isVisible()) {
        const testNote = 'Test cart note from Playwright';
        
        // Add note
        await noteTextarea.fill(testNote);
        await noteTextarea.blur(); // Trigger change event
        await page.waitForTimeout(1000);

        // Verify note was saved (check if it persists on reload)
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Re-open cart and check note
        await cartToggle.click();
        await page.waitForTimeout(500);
        
        const savedNote = await page.locator('textarea[name="note"]').inputValue();
        expect(savedNote).toBe(testNote);
      }
    }
  });

  test('should handle keyboard navigation (ESC to close)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open cart
    const cartToggle = page.locator('[data-cart-toggle], .cart-toggle, .header__cart').first();
    if (await cartToggle.isVisible()) {
      await cartToggle.click();
      await page.waitForTimeout(500);

      // Check if cart is open
      const cartContainer = page.locator('#AjaxifyDrawer, #AjaxifyModal');
      const isOpen = await cartContainer.evaluate(el => el.classList.contains('is-visible'));
      
      if (isOpen) {
        // Press ESC key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Verify cart is closed
        const isClosed = await cartContainer.evaluate(el => !el.classList.contains('is-visible'));
        expect(isClosed).toBe(true);
      }
    }
  });

  test('should format money correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test Shopify.formatMoney function
    const formattedPrice = await page.evaluate(() => {
      if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
        return {
          dollars: Shopify.formatMoney(2999, '${{amount}}'),
          chf: Shopify.formatMoney(2999, 'CHF {{amount}}'),
          noDecimals: Shopify.formatMoney(2999, '${{amount_no_decimals}}'),
          commaFormat: Shopify.formatMoney(2999, '{{amount_with_comma_separator}}')
        };
      }
      return null;
    });

    if (formattedPrice) {
      expect(formattedPrice.dollars).toBe('$29.99');
      expect(formattedPrice.chf).toBe('CHF 29.99');
      expect(formattedPrice.noDecimals).toBe('$30');
      expect(formattedPrice.commaFormat).toBe('29,99');
    }
  });

  test('should handle cart errors gracefully', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.waitForLoadState('networkidle');

    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Try to add an invalid quantity (if variant supports it)
    const qtyInput = page.locator('input[name="quantity"]').first();
    if (await qtyInput.isVisible()) {
      await qtyInput.fill('999999'); // Unrealistic quantity
      
      const addToCartButton = page.locator('form[action*="/cart/add"] button[type="submit"]').first();
      await addToCartButton.click();
      await page.waitForTimeout(2000);

      // Check for error message display
      const errorMessage = page.locator('.qty-error, .error, .errors');
      const hasError = await errorMessage.count() > 0;

      if (hasError) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }

    // Ensure no JavaScript errors occurred
    expect(errors.filter(error => error.includes('Uncaught'))).toHaveLength(0);
  });
});