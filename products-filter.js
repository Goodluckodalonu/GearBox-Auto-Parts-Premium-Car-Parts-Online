// Products Filtering System
class ProductFilter {
  constructor() {
      this.allProducts = [];
      this.filteredProducts = [];
      this.filters = {
          categories: [],
          priceRange: { min: 0, max: 1000 },
          brands: [],
          ratings: [],
          inStock: false,
          searchTerm: ''
      };
      this.sortBy = 'featured';
      this.currentView = 'grid';
      this.currentPage = 1;
      this.productsPerPage = 12;
      
      console.log('ProductFilter initialized');
      this.init();
  }
  
  async init() {
      console.log('Loading products...');
      // Load products
      this.allProducts = await this.fetchProducts();
      console.log('Loaded', this.allProducts.length, 'products');
      
      if (this.allProducts.length === 0) {
          this.showNoProductsMessage();
          return;
      }
      
      this.filteredProducts = [...this.allProducts];
      
      // Initialize UI
      this.populateBrandFilters();
      this.setupEventListeners();
      this.applyFilters(); // Initial render
      this.updateResultsCount();
      
      // Set active view
      this.setView(this.currentView);
      
      // Check URL parameters
      this.checkUrlParameters();
      
      // Make product cards clickable
      this.makeProductCardsClickable();
  }
  
  async fetchProducts() {
      try {
          const response = await fetch('products.json');
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data.products || [];
      } catch (error) {
          console.error('Error loading products:', error);
          this.showErrorMessage('Error loading products. Please try again later.');
          return [];
      }
  }
  
  populateBrandFilters() {
      const brandContainer = document.querySelector('.brand-filters-container');
      if (!brandContainer) {
          console.log('Brand filters container not found');
          return;
      }
      
      // Get unique brands
      const brands = [...new Set(this.allProducts.map(p => p.brand))];
      console.log('Found brands:', brands);
      
      brandContainer.innerHTML = brands.map(brand => `
          <label class="flex items-center py-1">
              <input type="checkbox" name="brand" value="${brand.toLowerCase()}" 
                     class="brand-filter mr-3 rounded text-primary focus:ring-primary">
              <span class="text-sm">${brand}</span>
          </label>
      `).join('');
  }
  
