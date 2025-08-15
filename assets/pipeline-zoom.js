/* PIPELINE-STYLE IMAGE ZOOM - ENHANCED PRODUCT GALLERY */

class PipelineImageZoom {
  constructor() {
    this.activeZoom = null;
    this.zoomOverlay = null;
    this.init();
  }

  init() {
    this.setupProductImageZoom();
    this.setupMobileTouch();
    this.addZoomIndicators();
  }

  // Enhanced product image zoom with Pipeline styling
  setupProductImageZoom() {
    const productImages = document.querySelectorAll('.product__media img, .product-media img, .card-product img');
    
    productImages.forEach(img => {
      // Add zoom class for styling
      img.classList.add('pipeline-zoomable');
      
      // Desktop hover zoom
      img.addEventListener('mouseenter', (e) => this.showZoomPreview(e.target));
      img.addEventListener('mousemove', (e) => this.updateZoomPosition(e));
      img.addEventListener('mouseleave', () => this.hideZoomPreview());
      
      // Click for full zoom
      img.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFullZoom(e.target);
      });
    });
  }

  // Show zoom preview on hover (Pipeline style)
  showZoomPreview(img) {
    if (window.innerWidth < 768) return; // Skip on mobile
    
    const container = img.parentElement;
    if (!container) return;

    // Create zoom preview overlay
    this.zoomOverlay = document.createElement('div');
    this.zoomOverlay.className = 'pipeline-zoom-preview';
    
    // Get high-res image URL
    const imgSrc = this.getHighResUrl(img.src);
    
    this.zoomOverlay.style.cssText = `
      position: absolute;
      top: 0;
      right: -320px;
      width: 300px;
      height: 300px;
      background: white;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      background-image: url(${imgSrc});
      background-repeat: no-repeat;
      background-size: 800px 800px;
      z-index: 1000;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;

    container.style.position = 'relative';
    container.appendChild(this.zoomOverlay);

    // Animate in
    setTimeout(() => {
      this.zoomOverlay.style.opacity = '1';
      this.zoomOverlay.style.transform = 'scale(1)';
    }, 50);

    this.activeZoom = img;
  }

  // Update zoom position based on mouse movement
  updateZoomPosition(e) {
    if (!this.zoomOverlay || !this.activeZoom) return;

    const img = this.activeZoom;
    const rect = img.getBoundingClientRect();
    
    // Calculate mouse position relative to image
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update background position for zoom effect
    this.zoomOverlay.style.backgroundPosition = `${x}% ${y}%`;
  }

  // Hide zoom preview
  hideZoomPreview() {
    if (this.zoomOverlay) {
      this.zoomOverlay.style.opacity = '0';
      this.zoomOverlay.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        if (this.zoomOverlay && this.zoomOverlay.parentNode) {
          this.zoomOverlay.parentNode.removeChild(this.zoomOverlay);
        }
        this.zoomOverlay = null;
      }, 300);
    }
    this.activeZoom = null;
  }

  // Full zoom modal for mobile and desktop
  openFullZoom(img) {
    const imgSrc = this.getHighResUrl(img.src);
    
    // Create full zoom modal
    const modal = document.createElement('div');
    modal.className = 'pipeline-zoom-modal';
    modal.innerHTML = `
      <div class="pipeline-zoom-backdrop"></div>
      <div class="pipeline-zoom-container">
        <img src="${imgSrc}" alt="Zoomed product image" class="pipeline-zoom-image">
        <button class="pipeline-zoom-close" aria-label="Close zoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.pipeline-zoom-close').addEventListener('click', () => this.closeFullZoom(modal));
    modal.querySelector('.pipeline-zoom-backdrop').addEventListener('click', () => this.closeFullZoom(modal));
    
    // ESC key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.closeFullZoom(modal);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Animate in
    setTimeout(() => modal.classList.add('active'), 50);

    // Pan functionality for zoomed image
    this.setupImagePanning(modal.querySelector('.pipeline-zoom-image'));
  }

  // Close full zoom modal
  closeFullZoom(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  // Setup image panning for full zoom
  setupImagePanning(img) {
    let isPanning = false;
    let startX, startY, scrollLeft, scrollTop;

    img.addEventListener('mousedown', (e) => {
      isPanning = true;
      img.style.cursor = 'grabbing';
      startX = e.pageX - img.offsetLeft;
      startY = e.pageY - img.offsetTop;
      scrollLeft = img.scrollLeft;
      scrollTop = img.scrollTop;
    });

    img.addEventListener('mouseleave', () => {
      isPanning = false;
      img.style.cursor = 'grab';
    });

    img.addEventListener('mouseup', () => {
      isPanning = false;
      img.style.cursor = 'grab';
    });

    img.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      e.preventDefault();
      const x = e.pageX - img.offsetLeft;
      const y = e.pageY - img.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      img.scrollLeft = scrollLeft - walkX;
      img.scrollTop = scrollTop - walkY;
    });
  }

  // Mobile touch support
  setupMobileTouch() {
    let touchStartX, touchStartY;

    document.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('pipeline-zoomable')) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    });

    document.addEventListener('touchend', (e) => {
      if (e.target.classList.contains('pipeline-zoomable')) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        // If minimal movement, treat as tap
        if (Math.abs(touchEndX - touchStartX) < 10 && Math.abs(touchEndY - touchStartY) < 10) {
          this.openFullZoom(e.target);
        }
      }
    });
  }

  // Add zoom indicators to images
  addZoomIndicators() {
    const productImages = document.querySelectorAll('.pipeline-zoomable');
    
    productImages.forEach(img => {
      const container = img.parentElement;
      if (!container) return;

      const indicator = document.createElement('div');
      indicator.className = 'pipeline-zoom-indicator';
      indicator.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      `;

      container.style.position = 'relative';
      container.appendChild(indicator);
    });
  }

  // Get high resolution image URL
  getHighResUrl(src) {
    // Remove Shopify image transformations to get original size
    return src.replace(/_\d+x\d+(@\dx)?\./g, '.').replace(/\?v=\d+/g, '');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PipelineImageZoom();
});

// Re-initialize for AJAX-loaded content
document.addEventListener('shopify:section:load', () => {
  new PipelineImageZoom();
});