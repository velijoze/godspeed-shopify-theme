/**
 * ARIA Menu States Manager
 * Manages accessible states for mega menus, modals, and interactive components
 */

class ARIAMenuManager {
  constructor() {
    this.openMenus = new Set();
    this.init();
  }

  init() {
    // Initialize mega menu ARIA states
    this.initMegaMenus();
    
    // Initialize modal ARIA states
    this.initModals();
    
    // Initialize drawer menu states
    this.initDrawerMenus();
    
    // Keyboard navigation support
    this.initKeyboardNavigation();
  }

  initMegaMenus() {
    const megaMenus = document.querySelectorAll('[data-mega-menu]');
    
    megaMenus.forEach(menu => {
      const trigger = menu.querySelector('[data-mega-menu-trigger]');
      const dropdown = menu.querySelector('[data-mega-menu-dropdown]');
      
      if (!trigger || !dropdown) return;
      
      // Set initial ARIA states
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      
      // Mouse events
      trigger.addEventListener('mouseenter', () => this.openMegaMenu(trigger, dropdown));
      menu.addEventListener('mouseleave', () => this.closeMegaMenu(trigger, dropdown));
      
      // Keyboard events
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMegaMenu(trigger, dropdown);
      });
      
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMegaMenu(trigger, dropdown);
        } else if (e.key === 'Escape') {
          this.closeMegaMenu(trigger, dropdown);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.openMegaMenu(trigger, dropdown);
          this.focusFirstMenuItem(dropdown);
        }
      });
    });
  }

  openMegaMenu(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.setAttribute('aria-hidden', 'false');
    dropdown.classList.add('mega-menu-dropdown--open');
    
    // Update arrow direction
    const arrow = trigger.querySelector('.mega-menu-arrow');
    if (arrow) arrow.textContent = '▲';
    
    this.openMenus.add(dropdown);
    
    // Announce to screen readers
    this.announceToScreenReader('Menü geöffnet');
  }

  closeMegaMenu(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
    dropdown.classList.remove('mega-menu-dropdown--open');
    
    // Update arrow direction
    const arrow = trigger.querySelector('.mega-menu-arrow');
    if (arrow) arrow.textContent = '▼';
    
    this.openMenus.delete(dropdown);
    
    // Return focus to trigger if needed
    if (document.activeElement !== trigger && dropdown.contains(document.activeElement)) {
      trigger.focus();
    }
  }

  toggleMegaMenu(trigger, dropdown) {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      this.closeMegaMenu(trigger, dropdown);
    } else {
      this.openMegaMenu(trigger, dropdown);
    }
  }

  focusFirstMenuItem(dropdown) {
    const firstMenuItem = dropdown.querySelector('[role="menuitem"]');
    if (firstMenuItem) {
      firstMenuItem.focus();
    }
  }

  initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(trigger => {
      const modalId = trigger.getAttribute('data-modal-trigger');
      const modal = document.getElementById(modalId);
      
      if (!modal) return;
      
      // Set initial ARIA states
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('role', 'dialog');
      
      // Ensure modal has a label
      if (!modal.getAttribute('aria-labelledby') && !modal.getAttribute('aria-label')) {
        const title = modal.querySelector('h1, h2, h3, h4, h5, h6, .modal-title');
        if (title) {
          const titleId = title.id || `modal-title-${Date.now()}`;
          title.id = titleId;
          modal.setAttribute('aria-labelledby', titleId);
        } else {
          modal.setAttribute('aria-label', 'Dialog');
        }
      }
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(modal, trigger);
      });
    });
    
    // Close modals with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  openModal(modal, trigger) {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('modal--open');
    
    // Store the trigger for focus return
    modal.setAttribute('data-focus-return', trigger.id || 'modal-trigger');
    
    // Focus management
    this.trapFocus(modal);
    
    // Focus first focusable element or modal itself
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      modal.focus();
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Dialog geöffnet');
  }

  closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('modal--open');
    
    // Return focus to trigger
    const triggerSelector = modal.getAttribute('data-focus-return');
    if (triggerSelector) {
      const trigger = document.getElementById(triggerSelector) || document.querySelector(`[data-modal-trigger="${modal.id}"]`);
      if (trigger) trigger.focus();
    }
    
    // Remove focus trap
    this.removeFocusTrap(modal);
  }

  closeAllModals() {
    const openModals = document.querySelectorAll('.modal--open');
    openModals.forEach(modal => this.closeModal(modal));
  }

  initDrawerMenus() {
    const drawerTriggers = document.querySelectorAll('[data-drawer-trigger]');
    
    drawerTriggers.forEach(trigger => {
      const drawerId = trigger.getAttribute('data-drawer-trigger');
      const drawer = document.getElementById(drawerId);
      
      if (!drawer) return;
      
      // Set initial ARIA states
      drawer.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', drawerId);
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDrawer(trigger, drawer);
      });
    });
  }

  toggleDrawer(trigger, drawer) {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.classList.remove('drawer--open');
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.classList.add('drawer--open');
      
      // Focus first interactive element
      const firstFocusable = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }
  }

  initKeyboardNavigation() {
    // Arrow key navigation for menu items
    document.addEventListener('keydown', (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      const activeElement = document.activeElement;
      if (!activeElement.matches('[role="menuitem"]')) return;
      
      e.preventDefault();
      
      const menu = activeElement.closest('[role="menu"]');
      if (!menu) return;
      
      const menuItems = menu.querySelectorAll('[role="menuitem"]');
      const currentIndex = Array.from(menuItems).indexOf(activeElement);
      
      let nextIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % menuItems.length;
      } else {
        nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
      }
      
      menuItems[nextIndex].focus();
    });
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const trapFocusHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', trapFocusHandler);
    container.setAttribute('data-focus-trap', 'true');
  }

  removeFocusTrap(container) {
    container.removeAttribute('data-focus-trap');
    // Remove all keydown listeners - this is simplified but works for our use case
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Initialize ARIA menu management
document.addEventListener('DOMContentLoaded', () => {
  new ARIAMenuManager();
  console.log('ARIA menu states initialized');
});