  setupEventListeners() {
      console.log('Setting up event listeners...');
      
      // Category filters
      document.querySelectorAll('.category-filter').forEach(checkbox => {
          checkbox.addEventListener('change', (e) => this.handleCategoryFilter(e));
      });
      
      // Brand filters
      document.addEventListener('change', (e) => {
          if (e.target.classList.contains('brand-filter')) {
              this.handleBrandFilter(e);
          }
      });
      
      // Rating filters
      document.querySelectorAll('.rating-filter').forEach(checkbox => {
          checkbox.addEventListener('change', (e) => this.handleRatingFilter(e));
      });
      
      // Price filter
      const priceSlider = document.getElementById('price-slider');
      const priceMinInput = document.getElementById('price-min');
      const priceMaxInput = document.getElementById('price-max-input');
      
      if (priceSlider) {
          priceSlider.addEventListener('input', (e) => {
              document.getElementById('price-max').textContent = `$${e.target.value}+`;
              priceMaxInput.value = e.target.value;
              this.filters.priceRange.max = parseInt(e.target.value);
              this.debouncedApplyFilters();
          });
      }
      
      if (priceMinInput) {
          priceMinInput.addEventListener('input', (e) => {
              const value = Math.min(parseInt(e.target.value) || 0, this.filters.priceRange.max - 10);
              this.filters.priceRange.min = value;
              this.debouncedApplyFilters();
          });
      }
      
      if (priceMaxInput) {
          priceMaxInput.addEventListener('input', (e) => {
              const value = Math.max(parseInt(e.target.value) || 500, this.filters.priceRange.min + 10);
              this.filters.priceRange.max = value;
              priceSlider.value = value;
              document.getElementById('price-max').textContent = `$${value}+`;
              this.debouncedApplyFilters();
          });
      }
      
      
      // In stock filter
      const inStockFilter = document.getElementById('in-stock-filter');
      if (inStockFilter) {
          inStockFilter.addEventListener('change', (e) => {
              this.filters.inStock = e.target.checked;
              this.applyFilters();
          });
      }
      
      // Search functionality
      const searchInput = document.getElementById('search-input');
      const mobileSearch = document.getElementById('mobile-search');
      
      if (searchInput) {
          searchInput.addEventListener('input', (e) => {
              this.filters.searchTerm = e.target.value.toLowerCase().trim();
              this.debouncedApplyFilters();
          });
      }
      
      if (mobileSearch) {
          mobileSearch.addEventListener('input', (e) => {
              this.filters.searchTerm = e.target.value.toLowerCase().trim();
              this.debouncedApplyFilters();
          });
      }
      
      // Sort options
      const sortOptions = document.getElementById('sort-options');
      if (sortOptions) {
          sortOptions.addEventListener('change', (e) => {
              this.sortBy = e.target.value;
              this.applyFilters();
          });
      }

      const perPageSelect = document.getElementById('per-page-select');
if (perPageSelect) {
    perPageSelect.addEventListener('change', (e) => {
        this.productsPerPage = parseInt(e.target.value);
        this.currentPage = 1; // Reset to first page
        this.applyFilters();
    });
}
      
      // View toggle
      document.querySelectorAll('.view-toggle').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const view = e.currentTarget.dataset.view;
              this.setView(view);
          });
      });
      
      // Clear filters
      const clearFiltersBtn = document.getElementById('clear-filters');
      if (clearFiltersBtn) {
          clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
      }
      
      // Reset search
      const resetSearchBtn = document.getElementById('reset-search');
      if (resetSearchBtn) {
          resetSearchBtn.addEventListener('click', () => this.clearAllFilters());
      }
      
      // Apply filters button
      const applyFiltersBtn = document.getElementById('apply-filters');
      if (applyFiltersBtn) {
          applyFiltersBtn.addEventListener('click', () => this.applyFilters());
      }
      
      console.log('Event listeners setup complete');
  }
  
  handleCategoryFilter(e) {
      const checkbox = e.target;
      const value = checkbox.value;
      
      console.log('Category filter changed:', value, checkbox.checked);
      
      if (value === 'all') {
          // If "All Categories" is checked, uncheck others
          if (checkbox.checked) {
              document.querySelectorAll('.category-filter:not([value="all"])').forEach(cb => {
                  cb.checked = false;
              });
              this.filters.categories = [];
          }
      } else {
          // Uncheck "All Categories" if another category is selected
          const allCheckbox = document.querySelector('.category-filter[value="all"]');
          if (allCheckbox) allCheckbox.checked = false;
          
          if (checkbox.checked) {
              this.filters.categories.push(value);
          } else {
              this.filters.categories = this.filters.categories.filter(cat => cat !== value);
          }
      }
      
      this.applyFilters();
  }
  
  handleBrandFilter(e) {
      const brand = e.target.value;
      console.log('Brand filter changed:', brand, e.target.checked);
      
      if (e.target.checked) {
          this.filters.brands.push(brand);
      } else {
          this.filters.brands = this.filters.brands.filter(b => b !== brand);
      }
      
      this.applyFilters();
  }
  
  handleRatingFilter(e) {
      const rating = parseInt(e.target.value);
      console.log('Rating filter changed:', rating, e.target.checked);
      
      if (e.target.checked) {
          this.filters.ratings.push(rating);
      } else {
          this.filters.ratings = this.filters.ratings.filter(r => r !== rating);
      }
      
      this.applyFilters();
  }
  
  applyFilters() {
      console.log('Applying filters...');
      
      // Start with all products
      let results = [...this.allProducts];
      
      // Apply category filter
      if (this.filters.categories.length > 0) {
          results = results.filter(product => 
              this.filters.categories.includes(product.category)
          );
          console.log('After category filter:', results.length);
      }
      
      // Apply price filter
      results = results.filter(product => 
          product.price >= this.filters.priceRange.min && 
          product.price <= this.filters.priceRange.max
      );
      console.log('After price filter:', results.length);
      
      // Apply brand filter
      if (this.filters.brands.length > 0) {
          results = results.filter(product => 
              this.filters.brands.includes(product.brand.toLowerCase())
          );
          console.log('After brand filter:', results.length);
      }
      
      // Apply rating filter
      if (this.filters.ratings.length > 0) {
          results = results.filter(product => 
              this.filters.ratings.some(rating => product.rating >= rating)
          );
          console.log('After rating filter:', results.length);
      }
      
      // Apply in-stock filter
      if (this.filters.inStock) {
          results = results.filter(product => product.inStock);
          console.log('After in-stock filter:', results.length);
      }
      
      // Apply search filter
      if (this.filters.searchTerm) {
          results = results.filter(product => 
              product.name.toLowerCase().includes(this.filters.searchTerm) ||
              product.brand.toLowerCase().includes(this.filters.searchTerm) ||
              product.description.toLowerCase().includes(this.filters.searchTerm)
          );
          console.log('After search filter:', results.length);
      }
      
      // Apply sorting
      results = this.sortProducts(results, this.sortBy);
      
      // Update filtered products
      this.filteredProducts = results;
      
      // Update UI
      this.displayProducts();
      this.updateActiveFilters();
      this.updateResultsCount();
      // this.updatePagination();
  }
  
  debouncedApplyFilters = this.debounce(() => {
      console.log('Debounced apply filters');
      this.applyFilters();
  }, 300);
  
  debounce(func, wait) {
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
  
  sortProducts(products, sortBy) {
      console.log('Sorting by:', sortBy);
      switch(sortBy) {
          case 'price-low':
              return [...products].sort((a, b) => a.price - b.price);
          case 'price-high':
              return [...products].sort((a, b) => b.price - a.price);
          case 'rating':
              return [...products].sort((a, b) => b.rating - a.rating);
          case 'name':
              return [...products].sort((a, b) => a.name.localeCompare(b.name));
          case 'featured':
          default:
              return [...products].sort((a, b) => {
                  if (a.featured && !b.featured) return -1;
                  if (!a.featured && b.featured) return 1;
                  return 0;
              });
      }
  }
  
  displayProducts() {
      const container = document.getElementById('products-container');
      const noResults = document.getElementById('no-results');
      
      if (!container) {
          console.error('Products container not found!');
          return;
      }
      
      console.log('Displaying', this.filteredProducts.length, 'products');
      
      // Show/hide no results message
      if (this.filteredProducts.length === 0) {
          container.innerHTML = '';
          if (noResults) noResults.classList.remove('hidden');
          return;
      }
      
      if (noResults) noResults.classList.add('hidden');
      
      // Calculate pagination
      const startIndex = (this.currentPage - 1) * this.productsPerPage;
      const endIndex = startIndex + this.productsPerPage;
      const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
      
      // Clear container
      container.innerHTML = '';
      
      // Add products
      pageProducts.forEach(product => {
          const productElement = this.createProductElement(product);
          container.appendChild(productElement);
      });
      
      // Make product cards clickable
      this.makeProductCardsClickable();
      
      // Initialize wishlist buttons
      if (window.wishlist && typeof window.wishlist.initializeExistingButtons === 'function') {
          window.wishlist.initializeExistingButtons();
      }
  }
  
 
  createProductElement(product) {
    const isListView = this.currentView === 'list';
    
    if (isListView) {
        return this.createListProductCard(product);
    } else {
        return this.createGridProductCard(product);
    }
}

createGridProductCard(product) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1 product-card fade-in';
    div.setAttribute('data-id', product.id);
    
    // Determine heart icon state
    const isInWishlist = this.checkIfInWishlist(product.id);
    const heartIconClass = isInWishlist ? 'fas fa-heart text-accent' : 'far fa-heart';
    
    div.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.name}" 
                 class="w-full h-48 object-cover">
            ${product.originalPrice ? `
                <span class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    -${Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
            ` : ''}
            ${!product.inStock ? `
                <span class="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Out of Stock
                </span>
            ` : ''}
            <button class="wishlist-btn absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition" 
                    data-id="${product.id}"
                    aria-label="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                <i class="${heartIconClass}"></i>
            </button>
        </div>
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">${product.brand}</span>
                    <h3 class="font-bold text-lg mt-2">${product.name}</h3>
                    <p class="text-gray-600 text-sm mt-1 line-clamp-2">${product.description}</p>
                </div>
            </div>
            
            <div class="flex items-center mb-3">
                <div class="flex text-yellow-400">
                    ${this.generateStarRating(product.rating)}
                </div>
                <span class="text-sm text-gray-600 ml-2">(${product.reviews})</span>
            </div>
            
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-2xl font-bold text-dark">$${product.price}</span>
                    ${product.originalPrice ? `
                        <span class="text-gray-500 line-through ml-2">$${product.originalPrice}</span>
                    ` : ''}
                </div>
                <button class="add-to-cart-btn ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''} 
                        bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition flex items-center" 
                        data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart mr-2"></i> Add
                </button>
            </div>
        </div>
    `;
    
    return div;
}
  
  createListProductCard(product) {
      const div = document.createElement('div');
      div.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition fade-in product-card';
      div.setAttribute('data-id', product.id);
      
      // Determine heart icon state
      const isInWishlist = this.checkIfInWishlist(product.id);
      const heartIconClass = isInWishlist ? 'fas fa-heart text-accent' : 'far fa-heart';
      
      div.innerHTML = `
          <div class="flex flex-col md:flex-row">
              <div class="md:w-1/4 relative">
                  <img src="${product.image}" alt="${product.name}" 
                       class="w-full h-48 md:h-full object-cover">
                  ${product.originalPrice ? `
                      <span class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                          -${Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                  ` : ''}
              </div>
              <div class="md:w-3/4 p-6">
                  <div class="flex justify-between items-start">
                      <div class="flex-1">
                          <div class="flex items-center mb-2">
                              <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded mr-3">${product.brand}</span>
                              <div class="flex text-yellow-400">
                                  ${this.generateStarRating(product.rating)}
                              </div>
                              <span class="text-sm text-gray-600 ml-2">(${product.reviews})</span>
                          </div>
                          <h3 class="text-xl font-bold mb-2">${product.name}</h3>
                          <p class="text-gray-600 mb-4">${product.description}</p>
                          <div class="flex flex-wrap gap-2 mb-4">
                              ${product.features.map(feature => `
                                  <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${feature}</span>
                              `).join('')}
                          </div>
                      </div>
                      <div class="ml-6 text-right">
                          <div class="mb-4">
                              <span class="text-2xl font-bold text-dark">$${product.price}</span>
                              ${product.originalPrice ? `
                                  <span class="text-gray-500 line-through ml-2">$${product.originalPrice}</span>
                              ` : ''}
                          </div>
                          ${!product.inStock ? `
                              <span class="inline-block bg-gray-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
                                  Out of Stock
                              </span>
                          ` : ''}
                          <div class="flex space-x-3">
                              <button class="wishlist-btn w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition" 
                                      data-id="${product.id}"
                                      aria-label="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                                  <i class="${heartIconClass}"></i>
                              </button>
                              <button class="add-to-cart-btn ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''} 
                                      bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center" 
                                      data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                                  <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `;
      
      return div;
  }
  
  checkIfInWishlist(productId) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      return wishlist.some(item => item.id === productId);
  }
  
  generateStarRating(rating) {
      let stars = '';
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      for (let i = 1; i <= 5; i++) {
          if (i <= fullStars) {
              stars += '<i class="fas fa-star"></i>';
          } else if (i === fullStars + 1 && hasHalfStar) {
              stars += '<i class="fas fa-star-half-alt"></i>';
          } else {
              stars += '<i class="far fa-star"></i>';
          }
      }
      
      return stars;
  }
  
  makeProductCardsClickable() {
      document.querySelectorAll('.product-card').forEach(card => {
          card.addEventListener('click', (e) => {
              // Don't navigate if clicking on buttons inside the card
              if (e.target.closest('button') || e.target.tagName === 'BUTTON') {
                  return;
              }
              
              const productId = card.dataset.id;
              if (productId) {
                  window.location.href = `product-detail.html?id=${productId}`;
              }
          });
      });
  }
  
  setView(view) {
      this.currentView = view;
      
      console.log('Setting view to:', view);
      
      // Update button states
      document.querySelectorAll('.view-toggle').forEach(btn => {
          if (btn.dataset.view === view) {
              btn.classList.add('bg-gray-100');
          } else {
              btn.classList.remove('bg-gray-100');
          }
      });
      
      // Update container class
      const container = document.getElementById('products-container');
      if (container) {
          if (view === 'list') {
              container.className = 'grid grid-cols-1 gap-6';
          } else {
              container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
          }
      }
      
      // Re-render products
      this.displayProducts();
  }
  
  updateActiveFilters() {
      const container = document.getElementById('active-filters');
      const filtersContainer = container ? container.querySelector('.flex-wrap') : null;
      
      if (!container || !filtersContainer) return;
      
      filtersContainer.innerHTML = '';
      
      // Collect active filters
      const activeFilters = [];
      
      // Category filters
      this.filters.categories.forEach(category => {
          activeFilters.push({
              type: 'category',
              value: category,
              label: this.capitalizeFirst(category)
          });
      });
      
      // Brand filters
      this.filters.brands.forEach(brand => {
          activeFilters.push({
              type: 'brand',
              value: brand,
              label: this.capitalizeFirst(brand)
          });
      });
      
      // Rating filters
      this.filters.ratings.forEach(rating => {
          activeFilters.push({
              type: 'rating',
              value: rating,
              label: `${rating}+ Stars`
          });
      });
      
      // Price filter
      if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 500) {
          activeFilters.push({
              type: 'price',
              value: `${this.filters.priceRange.min}-${this.filters.priceRange.max}`,
              label: `$${this.filters.priceRange.min} - $${this.filters.priceRange.max}`
          });
      }
      
      // In stock filter
      if (this.filters.inStock) {
          activeFilters.push({
              type: 'inStock',
              value: 'true',
              label: 'In Stock Only'
          });
      }
      
      // Search term
      if (this.filters.searchTerm) {
          activeFilters.push({
              type: 'search',
              value: this.filters.searchTerm,
              label: `Search: "${this.filters.searchTerm}"`
          });
      }
      
      // Display active filters
      activeFilters.forEach(filter => {
          const filterElement = document.createElement('div');
          filterElement.className = 'flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm';
          filterElement.innerHTML = `
              ${filter.label}
              <button class="ml-2 text-gray-500 hover:text-gray-700" 
                      data-type="${filter.type}" 
                      data-value="${filter.value}">
                  <i class="fas fa-times"></i>
              </button>
          `;
          
          // Add remove event
          filterElement.querySelector('button').addEventListener('click', (e) => {
              this.removeFilter(filter.type, filter.value);
          });
          
          filtersContainer.appendChild(filterElement);
      });
      
      // Show/hide container
      if (activeFilters.length > 0) {
          container.classList.remove('hidden');
      } else {
          container.classList.add('hidden');
      }
  }
  
  removeFilter(type, value) {
      switch(type) {
          case 'category':
              this.filters.categories = this.filters.categories.filter(cat => cat !== value);
              // Uncheck corresponding checkbox
              document.querySelectorAll('.category-filter').forEach(cb => {
                  if (cb.value === value) cb.checked = false;
              });
              break;
          case 'brand':
              this.filters.brands = this.filters.brands.filter(b => b !== value);
              document.querySelectorAll('.brand-filter').forEach(cb => {
                  if (cb.value === value) cb.checked = false;
              });
              break;
          case 'rating':
              this.filters.ratings = this.filters.ratings.filter(r => r !== parseInt(value));
              document.querySelectorAll('.rating-filter').forEach(cb => {
                  if (parseInt(cb.value) === parseInt(value)) cb.checked = false;
              });
              break;
          case 'price':
              this.filters.priceRange = { min: 0, max: 1000 };
              const priceSlider = document.getElementById('price-slider');
              if (priceSlider) priceSlider.value = 1000;
              document.getElementById('price-max').textContent = '$1000+';
              document.getElementById('price-min').value = 0;
              document.getElementById('price-max-input').value = 1000;
              break;
          case 'inStock':
              this.filters.inStock = false;
              document.getElementById('in-stock-filter').checked = false;
              break;
          case 'search':
              this.filters.searchTerm = '';
              document.getElementById('search-input').value = '';
              document.getElementById('mobile-search').value = '';
              break;
      }
      
      this.applyFilters();
  }
  
  updateResultsCount() {
      const element = document.getElementById('results-count');
      if (element) {
          const total = this.filteredProducts.length;
          const start = Math.min((this.currentPage - 1) * this.productsPerPage + 1, total);
          const end = Math.min(this.currentPage * this.productsPerPage, total);
          
          element.textContent = total === 0 
              ? 'No products found' 
              : `Showing ${start}-${end} of ${total} products`;
      }
  }
  
  clearAllFilters() {
      console.log('Clearing all filters');
      // Reset all filters
      this.filters = {
          categories: [],
          priceRange: { min: 0, max: 500 },
          brands: [],
          ratings: [],
          inStock: false,
          searchTerm: ''
      };
      
      // Reset UI
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.checked = false;
      });
      
      // Check "All Categories"
      const allCheckbox = document.querySelector('.category-filter[value="all"]');
      if (allCheckbox) allCheckbox.checked = true;
      
      // Reset price slider
      const priceSlider = document.getElementById('price-slider');
      if (priceSlider) priceSlider.value = 500;
      document.getElementById('price-max').textContent = '$500+';
      document.getElementById('price-min').value = 0;
      document.getElementById('price-max-input').value = 500;
      
      // Reset search
      document.getElementById('search-input').value = '';
      document.getElementById('mobile-search').value = '';
      
      // Reset sort
      document.getElementById('sort-options').value = 'featured';
      this.sortBy = 'featured';
      
      // Reset page
      this.currentPage = 1;
      
      // Apply changes
      this.applyFilters();
  }
  
  checkUrlParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      
      if (category) {
          console.log('URL category parameter:', category);
          // Check the corresponding category checkbox
          const categoryCheckbox = document.querySelector(`.category-filter[value="${category}"]`);
          if (categoryCheckbox) {
              categoryCheckbox.checked = true;
              this.filters.categories.push(category);
              
              // Uncheck "All Categories"
              const allCheckbox = document.querySelector('.category-filter[value="all"]');
              if (allCheckbox) allCheckbox.checked = false;
              
              this.applyFilters();
          }
      }
  }
  
  capitalizeFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  showNoProductsMessage() {
      const container = document.getElementById('products-container');
      const noResults = document.getElementById('no-results');
      
      if (container) {
          container.innerHTML = '';
      }
      
      if (noResults) {
          noResults.classList.remove('hidden');
          noResults.innerHTML = `
              <i class="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
              <h3 class="text-xl font-bold mb-2">No products available</h3>
              <p class="text-gray-600 mb-6">Please check back later.</p>
          `;
      }
  }
  
  showErrorMessage(message) {
      const container = document.getElementById('products-container');
      if (container) {
          container.innerHTML = `
              <div class="col-span-full text-center py-12">
                  <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                  <h3 class="text-xl font-bold mb-2">Error Loading Products</h3>
                  <p class="text-gray-600 mb-6">${message}</p>
                  <button onclick="location.reload()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                      Try Again
                  </button>
              </div>
          `;
      }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Products page loaded, initializing ProductFilter...');
  window.productFilter = new ProductFilter();
});