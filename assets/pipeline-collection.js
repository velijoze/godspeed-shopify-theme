/**
 * Pipeline Collection Page JavaScript
 * Handles filtering, sorting, view toggles, and responsive behavior
 */

class PipelineCollection {
  constructor() {
    this.container = document.querySelector('.pipeline-collection-container');
    this.sidebar = document.querySelector('.pipeline-filters-sidebar');
    this.productsGrid = document.querySelector('.pipeline-products-grid');
    this.toggleBtn = document.querySelector('[data-toggle-filters]');
    this.sortSelect = document.querySelector('[data-sort-select]');
    this.viewBtns = document.querySelectorAll('.view-btn');
    this.priceSlider = document.querySelector('[data-price-slider]');
    this.priceMinInput = document.querySelector('[data-price-min]');
    this.priceMaxInput = document.querySelector('[data-price-max]');
    this.filterInputs = document.querySelectorAll('[data-filter]');
    
    this.currentFilters = new Set();
    this.currentSort = 'best-selling';
    this.currentView = 3;
    this.priceRange = { min: 0, max: 4999 };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.initializePriceSlider();
    this.loadSavedState();
    this.updateProductCount();
  }
  
  bindEvents() {
    // Filter toggle
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleFilters());
    }
    
    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
    }
    
    // View toggles
    this.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleViewToggle(btn));
    });
    
    // Filter inputs
    this.filterInputs.forEach(input => {
      input.addEventListener('change', () => this.handleFilterChange());
    });
    
    // Price inputs
    if (this.priceMinInput) {
      this.priceMinInput.addEventListener('input', (e) => this.handlePriceInput('min', e.target.value));
      this.priceMinInput.addEventListener('change', (e) => this.handlePriceInput('min', e.target.value));
    }
    if (this.priceMaxInput) {
      this.priceMaxInput.addEventListener('input', (e) => this.handlePriceInput('max', e.target.value));
      this.priceMaxInput.addEventListener('change', (e) => this.handlePriceInput('max', e.target.value));
    }
    
    // Price arrows
    document.querySelectorAll('[data-price-action]').forEach(arrow => {
      arrow.addEventListener('click', (e) => {
        const action = (e.currentTarget && e.currentTarget.dataset) ? e.currentTarget.dataset.priceAction : null;
        if (action) this.handlePriceArrow(action);
      });
    });
    
    // Show more buttons
    document.querySelectorAll('[data-show-more]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleShowMore(e.target.dataset.showMore));
    });
    
    // Resize handler
    window.addEventListener('resize', () => this.handleResize());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }
  
  toggleFilters() {
    if (!this.sidebar) return;
    
    const isHidden = this.sidebar.getAttribute('data-hidden') === 'true';
    
    if (isHidden) {
      this.sidebar.removeAttribute('data-hidden');
      this.toggleBtn.innerHTML = `
        <span class="hamburger-icon">☰</span>
        ${this.toggleBtn.dataset.hideText || 'HIDE FILTERS'}
      `;
    } else {
      this.sidebar.setAttribute('data-hidden', 'true');
      this.toggleBtn.innerHTML = `
        <span class="hamburger-icon">☰</span>
        ${this.toggleBtn.dataset.showText || 'SHOW FILTERS'}
      `;
    }
    
    this.saveState();
  }
  
  handleSort(sortValue) {
    this.currentSort = sortValue;
    this.applyFiltersAndSort();
    this.saveState();
  }
  
  handleViewToggle(clickedBtn) {
    // Remove active class from all buttons
    this.viewBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    clickedBtn.classList.add('active');
    
    // Update grid columns
    this.currentView = parseInt(clickedBtn.dataset.view);
    this.updateGridColumns();
    
    this.saveState();
  }
  
  handleFilterChange() {
    this.currentFilters.clear();
    
    this.filterInputs.forEach(input => {
      if (input.checked) {
        this.currentFilters.add(`${input.name}:${input.value}`);
      }
    });
    
    this.applyFiltersAndSort();
    this.saveState();
  }
  
  handlePriceInput(type, value) {
    const numValue = parseInt(value) || 0;
    
    if (type === 'min') {
      this.priceRange.min = Math.max(0, Math.min(numValue, this.priceRange.max));
      this.priceMinInput.value = this.priceRange.min;
    } else {
      this.priceRange.max = Math.max(this.priceRange.min, numValue);
      this.priceMaxInput.value = this.priceRange.max;
    }
    
    this.updatePriceSlider();
    this.applyFiltersAndSort();
    this.saveState();
  }
  
  handlePriceArrow(action) {
    const step = 100;
    let newValue;
    
    switch (action) {
      case 'min-up':
        newValue = this.priceRange.min + step;
        this.handlePriceInput('min', newValue.toString());
        break;
      case 'min-down':
        newValue = this.priceRange.min - step;
        this.handlePriceInput('min', newValue.toString());
        break;
      case 'max-up':
        newValue = this.priceRange.max + step;
        this.handlePriceInput('max', newValue.toString());
        break;
      case 'max-down':
        newValue = this.priceRange.max - step;
        this.handlePriceInput('max', newValue.toString());
        break;
    }
  }
  
  handleShowMore(filterType) {
    const filterGroup = document.querySelector(`[data-filter-group="${filterType}"]`);
    if (!filterGroup) return;
    
    const hiddenOptions = filterGroup.querySelectorAll('.filter-option[data-hidden="true"]');
    const showMoreBtn = document.querySelector(`[data-show-more="${filterType}"]`);
    
    if (hiddenOptions.length > 0) {
      // Show more options
      hiddenOptions.forEach(option => {
        option.removeAttribute('data-hidden');
      });
      
      if (showMoreBtn) {
        showMoreBtn.textContent = 'SHOW LESS';
        showMoreBtn.dataset.action = 'show-less';
      }
    } else {
      // Show less options
      const allOptions = filterGroup.querySelectorAll('.filter-option');
      const maxVisible = 8;
      
      allOptions.forEach((option, index) => {
        if (index >= maxVisible) {
          option.setAttribute('data-hidden', 'true');
        }
      });
      
      if (showMoreBtn) {
        showMoreBtn.textContent = 'SHOW MORE';
        showMoreBtn.dataset.action = 'show-more';
      }
    }
  }
  
  initializePriceSlider() {
    if (!this.priceSlider) return;
    
    const track = this.priceSlider.querySelector('.price-slider-track');
    const minHandle = this.priceSlider.querySelector('[data-handle="min"]');
    const maxHandle = this.priceSlider.querySelector('[data-handle="max"]');
    
    if (!track || !minHandle || !maxHandle) return;
    
    // Set initial positions
    this.updatePriceSlider();
    
    // Add drag/touch functionality using Pointer Events for broad support
    [minHandle, maxHandle].forEach(handle => {
      handle.addEventListener('pointerdown', (e) => this.startDrag(e, handle));
    });
    document.addEventListener('pointerup', () => this.stopDrag());
    document.addEventListener('pointermove', (e) => this.drag(e));
  }
  
  updatePriceSlider() {
    if (!this.priceSlider) return;
    
    const track = this.priceSlider.querySelector('.price-slider-track');
    const minHandle = this.priceSlider.querySelector('[data-handle="min"]');
    const maxHandle = this.priceSlider.querySelector('[data-handle="max"]');
    
    if (!track || !minHandle || !maxHandle) return;
    
    const sliderWidth = this.priceSlider.offsetWidth;
    const minPercent = (this.priceRange.min / 4999) * 100;
    const maxPercent = (this.priceRange.max / 4999) * 100;
    
    minHandle.style.left = `${minPercent}%`;
    maxHandle.style.left = `${maxPercent}%`;
    track.style.left = `${minPercent}%`;
    track.style.right = `${100 - maxPercent}%`;
  }
  
  startDrag(e, handle) {
    if (e && e.preventDefault) e.preventDefault();
    this.dragging = handle;
    this.dragStartX = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const currentLeft = parseFloat(handle.style.left);
    this.dragStartLeft = isNaN(currentLeft) ? 0 : currentLeft;
  }
  
  stopDrag() {
    this.dragging = null;
  }
  
  drag(e) {
    if (!this.dragging) return;
    
    const clientX = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : this.dragStartX);
    const deltaX = clientX - this.dragStartX;
    const sliderWidth = this.priceSlider.offsetWidth;
    const deltaPercent = (deltaX / sliderWidth) * 100;
    const newLeft = Math.max(0, Math.min(100, this.dragStartLeft + deltaPercent));
    
    this.dragging.style.left = `${newLeft}%`;
    
    // Update price range
    const price = Math.round((newLeft / 100) * 4999);
    
    if (this.dragging.dataset.handle === 'min') {
      this.priceRange.min = Math.min(price, this.priceRange.max - 100);
      this.priceMinInput.value = this.priceRange.min;
    } else {
      this.priceRange.max = Math.max(price, this.priceRange.min + 100);
      this.priceMaxInput.value = this.priceRange.max;
    }
    
    this.updatePriceSlider();
    // Live filter while dragging
    this.applyFiltersAndSort();
  }
  
  applyFiltersAndSort() {
    if (!this.productsGrid) return;
    
    const products = Array.from(this.productsGrid.children);
    
    // Apply filters
    const filteredProducts = products.filter(product => {
      return this.productMatchesFilters(product);
    });
    
    // Apply sorting
    const sortedProducts = this.sortProducts(filteredProducts);
    
    // Update display
    this.updateProductDisplay(sortedProducts);
    this.updateProductCount(filteredProducts.length);
  }
  
  productMatchesFilters(product) {
    // Check collection filter
    const collectionFilter = Array.from(this.filterInputs)
      .filter(input => input.name === 'collection' && input.checked)
      .map(input => input.value);
    
    if (collectionFilter.length > 0) {
      const productCollection = product.dataset.collection;
      if (!collectionFilter.includes(productCollection)) {
        return false;
      }
    }
    
    // Check availability filter
    const availabilityFilter = Array.from(this.filterInputs)
      .filter(input => input.name === 'availability' && input.checked)
      .map(input => input.value);
    
    if (availabilityFilter.length > 0) {
      const isAvailable = product.dataset.available === 'true';
      const availability = isAvailable ? 'in_stock' : 'out_of_stock';
      if (!availabilityFilter.includes(availability)) {
        return false;
      }
    }
    
    // Check price filter
    const price = parseInt(product.dataset.price) || 0;
    if (price < this.priceRange.min || price > this.priceRange.max) {
      return false;
    }
    
    return true;
  }
  
  sortProducts(products) {
    return products.sort((a, b) => {
      switch (this.currentSort) {
        case 'price-low-high':
          return (parseInt(a.dataset.price) || 0) - (parseInt(b.dataset.price) || 0);
        case 'price-high-low':
          return (parseInt(b.dataset.price) || 0) - (parseInt(a.dataset.price) || 0);
        case 'newest':
          return new Date(b.dataset.created) - new Date(a.dataset.created);
        case 'featured':
          return (b.dataset.featured === 'true' ? 1 : 0) - (a.dataset.featured === 'true' ? 1 : 0);
        case 'best-selling':
        default:
          return (parseInt(b.dataset.sales) || 0) - (parseInt(a.dataset.sales) || 0);
      }
    });
  }
  
  updateProductDisplay(products) {
    if (!this.productsGrid) return;
    
    // Clear current grid
    this.productsGrid.innerHTML = '';
    
    // Add filtered and sorted products
    products.forEach(product => {
      this.productsGrid.appendChild(product);
    });
  }
  
  updateGridColumns() {
    if (!this.productsGrid) return;
    
    this.productsGrid.style.setProperty('--columns-desktop', this.currentView.toString());
  }
  
  updateProductCount(count = null) {
    const countDisplay = document.querySelector('.product-count-display');
    if (!countDisplay) return;
    
    if (count !== null) {
      countDisplay.textContent = `${count} products`;
    } else {
      const totalProducts = this.productsGrid ? this.productsGrid.children.length : 0;
      countDisplay.textContent = `${totalProducts} products`;
    }
  }
  
  handleResize() {
    // Update sticky sidebar on resize
    if (this.sidebar && window.innerWidth <= 989) {
      this.sidebar.style.position = 'relative';
      this.sidebar.style.top = '0';
    } else if (this.sidebar) {
      this.sidebar.style.position = 'sticky';
      this.sidebar.style.top = '20px';
    }
  }
  
  handleKeyboard(e) {
    // Escape key to close filters on mobile
    if (e.key === 'Escape' && window.innerWidth <= 989) {
      if (this.sidebar && this.sidebar.getAttribute('data-hidden') !== 'true') {
        this.toggleFilters();
      }
    }
  }
  
  saveState() {
    const state = {
      filters: Array.from(this.currentFilters),
      sort: this.currentSort,
      view: this.currentView,
      priceRange: this.priceRange,
      sidebarHidden: this.sidebar?.getAttribute('data-hidden') === 'true'
    };
    
    localStorage.setItem('pipeline-collection-state', JSON.stringify(state));
  }
  
  loadSavedState() {
    const saved = localStorage.getItem('pipeline-collection-state');
    if (!saved) return;
    
    try {
      const state = JSON.parse(saved);
      
      // Restore filters
      this.currentFilters = new Set(state.filters || []);
      this.filterInputs.forEach(input => {
        const filterKey = `${input.name}:${input.value}`;
        input.checked = this.currentFilters.has(filterKey);
      });
      
      // Restore sort
      this.currentSort = state.sort || 'best-selling';
      if (this.sortSelect) {
        this.sortSelect.value = this.currentSort;
      }
      
      // Restore view
      this.currentView = state.view || 3;
      this.viewBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.view) === this.currentView);
      });
      this.updateGridColumns();
      
      // Restore price range
      this.priceRange = state.priceRange || { min: 0, max: 4999 };
      if (this.priceMinInput) this.priceMinInput.value = this.priceRange.min;
      if (this.priceMaxInput) this.priceMaxInput.value = this.priceRange.max;
      this.updatePriceSlider();
      
      // Restore sidebar state
      if (state.sidebarHidden && this.sidebar) {
        this.sidebar.setAttribute('data-hidden', 'true');
        if (this.toggleBtn) {
          this.toggleBtn.innerHTML = `
            <span class="hamburger-icon">☰</span>
            ${this.toggleBtn.dataset.showText || 'SHOW FILTERS'}
          `;
        }
      }
      
      // Apply filters and sort
      this.applyFiltersAndSort();
      
    } catch (error) {
      console.warn('Failed to load saved collection state:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.pipeline-collection-container')) {
    new PipelineCollection();
  }
});

// Export for potential external use
window.PipelineCollection = PipelineCollection; 