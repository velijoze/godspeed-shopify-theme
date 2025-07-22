/* PIPELINE PERFORMANCE OPTIMIZATIONS */

class PipelinePerformance {
  constructor() {
    this.intersectionObserver = null;
    this.lazyElements = [];
    this.prefetchQueue = [];
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupPrefetching();
    this.optimizeAnimations();
    this.setupImageOptimization();
    this.debounceScrollEvents();
  }

  // Lazy loading for images and content below the fold
  setupLazyLoading() {
    // Enhanced image lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Add high-resolution source if available
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Add Pipeline fade-in animation
            img.addEventListener('load', () => {
              img.style.opacity = '0';
              img.style.transition = 'opacity 0.3s ease';
              setTimeout(() => {
                img.style.opacity = '1';
              }, 50);
            });
            
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      lazyImages.forEach(img => {
        this.intersectionObserver.observe(img);
      });
    }

    // Lazy load non-critical sections
    this.lazyLoadSections();
  }

  lazyLoadSections() {
    const lazySection = document.querySelectorAll('[data-lazy-section]');
    
    if (lazySection.length === 0) return;

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const sectionType = section.dataset.lazySection;
          
          // Load section-specific content
          this.loadSectionContent(section, sectionType);
          sectionObserver.unobserve(section);
        }
      });
    }, {
      rootMargin: '100px 0px'
    });

    lazySection.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  loadSectionContent(section, type) {
    switch (type) {
      case 'reviews':
        this.loadReviews(section);
        break;
      case 'related-products':
        this.loadRelatedProducts(section);
        break;
      case 'recommendations':
        this.loadRecommendations(section);
        break;
      default:
        console.log(`Loading lazy section: ${type}`);
    }
  }

  // Prefetch critical resources
  setupPrefetching() {
    // Prefetch product pages on hover
    const productLinks = document.querySelectorAll('.card-product a, .product-card a');
    
    productLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.prefetchPage(link.href);
      }, { once: true });
    });

    // Prefetch cart drawer assets
    const cartTriggers = document.querySelectorAll('[data-cart-drawer]');
    
    if (cartTriggers.length > 0) {
      // Prefetch cart styles on first cart interaction
      cartTriggers[0].addEventListener('click', () => {
        this.prefetchCartAssets();
      }, { once: true });
    }
  }

  prefetchPage(url) {
    if (this.prefetchQueue.includes(url)) return;
    
    this.prefetchQueue.push(url);
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  prefetchCartAssets() {
    const cartAssets = [
      '/cart',
      '/cart.js'
    ];

    cartAssets.forEach(asset => {
      this.prefetchPage(asset);
    });
  }

  // Optimize animations based on device capabilities
  optimizeAnimations() {
    // Check device performance
    const isLowEnd = this.isLowEndDevice();
    
    if (isLowEnd) {
      // Reduce animations on low-end devices
      document.documentElement.style.setProperty('--pipeline-transition-normal', '0.15s ease');
      document.documentElement.style.setProperty('--pipeline-transition-slow', '0.3s ease');
      
      // Disable complex animations
      document.body.classList.add('pipeline-reduced-animations');
    }

    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
      } else {
        document.body.style.animationPlayState = 'running';
      }
    });
  }

  isLowEndDevice() {
    // Check various performance indicators
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 8;

    // Low-end indicators
    const isSlowConnection = connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const isLowRAM = deviceMemory < 4;
    const isLowCPU = hardwareConcurrency < 4;

    return isSlowConnection || isLowRAM || isLowCPU;
  }

  // Image optimization
  setupImageOptimization() {
    // Convert images to WebP when supported
    if (this.supportsWebP()) {
      this.convertImagesToWebP();
    }

    // Responsive image loading
    this.setupResponsiveImages();
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  convertImagesToWebP() {
    const images = document.querySelectorAll('img[src*=".jpg"], img[src*=".png"]');
    
    images.forEach(img => {
      const webpSrc = img.src.replace(/\.(jpg|png)/, '.webp');
      
      // Test if WebP version exists
      const testImg = new Image();
      testImg.onload = () => {
        img.src = webpSrc;
      };
      testImg.src = webpSrc;
    });
  }

  setupResponsiveImages() {
    // Generate responsive image URLs for Shopify images
    const shopifyImages = document.querySelectorAll('img[src*="shopify.com"]');
    
    shopifyImages.forEach(img => {
      const originalSrc = img.src;
      const imgWidth = img.clientWidth || 400;
      
      // Calculate optimal image size
      const optimalSize = this.getOptimalImageSize(imgWidth);
      const optimizedSrc = originalSrc.replace(/(\.[^.]+)$/, `_${optimalSize}x$1`);
      
      img.src = optimizedSrc;
    });
  }

  getOptimalImageSize(displayWidth) {
    const pixelRatio = window.devicePixelRatio || 1;
    const targetWidth = Math.ceil(displayWidth * pixelRatio);
    
    // Shopify image sizes
    const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000];
    
    return sizes.find(size => size >= targetWidth) || 2000;
  }

  // Debounce scroll events for better performance
  debounceScrollEvents() {
    let scrollTimeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    // Use passive listeners for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // Static method for critical performance improvements
  static initCriticalOptimizations() {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://cdn.shopify.com',
      'https://shopify-assets.shopifycdn.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for common resources
    const dnsPrefetchDomains = [
      '//cdn.shopify.com',
      '//v.shopify.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// Initialize critical optimizations immediately
PipelinePerformance.initCriticalOptimizations();

// Initialize full performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.pipelinePerformance = new PipelinePerformance();
});

// Performance monitoring
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
}