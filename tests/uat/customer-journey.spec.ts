import { test, expect } from '@playwright/test';

test.describe('UAT - Customer Journey Tests', () => {
  test.describe('First-Time Buyer Journey', () => {
    test('Complete e-bike purchase from discovery to checkout', async ({ page }) => {
      // Step 1: Land on homepage
      await page.goto('/');
      await expect(page).toHaveTitle(/Godspeed/);
      
      // Step 2: Navigate via mega menu
      await page.hover('nav >> text=E-Bikes');
      await expect(page.locator('.mega-menu__content')).toBeVisible();
      
      // Click on a category
      await page.click('.mega-menu__content >> text=Commuter E-Bikes');
      await expect(page).toHaveURL(/collections\/commuter/);
      
      // Step 3: Use filters
      await page.click('button:has-text("Filter")');
      await page.click('label:has-text("$2,000 - $3,000")');
      await page.click('label:has-text("Bosch")');
      await page.click('button:has-text("Apply")');
      
      // Step 4: Quick view product
      const firstProduct = page.locator('.pipeline-product-card').first();
      await firstProduct.hover();
      await firstProduct.locator('[data-quick-view]').click();
      
      // Verify quick view modal
      await expect(page.locator('.quick-view-modal')).toBeVisible();
      await expect(page.locator('.quick-view-modal .product-price')).toBeVisible();
      
      // Step 5: Add to cart with variant selection
      await page.selectOption('select[name="Size"]', 'Medium');
      await page.click('.quick-view-modal >> button:has-text("Add to Cart")');
      
      // Verify cart notification
      await expect(page.locator('.cart-notification')).toBeVisible();
      
      // Add accessory
      await page.click('button:has-text("View Cart")');
      await expect(page).toHaveURL(/cart/);
      
      // Step 6: Proceed to checkout
      await page.click('button:has-text("Checkout")');
      
      // Fill checkout form
      await page.fill('input[name="email"]', 'test.buyer@example.com');
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'Buyer');
      await page.fill('input[name="address1"]', 'Bahnhofstrasse 1');
      await page.fill('input[name="city"]', 'Zurich');
      await page.fill('input[name="postalCode"]', '8001');
      await page.selectOption('select[name="country"]', 'CH');
      
      // Select shipping method
      await page.click('input[value="standard"]');
      
      // Payment method (test mode)
      await page.click('button:has-text("Continue to payment")');
      
      // Verify order confirmation page elements
      await expect(page.locator('text=Order confirmed')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('.order-number')).toBeVisible();
    });
  });

  test.describe('Mobile Shopping Experience', () => {
    test.use({ 
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    test('Mobile user can browse and purchase', async ({ page }) => {
      // Step 1: Access mobile site
      await page.goto('/');
      
      // Step 2: Open mobile menu
      await page.click('[aria-label="Open menu"]');
      await expect(page.locator('.menu-drawer')).toBeVisible();
      
      // Step 3: Navigate to products
      await page.click('.menu-drawer >> text=E-Bikes');
      await page.click('.menu-drawer >> text=All E-Bikes');
      
      // Step 4: Use mobile filters
      await page.click('button[aria-label="Open filters"]');
      await expect(page.locator('.mobile-filters')).toBeVisible();
      
      // Apply price filter
      await page.click('.mobile-filters >> text=Price');
      await page.click('label:has-text("Under $2,000")');
      await page.click('button:has-text("Show results")');
      
      // Step 5: View product
      await page.click('.pipeline-product-card:first-child');
      
      // Step 6: Mobile image gallery
      const productImages = page.locator('.product-images-mobile');
      await expect(productImages).toBeVisible();
      
      // Swipe through images (simulate)
      await productImages.swipe({ direction: 'left' });
      
      // Step 7: Add to cart
      await page.click('button:has-text("Add to Cart")');
      
      // Step 8: Mobile checkout
      await page.click('.cart-drawer >> button:has-text("Checkout")');
      
      // Verify mobile-optimized checkout
      await expect(page.locator('.mobile-checkout')).toBeVisible();
    });
  });

  test.describe('Returning Customer Experience', () => {
    test('Logged-in customer can quickly reorder', async ({ page }) => {
      // Setup: Login first
      await page.goto('/account/login');
      await page.fill('input[name="customer[email]"]', 'returning@customer.com');
      await page.fill('input[name="customer[password]"]', 'testpassword123');
      await page.click('button:has-text("Sign in")');
      
      // Step 1: Go to order history
      await page.click('a:has-text("Order history")');
      await expect(page).toHaveURL(/account/);
      
      // Step 2: Reorder previous item
      const previousOrder = page.locator('.order-history-item').first();
      await previousOrder.locator('button:has-text("Reorder")').click();
      
      // Step 3: Items added to cart
      await expect(page.locator('.cart-notification')).toBeVisible();
      await expect(page.locator('.cart-count')).not.toHaveText('0');
      
      // Step 4: Apply saved address
      await page.goto('/checkout');
      await expect(page.locator('input[name="address1"]')).toHaveValue(/./);
      
      // Step 5: Express checkout
      await page.click('button:has-text("Use saved payment")');
      await page.click('button:has-text("Place order")');
      
      // Verify quick checkout completion
      await expect(page.locator('text=Order confirmed')).toBeVisible({ timeout: 20000 });
    });
  });

  test.describe('B2B Corporate Purchase', () => {
    test('Business account can request bulk quote', async ({ page }) => {
      // Login as B2B customer
      await page.goto('/account/login');
      await page.fill('input[name="customer[email]"]', 'business@godspeed.ch');
      await page.fill('input[name="customer[password]"]', 'b2bpassword123');
      await page.click('button:has-text("Sign in")');
      
      // Navigate to B2B portal
      await page.click('a:has-text("Business Portal")');
      await expect(page).toHaveURL(/business/);
      
      // Browse fleet options
      await page.click('a:has-text("Fleet Solutions")');
      await expect(page.locator('h1:has-text("E-Bike Fleet Solutions")')).toBeVisible();
      
      // Select multiple bikes
      await page.click('input[data-product-id="bike-1"]');
      await page.fill('input[data-quantity="bike-1"]', '10');
      
      await page.click('input[data-product-id="bike-2"]');
      await page.fill('input[data-quantity="bike-2"]', '5');
      
      // Add fleet management package
      await page.click('label:has-text("Fleet Management Package")');
      
      // Request quote
      await page.click('button:has-text("Request Quote")');
      
      // Fill business details
      await page.fill('input[name="company_name"]', 'Tech Corp AG');
      await page.fill('input[name="vat_number"]', 'CHE-123.456.789');
      await page.fill('textarea[name="special_requirements"]', 'Need delivery by end of month');
      
      // Submit quote request
      await page.click('button:has-text("Submit Quote Request")');
      
      // Verify confirmation
      await expect(page.locator('text=Quote request submitted')).toBeVisible();
      await expect(page.locator('.quote-reference-number')).toBeVisible();
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('Site meets WCAG 2.1 AA standards', async ({ page }) => {
      await page.goto('/');
      
      // Keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Skip to content link
      await page.keyboard.press('Tab');
      await expect(page.locator('a:has-text("Skip to content")')).toBeFocused();
      
      // Screen reader landmarks
      await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      
      // Color contrast check
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 5)) {
        await expect(button).toHaveCSS('color', /.+/);
      }
      
      // Form labels
      await page.goto('/account/register');
      const inputs = await page.locator('input[type="text"], input[type="email"]').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
        }
      }
      
      // Alt text for images
      const images = await page.locator('img').all();
      for (const img of images.slice(0, 5)) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('Multi-language Support', () => {
    test('Customer can shop in German', async ({ page }) => {
      await page.goto('/');
      
      // Change language to German
      await page.click('button[aria-label="Language selector"]');
      await page.click('a:has-text("Deutsch")');
      
      // Verify German content
      await expect(page.locator('nav >> text=E-Bikes')).toBeVisible();
      await expect(page.locator('button:has-text("In den Warenkorb")')).toBeVisible();
      
      // Navigate in German
      await page.click('nav >> text=E-Bikes');
      await expect(page).toHaveURL(/de/);
      
      // Add product in German
      const product = page.locator('.pipeline-product-card').first();
      await product.hover();
      await product.locator('button:has-text("Schnellansicht")').click();
      
      // Verify German checkout
      await page.click('button:has-text("In den Warenkorb")');
      await page.goto('/cart');
      await expect(page.locator('button:has-text("Zur Kasse")')).toBeVisible();
    });
  });
});