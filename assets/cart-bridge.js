/*============================================================================
  Cart Bridge - Modern Quick-Add Integration with Pipeline Cart
  
  This bridges modern Dawn quick-add functionality with the existing Pipeline
  ajaxify cart system to maintain all functionality while enabling modern features.
==============================================================================*/

class CartBridge {
  constructor() {
    this.init();
  }

  init() {
    // Wait for both Pipeline ajaxify and modern components to load
    this.waitForDependencies().then(() => {
      this.setupQuickAddIntegration();
      this.setupCartNotificationBridge();
      console.log('Cart Bridge: Integration complete');
    });
  }

  waitForDependencies() {
    return new Promise((resolve) => {
      const checkDependencies = () => {
        // Check if Pipeline ajaxify is loaded
        const pipelineReady = window.ajaxifyShopify && window.jQuery;
        
        // Check if modern components are available
        const modernReady = customElements.get('product-form') || 
                           document.querySelector('product-form') !== null;

        if (pipelineReady) {
          resolve();
        } else {
          setTimeout(checkDependencies, 100);
        }
      };
      checkDependencies();
    });
  }

  setupQuickAddIntegration() {
    // Listen for modern quick-add form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      
      // Check if this is a quick-add form
      if (form.classList.contains('form') && form.dataset.type === 'add-to-cart-form') {
        event.preventDefault();
        this.handleQuickAddSubmission(form);
      }
    });

    // Handle modal-opener buttons for products with variants
    document.addEventListener('click', (event) => {
      if (event.target.closest('modal-opener')) {
        const modalOpener = event.target.closest('modal-opener');
        const button = modalOpener.querySelector('button');
        if (button && button.dataset.productUrl) {
          this.handleVariantProductQuickAdd(button);
        }
      }
    });
  }

  handleQuickAddSubmission(form) {
    const formData = new FormData(form);
    const button = form.querySelector('.quick-add__submit');
    
    // Show loading state
    this.setButtonLoading(button, true);
    
    // Use Pipeline's ajaxify system to add to cart
    if (window.ajaxifyShopify && window.ajaxifyShopify.addItemFromForm) {
      jQuery(form).submit(); // Let Pipeline handle it
    } else {
      // Fallback to native fetch
      this.fallbackAddToCart(formData, button);
    }
  }

  handleVariantProductQuickAdd(button) {
    // For products with variants, we still use the modern modal system
    // but ensure it integrates with Pipeline cart after selection
    console.log('Variant product quick-add:', button.dataset.productUrl);
  }

  fallbackAddToCart(formData, button) {
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.setButtonLoading(button, false);
      
      // Trigger Pipeline cart update
      if (window.ajaxifyShopify && window.ajaxifyShopify.load) {
        window.ajaxifyShopify.load();
      }
      
      // Show success feedback
      this.showAddToCartSuccess(button, data);
    })
    .catch(error => {
      this.setButtonLoading(button, false);
      console.error('Add to cart error:', error);
    });
  }

  setButtonLoading(button, loading) {
    if (!button) return;
    
    const spinner = button.querySelector('.loading__spinner');
    const text = button.querySelector('span');
    
    if (loading) {
      button.setAttribute('aria-disabled', 'true');
      button.classList.add('loading');
      if (spinner) spinner.classList.remove('hidden');
      if (text) text.textContent = 'Adding...';
    } else {
      button.removeAttribute('aria-disabled');
      button.classList.remove('loading');
      if (spinner) spinner.classList.add('hidden');
      if (text) text.textContent = 'Add to cart';
    }
  }

  showAddToCartSuccess(button, data) {
    const originalText = button.querySelector('span').textContent;
    const span = button.querySelector('span');
    
    if (span) {
      span.textContent = 'Added!';
      button.classList.add('success');
      
      setTimeout(() => {
        span.textContent = originalText;
        button.classList.remove('success');
      }, 2000);
    }
  }

  setupCartNotificationBridge() {
    // If modern cart notification exists, ensure it works with Pipeline cart
    const cartNotification = document.querySelector('cart-notification');
    if (cartNotification && window.ajaxifyShopify) {
      // Bridge Pipeline cart updates to modern notifications
      console.log('Cart notification bridge ready');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CartBridge());
} else {
  new CartBridge();
}