// Checkout System with Multi-Step Form & Validation
class CheckoutSystem {
  constructor() {
      this.currentStep = 1;
      this.totalSteps = 3;
      this.cart = [];
      this.formData = {};
      this.shippingCost = 9.99;
      this.taxRate = 0.08; // 8% tax
      
      console.log('CheckoutSystem initialized');
      this.init();
  }
  
  init() {
      this.loadCart();
      this.setupEventListeners();
      this.updateOrderSummary();
      this.updateProgressBar();
      this.setupFormValidation();
  }
  
  loadCart() {
      this.cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      console.log('Cart loaded:', this.cart.length, 'items');
      
      if (this.cart.length === 0) {
          this.showEmptyCartMessage();
      } else {
          this.showCheckoutForm();
          this.loadCheckoutItems();
      }
  }
  
  showEmptyCartMessage() {
      const emptyMessage = document.getElementById('empty-cart-message');
      const formContainer = document.getElementById('checkout-form-container');
      
      if (emptyMessage) {
          emptyMessage.classList.remove('hidden');
      }
      if (formContainer) {
          formContainer.classList.add('hidden');
      }
  }
  
  showCheckoutForm() {
      const emptyMessage = document.getElementById('empty-cart-message');
      const formContainer = document.getElementById('checkout-form-container');
      
      if (emptyMessage) {
          emptyMessage.classList.add('hidden');
      }
      if (formContainer) {
          formContainer.classList.remove('hidden');
      }
  }
  
  loadCheckoutItems() {
      const container = document.getElementById('checkout-items');
      const summaryContainer = document.getElementById('order-summary-items');
      
      if (!container || !summaryContainer) {
          console.error('Checkout containers not found');
          return;
      }
      
      // Clear containers
      container.innerHTML = '';
      summaryContainer.innerHTML = '';
      
      // Calculate totals
      let subtotal = 0;
      
      this.cart.forEach(item => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;
          
          // Detailed item for checkout items
          const itemHTML = `
              <div class="flex items-center border-b pb-4">
                  <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden mb-4 md:mb-0">
                      <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                  </div>
                  <div class="ml-4 flex-1">
                      <div class="flex justify-between">
                          <div>
                              <h4 class="font-medium">${item.name}</h4>
                              <p class="text-sm text-gray-600">${item.brand}</p>
                          </div>
                          <span class="font-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div class="flex justify-between items-center mt-2">
                          <span class="text-sm text-gray-600">Quantity: ${item.quantity}</span>
                          <span class="text-sm">$${item.price} each</span>
                      </div>
                  </div>
              </div>
          `;
          
          // Summary item for order summary
          const summaryHTML = `
              <div class="flex justify-between items-center">
                  <div>
                      <span class="font-medium">${item.name}</span>
                      <span class="text-gray-600 text-sm ml-2">×${item.quantity}</span>
                  </div>
                  <span class="font-medium">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
          `;
          
          container.innerHTML += itemHTML;
          summaryContainer.innerHTML += summaryHTML;
      });
      
