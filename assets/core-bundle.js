/*
 * Core JavaScript Bundle - Essential functionality
 * Combines constants.js, pubsub.js, and critical global.js functions
 * Optimized for performance and reduced HTTP requests
 */

// Constants (from constants.js)
const ON_CHANGE_DEBOUNCE_TIMER = 300;

const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  optionValueSelectionChange: 'option-value-selection-change',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

// PubSub System (from pubsub.js)
class PubSub {
  constructor() {
    this.subscribers = {};
  }

  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  publish(event, data) {
    if (!this.subscribers[event]) return;
    this.subscribers[event].forEach(callback => callback(data));
  }
}

// Global PubSub instance
window.PubSub = new PubSub();

// Essential Global Functions (critical parts from global.js)
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

class SectionId {
  static #separator = '__';

  static parseId(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[0];
  }

  static parseSectionName(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[1];
  }

  static getIdForSection(sectionId, sectionName) {
    return `${sectionId}${SectionId.#separator}${sectionName}`;
  }
}

// HTML Update Utility (essential for dynamic content)
class HTMLUpdateUtility {
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    // Re-execute scripts
    element.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => 
        newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // Dedupe IDs
    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`);
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    setTimeout(() => oldNode.remove(), 500);

    postProcessCallbacks?.forEach((callback) => callback(newNode));
  }
}

// Essential Cart Functions
class CartUtility {
  static getCart() {
    return fetch('/cart.js')
      .then(response => response.json())
      .catch(error => console.error('Error fetching cart:', error));
  }

  static addToCart(items) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    })
    .then(response => response.json())
    .then(data => {
      window.PubSub.publish(PUB_SUB_EVENTS.cartUpdate, data);
      return data;
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      window.PubSub.publish(PUB_SUB_EVENTS.cartError, error);
    });
  }

  static updateCart(updates) {
    return fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    })
    .then(response => response.json())
    .then(data => {
      window.PubSub.publish(PUB_SUB_EVENTS.cartUpdate, data);
      return data;
    });
  }
}

// Performance utilities
class PerformanceUtility {
  static preloadImage(src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Expose utilities globally
window.SectionId = SectionId;
window.HTMLUpdateUtility = HTMLUpdateUtility;
window.CartUtility = CartUtility;
window.PerformanceUtility = PerformanceUtility;
window.getFocusableElements = getFocusableElements;

// Initialize core functionality
function initializeCore() {
  console.log('Core bundle loaded successfully');
  
  // Dispatch custom event for other scripts to hook into
  window.dispatchEvent(new CustomEvent('core-bundle-ready', { 
    detail: { timestamp: Date.now() } 
  }));
}

// Ensure initialization happens regardless of DOM state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCore);
} else {
  // DOM already loaded, initialize immediately
  initializeCore();
}