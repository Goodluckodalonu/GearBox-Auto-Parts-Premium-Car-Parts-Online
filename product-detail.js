// Product Detail Page Functionality
class ProductDetail {
  constructor() {
      this.productId = this.getProductIdFromUrl();
      this.product = null;
      this.recentlyViewedKey = 'recentlyViewed';
      this.init();
  }
  
  getProductIdFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      return id ? parseInt(id) : 1; // Default to first product if no ID
  }
  
  async init() {
      if (!this.productId) {
          this.showProductNotFound();
          return;
      }
      
      await this.loadProduct();
      this.displayProductDetails();
      this.setupEventListeners();
      this.loadRelatedProducts();
      this.loadRecentlyViewed();
      this.addToRecentlyViewed();
      this.updateCartCount();
  }
  
  async loadProduct() {
      try {
          const response = await fetch('products.json');
          const data = await response.json();
          this.product = data.products.find(p => p.id === this.productId);
          
          if (!this.product) {
              this.showProductNotFound();
              return;
          }
      } catch (error) {
          console.error('Error loading product:', error);
          this.showProductNotFound();
      }
  }
  
  displayProductDetails() {
      if (!this.product) return;
      
      // Hide loading, show content
      document.getElementById('product-loading').classList.add('hidden');
      document.getElementById('product-details').classList.remove('hidden');
      
      // Basic Info
      document.getElementById('product-name').textContent = this.product.name;
      document.getElementById('product-brand').textContent = this.product.brand;
      document.getElementById('product-category').textContent = this.capitalizeFirst(this.product.category);
      document.getElementById('product-description').textContent = this.product.description;
      document.getElementById('product-price').textContent = `$${this.product.price}`;
      
      // Original Price & Discount
      const originalPriceEl = document.getElementById('product-original-price');
      const discountEl = document.getElementById('product-discount');
      
      if (this.product.originalPrice) {
          originalPriceEl.textContent = `$${this.product.originalPrice}`;
          originalPriceEl.classList.remove('hidden');
          
          const discount = Math.round((1 - this.product.price / this.product.originalPrice) * 100);
          discountEl.textContent = `Save ${discount}%`;
          discountEl.classList.remove('hidden');
      } else {
          originalPriceEl.classList.add('hidden');
          discountEl.classList.add('hidden');
      }
      
      // Rating
      document.getElementById('product-rating').innerHTML = this.generateStarRating(this.product.rating);
      document.getElementById('product-reviews').textContent = `(${this.product.reviews} reviews)`;
      document.getElementById('review-count').textContent = this.product.reviews;
      document.getElementById('overall-rating').textContent = this.product.rating;
      document.getElementById('overall-stars').innerHTML = this.generateStarRating(this.product.rating);
      document.getElementById('total-reviews').textContent = this.product.reviews;
      
      // Stock Status
      const stockEl = document.getElementById('product-stock');
      if (this.product.inStock) {
          stockEl.innerHTML = '<i class="fas fa-check-circle mr-1"></i> In Stock';
          stockEl.className = 'text-green-600 font-medium';
      } else {
          stockEl.innerHTML = '<i class="fas fa-times-circle mr-1"></i> Out of Stock';
          stockEl.className = 'text-red-600 font-medium';
      }
      
      // Features
      const featuresContainer = document.getElementById('product-features');
      featuresContainer.innerHTML = this.product.features
          .map(feature => `<li class="flex items-center"><i class="fas fa-check text-green-600 mr-2"></i> ${feature}</li>`)
          .join('');
      
      // Images
      this.displayProductImages();
      
      // Specifications
      this.displayProductSpecs();
      
      // Reviews
      this.displayProductReviews();
      
      // Update page title
      document.title = `${this.product.name} | GearBox Auto Parts`;
  }
  
  // Replace the entire displayProductImages method:
