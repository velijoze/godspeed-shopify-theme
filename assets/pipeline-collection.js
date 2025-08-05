/**
 * Pipeline Collection - Clean & Minimal
 */

class PipelineCollection {
  constructor() {
    this.sidebar = document.querySelector('.pipeline-filters-sidebar');
    this.toggleBtn = document.querySelector('[data-toggle-filters]');
    this.sortSelect = document.querySelector('[data-sort-select]');
    this.viewBtns = document.querySelectorAll('.view-btn');
    this.productsGrid = document.querySelector('.pipeline-products-grid');
    
    this.init();
  }
  
  init() {
    this.bindEvents();
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
    document.querySelectorAll('[data-filter]').forEach(input => {
      input.addEventListener('change', () => this.handleFilterChange());
    });
  }
  
  toggleFilters() {
    if (!this.sidebar) return;
    
    const isHidden = this.sidebar.getAttribute('data-hidden') === 'true';
    
    if (isHidden) {
      this.sidebar.removeAttribute('data-hidden');
      this.toggleBtn.innerHTML = `
        <span class="hamburger-icon">☰</span>
        HIDE FILTERS
      `;
    } else {
      this.sidebar.setAttribute('data-hidden', 'true');
      this.toggleBtn.innerHTML = `
        <span class="hamburger-icon">☰</span>
        SHOW FILTERS
      `;
    }
  }
  
  handleSort(sortValue) {
    // Basic sort functionality
    console.log('Sort changed to:', sortValue);
  }
  
  handleViewToggle(clickedBtn) {
    // Remove active class from all buttons
    this.viewBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    clickedBtn.classList.add('active');
    
    // Update grid columns
    const columns = clickedBtn.dataset.view || 3;
    if (this.productsGrid) {
      this.productsGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
  }
  
  handleFilterChange() {
    // Basic filter functionality
    console.log('Filters changed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.pipeline-collection-container')) {
    new PipelineCollection();
  }
}); 