      // Update totals
      this.updateTotals(subtotal);
  }
  
  updateTotals(subtotal) {
      // Calculate shipping (free over $100)
      this.shippingCost = subtotal >= 100 ? 0 : 9.99;
      
      // Calculate tax
      const tax = subtotal * this.taxRate;
      
      // Calculate total
      const total = subtotal + this.shippingCost + tax;
      
      // Update order summary
      const subtotalEl = document.getElementById('summary-subtotal');
      const shippingEl = document.getElementById('summary-shipping');
      const taxEl = document.getElementById('summary-tax');
      const totalEl = document.getElementById('summary-total');
      
      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      if (shippingEl) shippingEl.textContent = this.shippingCost === 0 ? 'FREE' : `$${this.shippingCost.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
      
      // Update shipping method options
      this.updateShippingOptions(subtotal);
  }
  
  updateShippingOptions(subtotal) {
      const freeShippingOption = document.querySelector('input[value="free"]');
      const freeShippingLabel = freeShippingOption?.closest('label');
      
      if (freeShippingLabel && subtotal >= 100) {
          freeShippingLabel.classList.remove('opacity-50', 'cursor-not-allowed');
          if (freeShippingOption) freeShippingOption.disabled = false;
      } else if (freeShippingLabel) {
          freeShippingLabel.classList.add('opacity-50', 'cursor-not-allowed');
          if (freeShippingOption) freeShippingOption.disabled = true;
      }
  }
  
// Replace the entire updateProgressUI method and related progress bar methods:

updateProgressBar() {
  // Update step indicators
  const steps = document.querySelectorAll('.checkout-step');
  steps.forEach((step, index) => {
      if (index + 1 === this.currentStep) {
          step.classList.remove('hidden');
      } else {
          step.classList.add('hidden');
      }
  });
  
  // Update progress bar UI
  this.updateProgressUI();
  
  // Update step description
  this.updateStepDescription();
}

updateProgressUI() {
  // Get all step circles and connectors
  const stepCircles = document.querySelectorAll('.step-circle');
  const stepConnectors = document.querySelectorAll('.step-connector');
  const stepTexts = document.querySelectorAll('.flex.items-center p:last-child');
  
  // Reset all steps
  stepCircles.forEach((circle, index) => {
      const stepNumber = index + 1;
      
      if (stepNumber < this.currentStep) {
          // Completed step
          circle.className = 'step-circle flex items-center justify-center w-10 h-10 rounded-full border-2 border-green-500 bg-green-500 text-white font-bold transition-all duration-300';
          circle.innerHTML = '<i class="fas fa-check text-sm"></i>';
          
          // Update connector before this step
          if (index > 0 && stepConnectors[index - 1]) {
              stepConnectors[index - 1].className = 'step-connector flex-1 h-1 bg-green-500 mx-6 max-w-16 transition-all duration-300';
          }
          
          // Update text
          if (stepTexts[index]) {
              stepTexts[index].className = 'font-medium text-green-600';
          }
          
      } else if (stepNumber === this.currentStep) {
          // Current step
          circle.className = 'step-circle flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary bg-primary text-white font-bold transition-all duration-300';
          circle.textContent = stepNumber;
          
          // Update connector before this step if it exists
          if (index > 0 && stepConnectors[index - 1]) {
              stepConnectors[index - 1].className = 'step-connector flex-1 h-1 bg-green-500 mx-6 max-w-16 transition-all duration-300';
          }
          
          // Update text
          if (stepTexts[index]) {
              stepTexts[index].className = 'font-medium text-primary';
          }
          
      } else {
          // Future step
          circle.className = 'step-circle flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-500 font-bold transition-all duration-300';
          circle.textContent = stepNumber;
          
          // Update connector before this step if it exists
          if (index > 0 && stepConnectors[index - 1]) {
              stepConnectors[index - 1].className = 'step-connector flex-1 h-1 bg-gray-300 mx-6 max-w-16 transition-all duration-300';
          }
          
          // Update text
          if (stepTexts[index]) {
              stepTexts[index].className = 'font-medium text-gray-500';
          }
      }
  });
  
  // Update navigation buttons
  this.updateNavigationButtons();
}

updateStepDescription() {
  const stepDescription = document.getElementById('current-step-text');
  const stepProgress = document.getElementById('step-progress');
  
  if (!stepDescription || !stepProgress) return;
  
  const descriptions = {
      1: 'Contact & Shipping Information',
      2: 'Payment Information',
      3: 'Review Your Order'
  };
  
  stepDescription.textContent = descriptions[this.currentStep] || '';
  stepProgress.textContent = `(Step ${this.currentStep} of 3)`;
}

updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-step');
  const nextBtn = document.getElementById('next-step');
  
  if (!prevBtn || !nextBtn) return;
  
  if (this.currentStep === 1) {
      prevBtn.classList.add('hidden');
      nextBtn.textContent = 'Continue to Payment';
      nextBtn.innerHTML = 'Continue to Payment <i class="fas fa-arrow-right ml-2"></i>';
  } else if (this.currentStep === 2) {
      prevBtn.classList.remove('hidden');
      nextBtn.textContent = 'Review Order';
      nextBtn.innerHTML = 'Review Order <i class="fas fa-arrow-right ml-2"></i>';
  } else if (this.currentStep === 3) {
      prevBtn.classList.remove('hidden');
      nextBtn.classList.add('hidden');
  }
}
  
  updateNavigationButtons() {
      const prevBtn = document.getElementById('prev-step');
      const nextBtn = document.getElementById('next-step');
      
      if (!prevBtn || !nextBtn) return;
      
      if (this.currentStep === 1) {
          prevBtn.classList.add('hidden');
          nextBtn.textContent = 'Continue to Payment';
          nextBtn.innerHTML = 'Continue to Payment <i class="fas fa-arrow-right ml-2"></i>';
      } else if (this.currentStep === 2) {
          prevBtn.classList.remove('hidden');
          nextBtn.textContent = 'Review Order';
          nextBtn.innerHTML = 'Review Order <i class="fas fa-arrow-right ml-2"></i>';
      } else if (this.currentStep === 3) {
          prevBtn.classList.remove('hidden');
          nextBtn.classList.add('hidden');
      }
  }
  
  setupEventListeners() {
      console.log('Setting up checkout event listeners');
      
      // Navigation buttons
      const nextBtn = document.getElementById('next-step');
      const prevBtn = document.getElementById('prev-step');
      
      if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (this.validateCurrentStep()) {
                  this.nextStep();
              }
          });
      }
      
      if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.prevStep();
          });
      }
      
      // Shipping method changes
      document.querySelectorAll('input[name="shipping_method"]').forEach(radio => {
          radio.addEventListener('change', (e) => {
              this.updateShippingCost(e.target.value);
          });
      });
      
      // Payment method tabs
      document.querySelectorAll('.payment-tab').forEach(tab => {
          tab.addEventListener('click', (e) => {
              const method = e.currentTarget.dataset.method;
              this.switchPaymentMethod(method);
          });
      });
      
      // Billing address toggle
      const billingSame = document.getElementById('billing-same');
      if (billingSame) {
          billingSame.addEventListener('change', (e) => {
              const billingAddress = document.getElementById('billing-address');
              if (billingAddress) {
                  if (!e.target.checked) {
                      billingAddress.classList.remove('hidden');
                  } else {
                      billingAddress.classList.add('hidden');
                  }
              }
          });
      }
      
      // Card number formatting
      const cardNumberInput = document.getElementById('card-number');
      if (cardNumberInput) {
          cardNumberInput.addEventListener('input', (e) => {
              this.formatCardNumber(e.target);
          });
      }
      
      // CVV help
      const cvvHelpBtn = document.getElementById('cvv-help');
      if (cvvHelpBtn) {
          cvvHelpBtn.addEventListener('click', () => {
              this.showCvvHelp();
          });
      }
      
      // PayPal button
      const paypalBtn = document.getElementById('paypal-button');
      if (paypalBtn) {
          paypalBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.processPayPalPayment();
          });
      }
      
      // Place order
      const placeOrderBtn = document.getElementById('place-order-btn');
      if (placeOrderBtn) {
          placeOrderBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.placeOrder();
          });
      }
      
      // Order confirmation buttons
      const viewOrderBtn = document.getElementById('view-order-details');
      if (viewOrderBtn) {
          viewOrderBtn.addEventListener('click', () => {
              this.showOrderDetails();
          });
      }
      
      // Form auto-save
      this.setupFormAutoSave();
  }
  
  setupFormValidation() {
      // Real-time validation for required fields
      const validateField = (field) => {
          const errorElement = field.nextElementSibling;
          if (!errorElement || !errorElement.classList.contains('error-message')) return;
          
          if (!field.value.trim()) {
              this.showError(field, 'This field is required');
              return false;
          }
          
          // Field-specific validation
          switch(field.id) {
              case 'email':
                  if (!this.isValidEmail(field.value)) {
                      this.showError(field, 'Please enter a valid email address');
                      return false;
                  }
                  break;
              case 'phone':
                  if (!this.isValidPhone(field.value)) {
                      this.showError(field, 'Please enter a valid phone number');
                      return false;
                  }
                  break;
              case 'zip':
                  if (!this.isValidZip(field.value)) {
                      this.showError(field, 'Please enter a valid ZIP code');
                      return false;
                  }
                  break;
              case 'card-number':
                  if (!this.isValidCardNumber(field.value)) {
                      this.showError(field, 'Please enter a valid card number');
                      return false;
                  }
                  break;
              case 'card-cvv':
                  if (!this.isValidCVV(field.value)) {
                      this.showError(field, 'Please enter a valid CVV');
                      return false;
                  }
                  break;
          }
          
          this.hideError(field);
          return true;
      };
      
      // Add validation on blur
      document.querySelectorAll('input[required], select[required]').forEach(field => {
          field.addEventListener('blur', () => validateField(field));
          field.addEventListener('input', () => {
              if (field.value.trim()) this.hideError(field);
          });
      });
  }
  
  validateCurrentStep() {
      let isValid = true;
      
      switch(this.currentStep) {
          case 1:
              // Validate contact & shipping
              const step1Fields = [
                  'first-name', 'last-name', 'email', 'phone',
                  'address1', 'city', 'state', 'zip'
              ];
              
              step1Fields.forEach(fieldId => {
                  const field = document.getElementById(fieldId);
                  if (field) {
                      if (!this.validateField(field)) {
                          isValid = false;
                      }
                  }
              });
              break;
              
          case 2:
              // Validate payment
              const paymentMethod = document.querySelector('.payment-tab.active')?.dataset.method;
              
              if (paymentMethod === 'card') {
                  const cardFields = ['card-number', 'card-exp-month', 'card-exp-year', 'card-cvv', 'card-name'];
                  
                  cardFields.forEach(fieldId => {
                      const field = document.getElementById(fieldId);
                      if (field) {
                          if (!this.validateField(field)) {
                              isValid = false;
                          }
                      }
                  });
                  
                  // Additional card validation
                  const cardNumber = document.getElementById('card-number');
                  if (cardNumber && !this.isValidCardNumber(cardNumber.value)) {
                      this.showError(cardNumber, 'Please enter a valid card number');
                      isValid = false;
                  }
                  
                  const expMonth = document.getElementById('card-exp-month');
                  const expYear = document.getElementById('card-exp-year');
                  if (expMonth && expYear) {
                      if (!this.isValidExpiry(expMonth.value, expYear.value)) {
                          this.showError(expMonth, 'Card has expired or invalid date');
                          isValid = false;
                      }
                  }
              }
              break;
              
          case 3:
              // Validate terms
              const termsCheckbox = document.getElementById('terms');
              if (termsCheckbox && !termsCheckbox.checked) {
                  const termsError = document.getElementById('terms-error');
                  if (termsError) {
                      termsError.textContent = 'You must agree to the terms and conditions';
                      termsError.classList.remove('hidden');
                  }
                  isValid = false;
              }
              break;
      }
      
      return isValid;
  }
  
  validateField(field) {
      if (!field.value.trim()) {
          this.showError(field, 'This field is required');
          return false;
      }
      return true;
  }
  
  showError(field, message) {
      field.classList.add('border-accent');
      const errorElement = field.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error-message')) {
          errorElement.textContent = message;
          errorElement.classList.remove('hidden');
      }
  }
  
  hideError(field) {
      field.classList.remove('border-accent');
      const errorElement = field.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error-message')) {
          errorElement.classList.add('hidden');
      }
  }
  
  nextStep() {
      if (this.currentStep < this.totalSteps) {
          // Save current step data
          this.saveStepData();
          
          this.currentStep++;
          this.updateProgressBar();
          
          // Scroll to top of step
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // If moving to step 3, load review data
          if (this.currentStep === 3) {
              this.loadReviewData();
          }
      }
  }
  
  prevStep() {
      if (this.currentStep > 1) {
          this.currentStep--;
          this.updateProgressBar();
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }
  
  saveStepData() {
      // Collect form data from current step
      const form = document.getElementById('checkout-form');
      if (!form) return;
      
      const formData = new FormData(form);
      
      // Convert to object
      const data = {};
      for (let [key, value] of formData.entries()) {
          data[key] = value;
      }
      
      // Merge with existing form data
      this.formData = { ...this.formData, ...data };
      
      // Save to localStorage for persistence
      localStorage.setItem('checkoutData', JSON.stringify(this.formData));
  }
  
  setupFormAutoSave() {
      // Auto-save form data on change
      const form = document.getElementById('checkout-form');
      if (form) {
          form.addEventListener('input', this.debounce(() => {
              this.saveStepData();
          }, 500));
      }
  }
  
  loadReviewData() {
      // Load saved form data
      const savedData = JSON.parse(localStorage.getItem('checkoutData')) || {};
      
      // Populate shipping info
      const shippingInfo = document.getElementById('shipping-info');
      if (shippingInfo && savedData.first_name) {
          shippingInfo.innerHTML = `
              <p class="font-medium">${savedData.first_name} ${savedData.last_name}</p>
              <p class="text-sm text-gray-600">${savedData.address1}</p>
              ${savedData.address2 ? `<p class="text-sm text-gray-600">${savedData.address2}</p>` : ''}
              <p class="text-sm text-gray-600">${savedData.city}, ${savedData.state} ${savedData.zip}</p>
              <p class="text-sm text-gray-600">${savedData.email}</p>
              <p class="text-sm text-gray-600">${savedData.phone}</p>
          `;
      }
      
      // Populate payment info
      const paymentInfo = document.getElementById('payment-info');
      const paymentMethod = document.querySelector('.payment-tab.active')?.dataset.method;
      
      if (paymentInfo) {
          if (paymentMethod === 'card' && savedData.card_number) {
              const last4 = savedData.card_number.replace(/\s/g, '').slice(-4);
              paymentInfo.innerHTML = `
                  <p class="font-medium">Credit Card ending in ${last4}</p>
                  <p class="text-sm text-gray-600">Expires: ${savedData.card_exp_month}/${savedData.card_exp_year}</p>
                  <p class="text-sm text-gray-600">Name: ${savedData.card_name}</p>
              `;
          } else if (paymentMethod === 'paypal') {
              paymentInfo.innerHTML = `
                  <p class="font-medium">PayPal</p>
                  <p class="text-sm text-gray-600">${savedData.email || 'PayPal account'}</p>
              `;
          }
      }
      
      // Update delivery estimate
      this.updateDeliveryEstimate();
  }
  
  updateShippingCost(method) {
      switch(method) {
          case 'standard':
              this.shippingCost = 9.99;
              break;
          case 'express':
              this.shippingCost = 19.99;
              break;
          case 'free':
              this.shippingCost = 0;
              break;
      }
      
      this.updateOrderSummary();
      this.updateDeliveryEstimate();
  }
  
  updateDeliveryEstimate() {
      const estimateElement = document.getElementById('delivery-estimate');
      const confirmationElement = document.getElementById('confirmation-delivery');
      
      if (!estimateElement) return;
      
      const today = new Date();
      let deliveryDate = new Date(today);
      let estimateText = '';
      
      const shippingMethod = document.querySelector('input[name="shipping_method"]:checked')?.value;
      
      switch(shippingMethod) {
          case 'express':
              deliveryDate.setDate(today.getDate() + 2);
              estimateText = '1-2 business days';
              break;
          case 'free':
              deliveryDate.setDate(today.getDate() + 7);
              estimateText = '5-7 business days';
              break;
          case 'standard':
          default:
              deliveryDate.setDate(today.getDate() + 5);
              estimateText = '3-5 business days';
              break;
      }
      
      // Format date
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = deliveryDate.toLocaleDateString('en-US', options);
      
      estimateElement.textContent = estimateText;
      if (confirmationElement) {
          confirmationElement.textContent = formattedDate;
      }
  }
  
  updateOrderSummary() {
      // Recalculate and update summary
      const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * this.taxRate;
      const total = subtotal + this.shippingCost + tax;
      
      const shippingEl = document.getElementById('summary-shipping');
      const taxEl = document.getElementById('summary-tax');
      const totalEl = document.getElementById('summary-total');
      
      if (shippingEl) shippingEl.textContent = this.shippingCost === 0 ? 'FREE' : `$${this.shippingCost.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }
  
  switchPaymentMethod(method) {
      // Update active tab
      document.querySelectorAll('.payment-tab').forEach(tab => {
          if (tab.dataset.method === method) {
              tab.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
              tab.classList.remove('text-gray-600');
          } else {
              tab.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary');
              tab.classList.add('text-gray-600');
          }
      });
      
      // Show selected payment method
      document.querySelectorAll('.payment-method').forEach(form => {
          form.classList.add('hidden');
      });
      
      const methodElement = document.getElementById(`${method}-payment`);
      if (methodElement) {
          methodElement.classList.remove('hidden');
      }
  }
  
  formatCardNumber(input) {
      let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';
      
      for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) {
              formatted += ' ';
          }
          formatted += value[i];
      }
      
      input.value = formatted.substring(0, 19);
      
      // Show card type icon
      this.detectCardType(value);
  }
  
  detectCardType(cardNumber) {
      // Simple card type detection (implementation can be added here)
      // Currently does nothing
  }
  
  showCvvHelp() {
      const helpHTML = `
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div class="bg-white rounded-xl max-w-sm w-full p-6">
                  <div class="flex justify-between items-center mb-4">
                      <h3 class="font-bold text-lg">What is CVV?</h3>
                      <button id="close-cvv-help" class="text-gray-400 hover:text-gray-600">
                          <i class="fas fa-times text-xl"></i>
                      </button>
                  </div>
                  <div class="mb-6">
                      <p class="text-gray-700 mb-2">CVV (Card Verification Value) is a 3-4 digit security code on your credit card.</p>
                      <ul class="text-sm text-gray-600 space-y-1">
                          <li><i class="fas fa-credit-card mr-2"></i> Visa/Mastercard/Discover: 3 digits on back</li>
                          <li><i class="fas fa-credit-card mr-2"></i> American Express: 4 digits on front</li>
                      </ul>
                  </div>
                  <button id="close-cvv-help-btn" class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-800">
                      Got it
                  </button>
              </div>
          </div>
      `;
      
      const helpContainer = document.createElement('div');
      helpContainer.innerHTML = helpHTML;
      document.body.appendChild(helpContainer);
      
      // Add close listeners
      const closeHelp = () => {
          if (helpContainer.parentNode) {
              helpContainer.remove();
          }
      };
      
      const closeHelpBtn = document.getElementById('close-cvv-help');
      const closeHelpBtn2 = document.getElementById('close-cvv-help-btn');
      
      if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelp);
      if (closeHelpBtn2) closeHelpBtn2.addEventListener('click', closeHelp);
      
      helpContainer.addEventListener('click', (e) => {
          if (e.target === helpContainer) closeHelp();
      });
  }
  
  processPayPalPayment() {
      // Simulate PayPal payment process
      this.showLoading('Processing PayPal payment...');
      
      setTimeout(() => {
          this.hideLoading();
          this.placeOrder(); // Continue with order placement
      }, 2000);
  }
  
  async placeOrder() {
      // Validate final step
      if (!this.validateCurrentStep()) {
          return;
      }
      
      // Show loading
      this.showLoading('Processing your order...');
      
      // Simulate API call
      setTimeout(() => {
          this.hideLoading();
          this.processOrder();
      }, 1500);
  }
  
  processOrder() {
      // Generate order data
      const orderData = {
          orderId: `GB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          customer: {
              ...this.formData,
              email: document.getElementById('email')?.value || ''
          },
          items: this.cart,
          shipping: {
              method: document.querySelector('input[name="shipping_method"]:checked')?.value,
              cost: this.shippingCost
          },
          payment: {
              method: document.querySelector('.payment-tab.active')?.dataset.method,
              last4: this.formData.card_number?.replace(/\s/g, '').slice(-4) || 'PayPal'
          },
          totals: {
              subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              shipping: this.shippingCost,
              tax: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * this.taxRate,
              total: 0 // Will calculate below
          },
          date: new Date().toISOString()
      };
      
      // Calculate total
      orderData.totals.total = orderData.totals.subtotal + orderData.totals.shipping + orderData.totals.tax;
      
      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear cart
      localStorage.removeItem('cart');
      this.cart = [];
      
      // Update cart count in header
      if (typeof updateCartCount === 'function') {
          updateCartCount();
      }
      
      // Show confirmation
      this.showOrderConfirmation(orderData);
  }
  
  showOrderConfirmation(orderData) {
      // Update confirmation details
      const orderNumberEl = document.getElementById('order-number');
      const confirmationEmailEl = document.getElementById('confirmation-email');
      
      if (orderNumberEl) orderNumberEl.textContent = orderData.orderId;
      if (confirmationEmailEl) confirmationEmailEl.textContent = orderData.customer.email;
      
      // Show modal
      const modal = document.getElementById('order-confirmation');
      if (modal) {
          modal.classList.remove('hidden');
          
          // Add close functionality
          modal.addEventListener('click', (e) => {
              if (e.target === modal) {
                  window.location.href = 'index.html';
              }
          });
      }
  }
  
  showOrderDetails() {
      // In a real app, this would navigate to order details page
      alert('Order details page would show here. This is a demo.');
  }
  
  showLoading(message) {
      // Create loading overlay
      const loadingHTML = `
          <div id="checkout-loading" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div class="bg-white rounded-xl p-8 text-center max-w-sm">
                  <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p class="text-lg font-medium">${message}</p>
                  <p class="text-sm text-gray-600 mt-2">Please don't close this window</p>
              </div>
          </div>
      `;
      
      // Remove existing loading overlay first
      const existingLoading = document.getElementById('checkout-loading');
      if (existingLoading) {
          existingLoading.remove();
      }
      
      document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }
  
  hideLoading() {
      const loading = document.getElementById('checkout-loading');
      if (loading) {
          loading.remove();
      }
  }
  
  // Utility Methods
  isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }
  
  isValidPhone(phone) {
      const re = /^[\+]?[1-9][\d]{0,15}$/;
      return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
  
  isValidZip(zip) {
      const re = /^\d{5}(-\d{4})?$/;
      return re.test(zip);
  }
  
  isValidCardNumber(cardNumber) {
      // Simple Luhn algorithm check
      const clean = cardNumber.replace(/\s+/g, '');
      if (!/^\d+$/.test(clean)) return false;
      
      let sum = 0;
      let shouldDouble = false;
      
      for (let i = clean.length - 1; i >= 0; i--) {
          let digit = parseInt(clean.charAt(i));
          
          if (shouldDouble) {
              digit *= 2;
              if (digit > 9) digit -= 9;
          }
          
          sum += digit;
          shouldDouble = !shouldDouble;
      }
      
      return sum % 10 === 0;
  }
  
  isValidCVV(cvv) {
      return /^\d{3,4}$/.test(cvv);
  }
  
  isValidExpiry(month, year) {
      if (!month || !year) return false;
      
      const now = new Date();
      const expiry = new Date(parseInt(year), parseInt(month) - 1);
      
      return expiry > now;
  }
  
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
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Checkout page loaded');
  
  // Only initialize checkout system on checkout page
  if (window.location.pathname.includes('checkout.html')) {
      window.checkoutSystem = new CheckoutSystem();
  } else {
      console.log('Not on checkout page, skipping CheckoutSystem initialization');
  }
});