displayProductImages() {
  const mainImage = document.getElementById('main-product-image');
  const thumbnailsContainer = document.getElementById('image-thumbnails');
  const zoomBtn = document.getElementById('zoom-button');
  
  if (!mainImage || !thumbnailsContainer) return;
  
  // Create array of images (in real app, would have multiple images)
  const images = [
      { src: this.product.image, alt: this.product.name },
      { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Product angle view' },
      { src: 'https://images.unsplash.com/photo-1563720223481-8f6d4f9c8c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Product close-up' },
      { src: 'https://images.unsplash.com/photo-1593941707882-a5bba533899f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Product packaging' }
  ];
  
  // Set main image
  mainImage.src = images[0].src;
  mainImage.alt = images[0].alt;
  
  // Create thumbnails
  thumbnailsContainer.innerHTML = images.map((img, index) => `
      <button class="thumbnail-btn flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary ${index === 0 ? 'border-primary' : ''}"
              data-image="${img.src}"
              data-alt="${img.alt}"
              data-index="${index}"
              aria-label="View image ${index + 1} of ${images.length}">
          <img src="${img.src}" alt="${img.alt}" class="w-full h-full object-cover">
      </button>
  `).join('');
  
  // Setup zoom functionality
  if (zoomBtn && mainImage) {
      zoomBtn.addEventListener('click', () => {
          this.showImageZoom(mainImage.src, mainImage.alt);
      });
      
      // Also allow clicking on main image
      mainImage.addEventListener('click', () => {
          this.showImageZoom(mainImage.src, mainImage.alt);
      });
  }
}

// Add this new method to the ProductDetail class:
showImageZoom(imageSrc, imageAlt) {
  // Create zoom overlay
  const zoomOverlay = document.createElement('div');
  zoomOverlay.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4';
  zoomOverlay.innerHTML = `
      <div class="relative max-w-4xl max-h-screen w-full h-full flex items-center justify-center">
          <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10" id="close-zoom">
              <i class="fas fa-times"></i>
          </button>
          <button class="absolute top-1/2 left-4 text-white text-3xl hover:text-gray-300 z-10 transform -translate-y-1/2" id="prev-image">
              <i class="fas fa-chevron-left"></i>
          </button>
          <button class="absolute top-1/2 right-4 text-white text-3xl hover:text-gray-300 z-10 transform -translate-y-1/2" id="next-image">
              <i class="fas fa-chevron-right"></i>
          </button>
          <img src="${imageSrc}" alt="${imageAlt}" class="max-w-full max-h-full object-contain">
      </div>
  `;
  
  document.body.appendChild(zoomOverlay);
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  // Close on X button
  document.getElementById('close-zoom').addEventListener('click', () => {
      document.body.removeChild(zoomOverlay);
      document.body.style.overflow = '';
  });
  
  // Close on background click
  zoomOverlay.addEventListener('click', (e) => {
      if (e.target === zoomOverlay) {
          document.body.removeChild(zoomOverlay);
          document.body.style.overflow = '';
      }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
      if (e.key === 'Escape') {
          document.body.removeChild(zoomOverlay);
          document.body.style.overflow = '';
          document.removeEventListener('keydown', handleEscape);
      }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Navigation between images (simplified - in real app would navigate through all product images)
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');
  
  if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Add image navigation logic here
      });
  }
  
  if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Add image navigation logic here
      });
  }
}
  
  displayProductSpecs() {
      const specsContainer = document.getElementById('product-specs');
      
      // Mock specifications based on category
      const specs = {
          engine: [
              { label: 'Material', value: 'High-grade ceramic' },
              { label: 'Temperature Range', value: '-40°F to 1200°F' },
              { label: 'Warranty', value: '2 years unlimited mileage' },
              { label: 'Installation Time', value: '1-2 hours' },
              { label: 'Weight', value: '8.5 lbs' },
              { label: 'Country of Origin', value: 'Germany' }
          ],
          brakes: [
              { label: 'Type', value: 'Ceramic' },
              { label: 'Wear Indicator', value: 'Yes' },
              { label: 'Dust Level', value: 'Low' },
              { label: 'Noise Level', value: 'Quiet' },
              { label: 'Fitment', value: 'Direct OE replacement' },
              { label: 'Package Contents', value: 'Full set (4 wheels)' }
          ],
          suspension: [
              { label: 'Type', value: 'Adjustable coilover' },
              { label: 'Adjustment Range', value: '1.5-3 inches' },
              { label: 'Construction', value: 'Monotube' },
              { label: 'Spring Rate', value: '8kg/mm front, 6kg/mm rear' },
              { label: 'Warranty', value: 'Lifetime' },
              { label: 'Installation', value: 'Professional recommended' }
          ],
          electrical: [
              { label: 'Power', value: '55W (equivalent to 500W halogen)' },
              { label: 'Color Temperature', value: '6000K' },
              { label: 'Lifespan', value: '50,000 hours' },
              { label: 'Waterproof Rating', value: 'IP67' },
              { label: 'Voltage Range', value: '9-32V DC' },
              { label: 'Certification', value: 'DOT, SAE approved' }
          ],
          interior: [
            { label: 'Material', value: 'Carbon fiber overlay with UV coating' },
            { label: 'Fitment', value: 'Direct OEM replacement, no cutting required' },
            { label: 'Finish', value: 'Gloss or matte finish available' },
            { label: 'Installation', value: '3M adhesive backing with alignment tabs' },
            { label: 'Temperature Resistance', value: '-30°C to 80°C (-22°F to 176°F)' },
            { label: 'Kit Includes', value: 'Dashboard, console, door panel trim' },
            { label: 'Warranty', value: 'Lifetime against peeling or discoloration' }
          ]
      };
      
      const categorySpecs = specs[this.product.category] || specs.engine;
      
      specsContainer.innerHTML = categorySpecs.map(spec => `
          <div class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-700">${spec.label}</span>
              <span class="text-gray-900">${spec.value}</span>
          </div>
      `).join('');
  }
  
  displayProductReviews() {
      const reviewsContainer = document.getElementById('reviews-list');
      
      // Mock reviews
      const reviews = [
          {
              name: 'Alex Johnson',
              rating: 5,
              date: '2024-01-15',
              verified: true,
              comment: 'Excellent performance! These brake pads stopped my car noticeably better than OEM. Low dust and no noise after 500 miles.',
              helpful: 24
          },
          {
              name: 'Mike Rodriguez',
              rating: 4,
              date: '2024-01-10',
              verified: true,
              comment: 'Good quality brake pads. Installation was straightforward. Only complaint is they squeak a little when cold.',
              helpful: 12
          },
          {
              name: 'Sarah Chen',
              rating: 5,
              date: '2024-01-05',
              verified: false,
              comment: 'Perfect upgrade for my daily driver. Noticeably better pedal feel and stopping power.',
              helpful: 8
          },
          {
              name: 'James Wilson',
              rating: 3,
              date: '2023-12-28',
              verified: true,
              comment: 'Decent performance but wears faster than expected. Lasted about 30,000 miles on my SUV.',
              helpful: 5
          }
      ];
      
      reviewsContainer.innerHTML = reviews.map(review => `
          <div class="border-b pb-6">
              <div class="flex justify-between items-start mb-3">
                  <div>
                      <div class="flex items-center mb-1">
                          <div class="flex text-yellow-400">
                              ${this.generateStarRating(review.rating)}
                          </div>
                          <span class="text-sm text-gray-600 ml-2">${review.rating}.0</span>
                      </div>
                      <p class="font-medium">${review.name}</p>
                      <div class="flex items-center text-sm text-gray-600">
                          <span>${review.date}</span>
                          ${review.verified ? `
                              <span class="mx-2">•</span>
                              <span class="text-green-600">
                                  <i class="fas fa-check-circle mr-1"></i> Verified Purchase
                              </span>
                          ` : ''}
                      </div>
                  </div>
                  <button class="text-gray-400 hover:text-primary">
                      <i class="far fa-flag"></i>
                  </button>
              </div>
              <p class="text-gray-700 mb-3">${review.comment}</p>
              <div class="flex items-center justify-between">
                  <button class="text-sm text-gray-600 hover:text-primary flex items-center">
                      <i class="far fa-thumbs-up mr-2"></i>
                      Helpful (${review.helpful})
                  </button>
                  <div class="text-sm text-gray-500">
                      Was this review helpful?
                  </div>
              </div>
          </div>
      `).join('');
  }
  
  async loadRelatedProducts() {
      const container = document.getElementById('related-products');
      if (!container) return;
      
      try {
          const response = await fetch('products.json');
          const data = await response.json();
          
          // Get products from same category (excluding current product)
          const related = data.products
              .filter(p => p.category === this.product.category && p.id !== this.product.id)
              .slice(0, 4);
          
          if (related.length === 0) {
              container.innerHTML = '<p class="text-gray-600 col-span-full text-center py-8">No related products found.</p>';
              return;
          }
          
          container.innerHTML = related.map(product => this.createProductCard(product)).join('');
          
          // Add event listeners to new cards
          this.addProductCardEventListeners();
      } catch (error) {
          console.error('Error loading related products:', error);
      }
  }
  
  loadRecentlyViewed() {
      const container = document.getElementById('recently-viewed');
      if (!container) return;
      
      const recentlyViewed = JSON.parse(localStorage.getItem(this.recentlyViewedKey)) || [];
      
      if (recentlyViewed.length === 0) {
          container.innerHTML = '<p class="text-gray-600 col-span-full text-center py-8">No recently viewed products.</p>';
          return;
      }
      
      // Filter out current product and limit to 4
      const filtered = recentlyViewed
          .filter(id => id !== this.productId)
          .slice(0, 4);
      
      if (filtered.length === 0) {
          container.innerHTML = '<p class="text-gray-600 col-span-full text-center py-8">No recently viewed products.</p>';
          return;
      }
      
      // Load product details for each ID
      this.loadProductsByIds(filtered, container);
  }
  
  async loadProductsByIds(ids, container) {
      try {
          const response = await fetch('products.json');
          const data = await response.json();
          
          const products = ids
              .map(id => data.products.find(p => p.id === id))
              .filter(p => p); // Remove undefined
          
          container.innerHTML = products.map(product => this.createProductCard(product)).join('');
          
          // Add event listeners
          this.addProductCardEventListeners();
      } catch (error) {
          console.error('Error loading recently viewed:', error);
      }
  }
  
  createProductCard(product) {
      return `
          <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1 product-card" data-id="${product.id}">
              <div class="relative">
                  <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                  ${product.originalPrice ? `
                      <span class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                          -${Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                  ` : ''}
              </div>
              <div class="p-4">
                  <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">${product.brand}</span>
                  <h3 class="font-bold text-lg mt-2 mb-1">${product.name}</h3>
                  <div class="flex items-center mb-3">
                      <div class="flex text-yellow-400">
                          ${this.generateStarRating(product.rating)}
                      </div>
                      <span class="text-sm text-gray-600 ml-2">(${product.reviews})</span>
                  </div>
                  <div class="flex items-center justify-between">
                      <div>
                          <span class="text-xl font-bold text-dark">$${product.price}</span>
                          ${product.originalPrice ? `
                              <span class="text-gray-500 line-through ml-2 text-sm">$${product.originalPrice}</span>
                          ` : ''}
                      </div>
                      <button class="quick-add-btn bg-primary text-white w-10 h-10 rounded-lg hover:bg-blue-800 flex items-center justify-center" data-id="${product.id}">
                          <i class="fas fa-cart-plus"></i>
                      </button>
                  </div>
              </div>
          </div>
      `;
  }
  
  addProductCardEventListeners() {
      // Product card clicks
      document.querySelectorAll('.product-card').forEach(card => {
          card.addEventListener('click', (e) => {
              if (!e.target.closest('.quick-add-btn')) {
                  const productId = card.dataset.id;
                  window.location.href = `product-detail.html?id=${productId}`;
              }
          });
      });
      
      // Quick add buttons
      document.querySelectorAll('.quick-add-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const productId = parseInt(btn.dataset.id);
              
              try {
                  const response = await fetch('products.json');
                  const data = await response.json();
                  const product = data.products.find(p => p.id === productId);
                  
                  if (product && window.addToCart) {
                      window.addToCart(product);
                  }
              } catch (error) {
                  console.error('Error adding product:', error);
              }
          });
      });
  }
  
  addToRecentlyViewed() {
      if (!this.productId) return;
      
      let recentlyViewed = JSON.parse(localStorage.getItem(this.recentlyViewedKey)) || [];
      
      // Remove if already exists
      recentlyViewed = recentlyViewed.filter(id => id !== this.productId);
      
      // Add to beginning
      recentlyViewed.unshift(this.productId);
      
      // Keep only last 10
      recentlyViewed = recentlyViewed.slice(0, 10);
      
      localStorage.setItem(this.recentlyViewedKey, JSON.stringify(recentlyViewed));
  }
  
  setupEventListeners() {
      // Image thumbnails
      document.querySelectorAll('.thumbnail-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const imageSrc = e.currentTarget.dataset.image;
              const mainImage = document.getElementById('main-product-image');
              
              // Update main image
              mainImage.src = imageSrc;
              
              // Update active thumbnail
              document.querySelectorAll('.thumbnail-btn').forEach(tb => {
                  tb.classList.remove('border-primary');
              });
              e.currentTarget.classList.add('border-primary');
          });
      });
      
      // Zoom button
      const zoomBtn = document.getElementById('zoom-button');
      const mainImage = document.getElementById('main-product-image');
      
 
      
      // Quantity controls
      const quantityInput = document.getElementById('quantity-input');
      const decreaseBtn = document.getElementById('quantity-decrease');
      const increaseBtn = document.getElementById('quantity-increase');
      
      if (decreaseBtn) {
          decreaseBtn.addEventListener('click', () => {
              const current = parseInt(quantityInput.value) || 1;
              if (current > 1) {
                  quantityInput.value = current - 1;
              }
          });
      }
      
      if (increaseBtn) {
          increaseBtn.addEventListener('click', () => {
              const current = parseInt(quantityInput.value) || 1;
              quantityInput.value = current + 1;
          });
      }
      
      if (quantityInput) {
          quantityInput.addEventListener('change', () => {
              let value = parseInt(quantityInput.value) || 1;
              if (value < 1) value = 1;
              if (value > 99) value = 99;
              quantityInput.value = value;
          });
      }
      
      // Add to cart button
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      if (addToCartBtn) {
          addToCartBtn.addEventListener('click', () => {
              const quantity = parseInt(quantityInput.value) || 1;
              
              if (window.addToCart) {
                  // Add multiple quantities
                  for (let i = 0; i < quantity; i++) {
                      window.addToCart(this.product);
                  }
                  
                  // Show notification
                  this.showNotification(`${quantity} ${this.product.name} added to cart!`, 'success');
              }
          });
      }
      
      // Buy now button
      const buyNowBtn = document.getElementById('buy-now-btn');
      if (buyNowBtn) {
          buyNowBtn.addEventListener('click', () => {
              const quantity = parseInt(quantityInput.value) || 1;
              
              if (window.addToCart) {
                  // Clear cart and add this product
                  window.shoppingCart?.clearCart?.();
                  
                  for (let i = 0; i < quantity; i++) {
                      window.addToCart(this.product);
                  }
                  
                  // Redirect to checkout
                  window.location.href = 'cart.html';
              }
          });
      }
      
      // Tab navigation
      document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const tabId = e.currentTarget.dataset.tab;
              this.switchTab(tabId);
          });
      });
      
      // FAQ toggles
      document.querySelectorAll('.faq-question').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const answer = e.currentTarget.nextElementSibling;
              const icon = e.currentTarget.querySelector('i');
              
              answer.classList.toggle('hidden');
              icon.classList.toggle('rotate-180');
          });
      });
      
      // Write review button
      const writeReviewBtn = document.getElementById('write-review-btn');
      if (writeReviewBtn) {
          writeReviewBtn.addEventListener('click', () => {
              this.showReviewModal();
          });
      }
      
      // Wishlist button
      const wishlistBtn = document.getElementById('wishlist-btn');
      if (wishlistBtn) {
          wishlistBtn.addEventListener('click', () => {
              this.toggleWishlist();
          });
      }
      
      // Clear recently viewed
      const clearBtn = document.getElementById('clear-recently-viewed');
      if (clearBtn) {
          clearBtn.addEventListener('click', () => {
              localStorage.removeItem(this.recentlyViewedKey);
              this.loadRecentlyViewed();
          });
      }
      
      // Mobile menu
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuBtn && mobileMenu) {
          mobileMenuBtn.addEventListener('click', () => {
              mobileMenu.classList.toggle('hidden');
              mobileMenuBtn.innerHTML = mobileMenu.classList.contains('hidden') 
                  ? '<i class="fas fa-bars"></i>' 
                  : '<i class="fas fa-times"></i>';
          });
      }
  }
  
  switchTab(tabId) {
      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(btn => {
          if (btn.dataset.tab === tabId) {
              btn.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
              btn.classList.remove('text-gray-600');
          } else {
              btn.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary');
              btn.classList.add('text-gray-600');
          }
      });
      
      // Show active tab content
      document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.add('hidden');
      });
      
      const activeTab = document.getElementById(`${tabId}-tab`);
      if (activeTab) {
          activeTab.classList.remove('hidden');
      }
  }
  
  toggleWishlist() {
      const wishlistBtn = document.getElementById('wishlist-btn');
      const icon = wishlistBtn.querySelector('i');
      const text = wishlistBtn.querySelector('span') || wishlistBtn;
      
      let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      
      if (wishlist.includes(this.productId)) {
          // Remove from wishlist
          wishlist = wishlist.filter(id => id !== this.productId);
          icon.classList.remove('fas', 'text-accent');
          icon.classList.add('far');
          text.textContent = 'Add to Wishlist';
          this.showNotification('Removed from wishlist', 'info');
      } else {
          // Add to wishlist
          wishlist.push(this.productId);
          icon.classList.remove('far');
          icon.classList.add('fas', 'text-accent');
          text.textContent = 'Added to Wishlist';
          this.showNotification('Added to wishlist!', 'success');
      }
      
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
  
  showReviewModal() {
      // Create modal HTML
      const modalHTML = `
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div class="p-6">
                      <div class="flex justify-between items-center mb-6">
                          <h3 class="text-xl font-bold">Write a Review</h3>
                          <button id="close-review-modal" class="text-gray-400 hover:text-gray-600">
                              <i class="fas fa-times text-2xl"></i>
                          </button>
                      </div>
                      
                      <div class="space-y-4">
                          <div>
                              <label class="block text-sm font-medium mb-2">Rating</label>
                              <div class="flex space-x-2" id="review-stars">
                                  ${[1,2,3,4,5].map(i => `
                                      <button class="review-star text-2xl text-gray-300 hover:text-yellow-400" data-rating="${i}">
                                          <i class="far fa-star"></i>
                                      </button>
                                  `).join('')}
                              </div>
                          </div>
                          
                          <div>
                              <label class="block text-sm font-medium mb-2">Title</label>
                              <input type="text" id="review-title" 
                                     class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                     placeholder="Brief summary of your review">
                          </div>
                          
                          <div>
                              <label class="block text-sm font-medium mb-2">Review</label>
                              <textarea id="review-content" rows="4"
                                        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Share your experience with this product"></textarea>
                          </div>
                          
                          <div>
                              <label class="block text-sm font-medium mb-2">Name</label>
                              <input type="text" id="reviewer-name" 
                                     class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                     placeholder="Your name">
                          </div>
                          
                          <div class="flex items-center">
                              <input type="checkbox" id="verified-purchase" class="mr-2">
                              <label for="verified-purchase" class="text-sm">I purchased this product</label>
                          </div>
                      </div>
                      
                      <div class="flex space-x-3 mt-6">
                          <button id="submit-review" class="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-800">
                              Submit Review
                          </button>
                          <button id="cancel-review" class="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50">
                              Cancel
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      `;
      
      // Add modal to body
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer);
      
      // Setup modal event listeners
      this.setupReviewModalListeners(modalContainer);
  }
  
  setupReviewModalListeners(modalContainer) {
      let selectedRating = 0;
      
      // Star rating
      modalContainer.querySelectorAll('.review-star').forEach(star => {
          star.addEventListener('click', (e) => {
              const rating = parseInt(e.currentTarget.dataset.rating);
              selectedRating = rating;
              
              // Update stars display
              modalContainer.querySelectorAll('.review-star').forEach((s, index) => {
                  const icon = s.querySelector('i');
                  if (index < rating) {
                      icon.classList.remove('far', 'text-gray-300');
                      icon.classList.add('fas', 'text-yellow-400');
                  } else {
                      icon.classList.remove('fas', 'text-yellow-400');
                      icon.classList.add('far', 'text-gray-300');
                  }
              });
          });
      });
      
      // Close buttons
      const closeBtn = modalContainer.querySelector('#close-review-modal');
      const cancelBtn = modalContainer.querySelector('#cancel-review');
      
      const closeModal = () => modalContainer.remove();
      
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
      
      // Submit button
      const submitBtn = modalContainer.querySelector('#submit-review');
      if (submitBtn) {
          submitBtn.addEventListener('click', () => {
              if (selectedRating === 0) {
                  alert('Please select a rating');
                  return;
              }
              
              const title = modalContainer.querySelector('#review-title').value;
              const content = modalContainer.querySelector('#review-content').value;
              const name = modalContainer.querySelector('#reviewer-name').value || 'Anonymous';
              
              // In a real app, you would send this to a server
              console.log('Review submitted:', { title, content, name, rating: selectedRating });
              
              this.showNotification('Review submitted! Thank you for your feedback.', 'success');
              closeModal();
          });
      }
      
      // Close on background click
      modalContainer.addEventListener('click', (e) => {
          if (e.target === modalContainer) {
              closeModal();
          }
      });
  }
  
  showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ${
          type === 'success' ? 'bg-green-500' : 'bg-primary'
      } text-white`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => notification.remove(), 300);
      }, 3000);
  }
  
  showProductNotFound() {
      document.getElementById('product-loading').classList.add('hidden');
      document.getElementById('product-not-found').classList.remove('hidden');
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
  
  capitalizeFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  updateCartCount() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
          element.textContent = totalItems;
      });
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.productDetail = new ProductDetail();
});