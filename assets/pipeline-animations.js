/* PIPELINE-STYLE ANIMATIONS - ENHANCED INTERACTIONS */

class PipelineAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupParallaxElements();
    this.setupStaggeredAnimations();
    this.setupMicroInteractions();
  }

  // Scroll-triggered animations
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.dataset.animate;
          const delay = element.dataset.delay || 0;
          
          setTimeout(() => {
            element.classList.add('pipeline-animate-in');
            element.classList.add(`pipeline-${animationType}`);
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, this.observerOptions);

    animatedElements.forEach(el => {
      el.classList.add('pipeline-animate-ready');
      observer.observe(el);
    });
  }

  // Enhanced hover effects for product cards and buttons
  setupHoverEffects() {
    // Product cards
    const productCards = document.querySelectorAll('.card-product, .product-card');
    
    productCards.forEach(card => {
      card.addEventListener('mouseenter', () => this.animateCardHover(card, true));
      card.addEventListener('mouseleave', () => this.animateCardHover(card, false));
    });

    // Buttons
    const buttons = document.querySelectorAll('.button, .btn, [class*="button"]');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => this.animateButtonHover(button, true));
      button.addEventListener('mouseleave', () => this.animateButtonHover(button, false));
    });

    // Navigation links
    const navLinks = document.querySelectorAll('.header__nav-link, .nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => this.animateNavLink(link, true));
      link.addEventListener('mouseleave', () => this.animateNavLink(link, false));
    });
  }

  // Parallax scrolling effects
  setupParallaxElements() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rate = element.dataset.parallax || 0.5;
        const yPos = -(scrolled * rate);
        
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Staggered animations for groups of elements
  setupStaggeredAnimations() {
    const staggerGroups = document.querySelectorAll('[data-stagger]');
    
    staggerGroups.forEach(group => {
      const children = group.children;
      const staggerDelay = parseInt(group.dataset.stagger) || 100;
      
      Array.from(children).forEach((child, index) => {
        child.style.animationDelay = `${index * staggerDelay}ms`;
        child.classList.add('pipeline-stagger-item');
      });
    });
  }

  // Micro-interactions for enhanced UX
  setupMicroInteractions() {
    // Add to cart button ripple effect
    const addToCartButtons = document.querySelectorAll('[name="add"], .btn-add-to-cart');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.createRipple(e));
    });

    // Form input focus effects
    const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    
    formInputs.forEach(input => {
      input.addEventListener('focus', () => this.animateInputFocus(input, true));
      input.addEventListener('blur', () => this.animateInputFocus(input, false));
    });

    // Quantity selector animations
    const quantityButtons = document.querySelectorAll('.quantity__button');
    
    quantityButtons.forEach(button => {
      button.addEventListener('click', () => this.animateQuantityChange(button));
    });
  }

  // Individual animation methods
  animateCardHover(card, isEntering) {
    const image = card.querySelector('img');
    const content = card.querySelector('.card__content, .product-card__info');
    
    if (isEntering) {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      
      if (image) {
        image.style.transform = 'scale(1.05)';
      }
      
      if (content) {
        content.style.transform = 'translateY(-4px)';
      }
    } else {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
      
      if (image) {
        image.style.transform = 'scale(1)';
      }
      
      if (content) {
        content.style.transform = 'translateY(0)';
      }
    }
  }

  animateButtonHover(button, isEntering) {
    if (isEntering) {
      button.style.transform = 'translateY(-2px) scale(1.02)';
      button.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    } else {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = 'none';
    }
  }

  animateNavLink(link, isEntering) {
    const underline = link.querySelector('::after') || this.createUnderline(link);
    
    if (isEntering) {
      link.style.color = '#1a1a1a';
      link.style.transform = 'translateY(-1px)';
    } else {
      link.style.color = '#2c2c2c';
      link.style.transform = 'translateY(0)';
    }
  }

  createUnderline(link) {
    link.style.position = 'relative';
    link.style.transition = 'all 0.3s ease';
    
    // Create underline effect with pseudo-element via CSS
    if (!document.getElementById('pipeline-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'pipeline-nav-styles';
      style.textContent = `
        .header__nav-link::after,
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #2c2c2c;
          transition: width 0.3s ease;
        }
        
        .header__nav-link:hover::after,
        .nav-link:hover::after {
          width: 100%;
        }
      `;
      document.head.appendChild(style);
    }
  }

  createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: pipelineRipple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  animateInputFocus(input, isFocused) {
    const container = input.closest('.field, .form-group') || input.parentElement;
    
    if (isFocused) {
      container.style.transform = 'translateY(-2px)';
      container.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
      input.style.borderColor = '#2c2c2c';
    } else {
      container.style.transform = 'translateY(0)';
      container.style.boxShadow = 'none';
      input.style.borderColor = '#e1e5e9';
    }
  }

  animateQuantityChange(button) {
    button.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }, 50);
  }

  // Utility method to add animation classes to elements
  static addAnimationClass(selector, animationType, delay = 0) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
      element.dataset.animate = animationType;
      element.dataset.delay = delay * index;
    });
  }

  // Method to trigger custom animations
  static triggerAnimation(element, animationType) {
    element.classList.add('pipeline-animate-in');
    element.classList.add(`pipeline-${animationType}`);
  }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PipelineAnimations();
  
  // Add default animation classes to common elements
  PipelineAnimations.addAnimationClass('.card-product', 'fade-up', 100);
  PipelineAnimations.addAnimationClass('.hero-title', 'fade-up', 0);
  PipelineAnimations.addAnimationClass('.hero-description', 'fade-up', 200);
  PipelineAnimations.addAnimationClass('.button', 'fade-up', 400);
});

// Re-initialize for AJAX content
document.addEventListener('shopify:section:load', () => {
  new PipelineAnimations();
});