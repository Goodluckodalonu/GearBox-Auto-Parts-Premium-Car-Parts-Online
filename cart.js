// Cart class to manage cart operations
class ShoppingCart {
  constructor() {
      this.cart = JSON.parse(localStorage.getItem('cart')) || [];
      this.initCartPage();
  }
  
  // Initialize cart page if we're on cart.html
  initCartPage() {
      if (window.location.pathname.includes('cart.html')) {
          this.displayCartItems();
          this.setupEventListeners();
      }
  }
  
  // Display all cart items
  displayCartItems() {
      const cartContainer = document.getElementById('cart-items');
      const emptyCartMessage = document.getElementById('empty-cart');
      const cartTotalElement = document.getElementById('cart-total');
      const subtotalElement = document.getElementById('subtotal');
      
      if (!cartContainer) return;
      
      if (this.cart.length === 0) {
          if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
          if (cartTotalElement) cartTotalElement.classList.add('hidden');
          cartContainer.innerHTML = '';
          return;
      }
      
      if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
      if (cartTotalElement) cartTotalElement.classList.remove('hidden');
      
      cartContainer.innerHTML = '';
      
      this.cart.forEach(item => {
          const cartItem = this.createCartItemElement(item);
          cartContainer.appendChild(cartItem);
      });
      
      this.updateCartTotals();
  }
  
  // Create cart item HTML element
  createCartItemElement(item) {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex flex-col md:flex-row items-center border-b py-6';
      itemElement.innerHTML = `
          <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden mb-4 md:mb-0">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          
          <div class="flex-grow px-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between">
                  <div class="mb-4 md:mb-0">
                      <h3 class="font-bold text-lg">${item.name}</h3>
                      <p class="text-gray-600">${item.brand}</p>
                      <div class="mt-2">
                          <span class="font-bold text-primary text-xl">$${item.price}</span>
                          ${item.originalPrice ? `
                              <span class="text-gray-500 line-through ml-2">$${item.originalPrice}</span>
                          ` : ''}
                      </div>
                  </div>
                  
                  <div class="flex items-center">
                      <div class="flex items-center border rounded-lg">
                          <button class="quantity-btn decrease w-10 h-10 flex items-center justify-center hover:bg-gray-100" data-id="${item.id}">
                              <i class="fas fa-minus"></i>
                          </button>
                          <span class="quantity w-12 text-center font-semibold">${item.quantity}</span>
                          <button class="quantity-btn increase w-10 h-10 flex items-center justify-center hover:bg-gray-100" data-id="${item.id}">
                              <i class="fas fa-plus"></i>
                          </button>
                      </div>
                      
                      <button class="remove-btn ml-6 text-red-500 hover:text-red-700" data-id="${item.id}">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
          </div>
      `;
      
      return itemElement;
  }
  
  // Update cart totals
  updateCartTotals() {
      const subtotalElement = document.getElementById('subtotal');
      const shippingElement = document.getElementById('shipping');
      const totalElement = document.getElementById('total');
      
      if (!subtotalElement) return;
      
      const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 100 ? 0 : 9.99;
      const total = subtotal + shipping;
      
      subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
      shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
      totalElement.textContent = `$${total.toFixed(2)}`;
      
      this.updateHeaderCartCount();
  }
  
  // Update header cart count
  updateHeaderCartCount() {
      const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
      const cartCountElements = document.querySelectorAll('.cart-count');
      
      cartCountElements.forEach(element => {
          element.textContent = totalItems;
      });
      
      localStorage.setItem('cart', JSON.stringify(this.cart));
  }
  
  // Setup event listeners for cart page
  setupEventListeners() {
      // Delegate events for quantity buttons and remove buttons
      document.addEventListener('click', (e) => {
          const target = e.target.closest('.quantity-btn') || e.target.closest('.remove-btn');
          
          if (!target) return;
          
          const productId = parseInt(target.dataset.id);
          
          if (target.closest('.decrease')) {
              this.updateQuantity(productId, -1);
          } else if (target.closest('.increase')) {
              this.updateQuantity(productId, 1);
          } else if (target.closest('.remove-btn')) {
              this.removeItem(productId);
          }
      });
      
      // Clear cart button
      const clearCartBtn = document.getElementById('clear-cart');
      if (clearCartBtn) {
          clearCartBtn.addEventListener('click', () => this.clearCart());
      }
      
      // Checkout button
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
          checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
      }
  }
  
  // Update item quantity
  updateQuantity(productId, change) {
      const itemIndex = this.cart.findIndex(item => item.id === productId);
      
      if (itemIndex !== -1) {
          this.cart[itemIndex].quantity += change;
          
          // Remove item if quantity is 0 or less
          if (this.cart[itemIndex].quantity <= 0) {
              this.cart.splice(itemIndex, 1);
          }
          
          this.displayCartItems();
          this.updateHeaderCartCount();
      }
  }
  
  // Remove item from cart
  removeItem(productId) {
      this.cart = this.cart.filter(item => item.id !== productId);
      this.displayCartItems();
      this.updateHeaderCartCount();
  }
  
  // Clear entire cart
  clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
          this.cart = [];
          localStorage.removeItem('cart');
          this.displayCartItems();
          this.updateHeaderCartCount();
      }
  }
  
  // Proceed to checkout
  proceedToCheckout() {
      if (this.cart.length === 0) {
          alert('Your cart is empty!');
          return;
      }
      
      alert(`Proceeding to checkout with ${this.cart.length} item(s). Total: $${this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`);
      
      // this.clearCart();
      window.location.href = 'checkout.html';
  }
  
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.shoppingCart = new ShoppingCart();
  console.log('started:ShoppingCart')
});