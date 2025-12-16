// Wishlist Page Functionality
class WishlistPage {
  constructor() {
      this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      this.init();
  }
  
  init() {
      this.displayWishlist();
      this.setupEventListeners();
      this.updateWishlistCount();
  }
  
  displayWishlist() {
      const container = document.getElementById('wishlist-items');
      const emptyMessage = document.getElementById('empty-wishlist');
      const actions = document.getElementById('wishlist-actions');
      const countElement = document.getElementById('wishlist-count');
      
      if (!container) return;
      
      if (this.wishlist.length === 0) {
          if (emptyMessage) emptyMessage.classList.remove('hidden');
          if (actions) actions.classList.add('hidden');
          container.innerHTML = '';
          return;
      }
      
      if (emptyMessage) emptyMessage.classList.add('hidden');
      if (actions) actions.classList.remove('hidden');
      if (countElement) countElement.textContent = `${this.wishlist.length} item${this.wishlist.length !== 1 ? 's' : ''} in wishlist`;
      
      container.innerHTML = '';
      
      this.wishlist.forEach(item => {
          const wishlistItem = this.createWishlistItem(item);
          container.appendChild(wishlistItem);
      });
  }
  
  createWishlistItem(item) {
      const div = document.createElement('div');
      div.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1';
      div.innerHTML = `
          <div class="relative">
              <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
              <button class="wishlist-btn absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-accent hover:text-white transition" 
                      data-id="${item.id}">
                  <i class="fas fa-heart text-accent hover:text-white"></i>
              </button>
          </div>
          <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                  <div>
                      <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">${item.brand}</span>
                      <h3 class="font-bold text-lg mt-2">${item.name}</h3>
                  </div>
              </div>
              
              <div class="flex items-center justify-between mt-4">
                  <div>
                      <span class="text-2xl font-bold text-dark">$${item.price}</span>
                      <p class="text-sm text-gray-600">Added ${this.formatDate(item.addedAt)}</p>
                  </div>
                  <div class="flex space-x-2">
                      <button class="remove-from-wishlist-btn bg-gray-100 text-gray-700 w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center" 
                              data-id="${item.id}" title="Remove">
                          <i class="fas fa-trash"></i>
                      </button>
                      <button class="add-to-cart-from-wishlist-btn bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center" 
                              data-id="${item.id}">
                          <i class="fas fa-cart-plus mr-2"></i> Add to Cart
                      </button>
                  </div>
              </div>
          </div>
      `;
      
      return div;
  }
  
  formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
          return 'today';
      } else if (diffDays === 1) {
          return 'yesterday';
      } else if (diffDays < 7) {
          return `${diffDays} days ago`;
      } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      } else {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
  }
  
  setupEventListeners() {
      // Event delegation for all wishlist buttons
      document.addEventListener('click', (e) => {
          // Remove from wishlist button
          const removeBtn = e.target.closest('.remove-from-wishlist-btn');
          if (removeBtn) {
              e.preventDefault();
              e.stopPropagation();
              
              const productId = parseInt(removeBtn.dataset.id);
              if (productId) {
                  this.removeItem(productId);
              }
          }
          
          // Add to cart from wishlist button
          const addToCartBtn = e.target.closest('.add-to-cart-from-wishlist-btn');
          if (addToCartBtn) {
              e.preventDefault();
              e.stopPropagation();
              
              const productId = parseInt(addToCartBtn.dataset.id);
              if (productId) {
                  this.addToCart(productId);
              }
          }
          
          // Wishlist heart button (to toggle)
          const wishlistBtn = e.target.closest('.wishlist-btn');
          if (wishlistBtn) {
              e.preventDefault();
              e.stopPropagation();
              
              const productId = parseInt(wishlistBtn.dataset.id);
              if (productId) {
                  this.removeItem(productId);
              }
          }
      });
      
      // Clear wishlist button
      const clearBtn = document.getElementById('clear-wishlist');
      if (clearBtn) {
          clearBtn.addEventListener('click', () => {
              this.clearWishlist();
          });
      }
      
      // Add all to cart button
      const addAllBtn = document.getElementById('add-all-to-cart');
      if (addAllBtn) {
          addAllBtn.addEventListener('click', () => {
              this.addAllToCart();
          });
      }
  }
  
  async removeItem(productId) {
      // Remove from wishlist
      this.wishlist = this.wishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      
      // Update display
      this.displayWishlist();
      this.updateWishlistCount();
      
      // Update global wishlist
      if (window.wishlist) {
          window.wishlist.updateWishlistCount();
          window.wishlist.initializeExistingButtons();
      }
      
      // Show notification
      this.showNotification('Item removed from wishlist', 'info');
  }
  
  async addToCart(productId) {
      try {
          // Fetch product details
          const response = await fetch('products.json');
          const data = await response.json();
          const product = data.products.find(p => p.id === productId);
          
          if (!product) {
              throw new Error('Product not found');
          }
          
          // Add to cart
          if (window.addToCart) {
              window.addToCart(product);
              this.showNotification(`${product.name} added to cart!`, 'success');
          }
          
      } catch (error) {
          console.error('Error adding to cart:', error);
          this.showNotification('Error adding item to cart', 'error');
      }
  }
  
  async addAllToCart() {
      if (this.wishlist.length === 0) return;
      
      try {
          // Fetch all products
          const response = await fetch('products.json');
          const data = await response.json();
          
          let addedCount = 0;
          
          // Add each wishlist item to cart
          for (const wishlistItem of this.wishlist) {
              const product = data.products.find(p => p.id === wishlistItem.id);
              if (product && window.addToCart) {
                  window.addToCart(product);
                  addedCount++;
              }
          }
          
          if (addedCount > 0) {
              this.showNotification(`${addedCount} item${addedCount !== 1 ? 's' : ''} added to cart!`, 'success');
              
              // Optionally clear wishlist after adding to cart
              // this.clearWishlist();
          }
          
      } catch (error) {
          console.error('Error adding all to cart:', error);
          this.showNotification('Error adding items to cart', 'error');
      }
  }
  
  clearWishlist() {
      if (this.wishlist.length === 0) return;
      
      if (confirm('Are you sure you want to clear your wishlist?')) {
          this.wishlist = [];
          localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
          
          this.displayWishlist();
          this.updateWishlistCount();
          
          // Update global wishlist
          if (window.wishlist) {
              window.wishlist.updateWishlistCount();
              window.wishlist.initializeExistingButtons();
          }
          
          this.showNotification('Wishlist cleared', 'info');
      }
  }
  
  updateWishlistCount() {
      const count = this.wishlist.length;
      const wishlistCountElements = document.querySelectorAll('.wishlist-count');
      
      wishlistCountElements.forEach(element => {
          element.textContent = count;
      });
  }
  
  showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ${
          type === 'success' ? 'bg-green-500' : 
          type === 'error' ? 'bg-red-500' : 'bg-primary'
      } text-white`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => notification.remove(), 300);
      }, 3000);
  }
}

// Initialize wishlist page when loaded
document.addEventListener('DOMContentLoaded', () => {
  window.wishlistPage = new WishlistPage();
});   