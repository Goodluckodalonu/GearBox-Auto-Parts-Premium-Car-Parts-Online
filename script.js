// DOM Elements - with null checks
const featuredProductsContainer = document.getElementById('featured-products');
const cartCountElement = document.getElementById('cart-count');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');


// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');

    // Always update cart count first
    updateCartCount();

    // Only run featured products if we're on the homepage
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
        console.log('On homepage, loading featured products...');
        displayFeaturedProducts();
    }

    // Initialize mobile menu
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.innerHTML = isHidden
                ? '<i class="fas fa-bars"></i>'
                : '<i class="fas fa-times"></i>';
        });
    }

    // Initialize event listeners
    initializeEventListeners();

    // Initialize wishlist
    if (typeof Wishlist === 'function') {
        window.wishlist = new Wishlist();
    }
});

// Fetch products from JSON file
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
        return [];
    }
}

// Display featured products (only if container exists)
async function displayFeaturedProducts() {
    // Only run if we have the featured products container
    if (!featuredProductsContainer) {
        console.log('No featured products container found on this page');
        return;
    }

    console.log('Loading featured products...');

    try {
        const products = await fetchProducts();
        if (products.length === 0) {
            featuredProductsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">No products available at the moment.</p>
                </div>
            `;
            return;
        }

        const featuredProducts = products.filter(product => product.featured);

        // Clear loading skeleton
        featuredProductsContainer.innerHTML = '';

        if (featuredProducts.length === 0) {
            featuredProductsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-600">No featured products available.</p>
                </div>
            `;
            return;
        }

        console.log(`Displaying ${featuredProducts.length} featured products`);

        featuredProducts.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });

        // Make product cards clickable
        makeProductCardsClickable();

        // Initialize wishlist buttons for these products
        if (window.wishlist && typeof window.wishlist.initializeExistingButtons === 'function') {
            window.wishlist.initializeExistingButtons();
        }

    } catch (error) {
        console.error('Error displaying featured products:', error);
        featuredProductsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                <p class="text-gray-600">Error loading products. Please try again later.</p>
            </div>
        `;
    }
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1 product-card';
    card.setAttribute('data-id', product.id);

    // Determine heart icon state
    const isInWishlist = checkIfInWishlist(product.id);
    const heartIconClass = isInWishlist ? 'fas fa-heart text-accent' : 'far fa-heart';

    card.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            ${product.originalPrice ? `
                <span class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    -${Math.round((1 - product.price / product.originalPrice) * 100)}%
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
                    ${generateStarRating(product.rating)}
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
                        data-id="${product.id}" 
                        ${!product.inStock ? 'disabled' : ''}
                        aria-label="Add ${product.name} to cart">
                    <i class="fas fa-shopping-cart mr-2"></i> Add
                </button>
            </div>
        </div>
    `;

    return card;
}

// Check if product is in wishlist
function checkIfInWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.some(item => item.id === productId);
}

// Generate star rating HTML
function generateStarRating(rating) {
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

// CART FUNCTIONS

// Add product to cart
function addToCart(product) {
    console.log('Adding to cart:', product.name);

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
        console.log(`Increased quantity to ${existingItem.quantity}`);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        console.log('Added new item to cart');
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);

    // Update cart count in UI
    updateCartCount();

    // Show success message
    showNotification(`${product.name} added to cart!`, 'success');

    // Dispatch custom event for other parts of the app
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
}

// Update cart count display
function updateCartCount() {
    // Reload cart from localStorage to ensure we have the latest
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = currentCart.reduce((total, item) => total + (item.quantity || 1), 0);

    console.log('Updating cart count:', totalItems, 'items');

    // Update all cart count elements on the page
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        console.log('Updated cart count element:', element);
    });

    // Also update any elements with data-cart-count attribute
    document.querySelectorAll('[data-cart-count]').forEach(element => {
        element.textContent = totalItems;
    });
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Item removed from cart', 'info');

    // Dispatch event
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
}

// Clear entire cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Cart cleared', 'info');

    // Dispatch event
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ${type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' : 'bg-primary'
        } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Make product cards clickable
function makeProductCardsClickable() {
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

// Initialize event listeners for dynamic content
function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Event delegation for add-to-cart buttons
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();

            const productId = parseInt(addToCartBtn.dataset.id);
            console.log('Add to cart button clicked for product ID:', productId);

            if (productId) {
                // Fetch product and add to cart
                fetchProductAndAddToCart(productId);
            }
        }
    });

    // Listen for cart updates from other pages
    document.addEventListener('cartUpdated', (e) => {
        console.log('Cart updated event received:', e.detail);
        updateCartCount();
    });

    // Listen for storage events (updates from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            console.log('Storage event: cart updated from another tab');
            updateCartCount();
        }
    });
}

// Fetch product by ID and add to cart
async function fetchProductAndAddToCart(productId) {
    console.log('Fetching product', productId, 'to add to cart...');

    try {
        const products = await fetchProducts();
        const product = products.find(p => p.id === productId);

        if (product) {
            console.log('Found product:', product.name);
            addToCart(product);
        } else {
            console.error('Product not found with ID:', productId);
            showNotification('Product not found', 'error');
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        showNotification('Error adding to cart', 'error');
    }
}

// Wishlist System
class Wishlist {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        console.log('Wishlist initialized with', this.wishlist.length, 'items');
        this.init();
    }

    init() {
        // Update wishlist count
        this.updateWishlistCount();

        // Setup event delegation for wishlist buttons
        this.setupEventListeners();

        // Initialize existing wishlist buttons on page
        this.initializeExistingButtons();
    }

    setupEventListeners() {
        // Event delegation for dynamically added wishlist buttons
        document.addEventListener('click', (e) => {
            const wishlistBtn = e.target.closest('.wishlist-btn');
            if (wishlistBtn) {
                e.preventDefault();
                e.stopPropagation();

                const productId = parseInt(wishlistBtn.dataset.id);
                if (productId) {
                    this.toggleWishlist(productId, wishlistBtn);
                }
            }
        });

        // Also handle clicks on heart icon inside the button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-heart')) {
                const wishlistBtn = e.target.closest('.wishlist-btn');
                if (wishlistBtn) {
                    e.preventDefault();
                    e.stopPropagation();

                    const productId = parseInt(wishlistBtn.dataset.id);
                    if (productId) {
                        this.toggleWishlist(productId, wishlistBtn);
                    }
                }
            }
        });
    }

    initializeExistingButtons() {
        // Initialize all existing wishlist buttons on page load
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = parseInt(btn.dataset.id);
            if (productId && this.isInWishlist(productId)) {
                this.updateButtonState(btn, true);
            }
        });
    }

    async toggleWishlist(productId, buttonElement) {
        try {
            // Fetch product details
            const product = await this.getProductById(productId);

            if (this.isInWishlist(productId)) {
                // Remove from wishlist
                this.removeFromWishlist(productId);
                this.updateButtonState(buttonElement, false);
                this.showNotification(`${product.name} removed from wishlist`, 'info');
            } else {
                // Add to wishlist
                this.addToWishlist(product);
                this.updateButtonState(buttonElement, true);
                this.showNotification(`${product.name} added to wishlist!`, 'success');
            }

            // Update wishlist count
            this.updateWishlistCount();

        } catch (error) {
            console.error('Error toggling wishlist:', error);
            this.showNotification('Error updating wishlist', 'error');
        }
    }

    async getProductById(productId) {
        try {
            const products = await fetchProducts();
            const product = products.find(p => p.id === productId);

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    addToWishlist(product) {
        // Check if already in wishlist
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                brand: product.brand,
                addedAt: new Date().toISOString()
            });

            this.saveToLocalStorage();
        }
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveToLocalStorage();
    }

    updateButtonState(button, isInWishlist) {
        const icon = button.querySelector('i');
        if (icon) {
            if (isInWishlist) {
                icon.classList.remove('far');
                icon.classList.add('fas', 'text-accent');
                button.setAttribute('aria-label', 'Remove from wishlist');
            } else {
                icon.classList.remove('fas', 'text-accent');
                icon.classList.add('far');
                button.setAttribute('aria-label', 'Add to wishlist');
            }
        }
    }

    updateWishlistCount() {
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        const count = this.wishlist.length;

        wishlistCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    showNotification(message, type = 'info') {
        showNotification(message, type);
    }

    // Public methods to use from other parts of the app
    getWishlist() {
        return this.wishlist;
    }

    clearWishlist() {
        this.wishlist = [];
        this.saveToLocalStorage();
        this.updateWishlistCount();
        this.initializeExistingButtons();
    }
}

// Export functions for use in other files
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.showNotification = showNotification;

// Force update cart count on load (in case there's stale data)
setTimeout(() => {
    updateCartCount();
}, 100);