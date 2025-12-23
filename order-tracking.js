// Mobile menu toggle
const mobileMenuBtnTrack = document.getElementById('mobileMenuBtnTrack');
const mobileMenuTrack = document.getElementById('mobileMenuTrack');
const menuIconTrack = document.getElementById('menuIconTrack');

if (mobileMenuBtnTrack && mobileMenuTrack) {
    mobileMenuBtnTrack.addEventListener('click', () => {
        mobileMenuTrack.classList.toggle('hidden');
        if (menuIconTrack) {
            if (mobileMenuTrack.classList.contains('hidden')) {
                menuIconTrack.className = 'fas fa-bars';
            } else {
                menuIconTrack.className = 'fas fa-times';
            }
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileMenuTrack.contains(event.target) && 
            !mobileMenuBtnTrack.contains(event.target) && 
            !mobileMenuTrack.classList.contains('hidden')) {
            mobileMenuTrack.classList.add('hidden');
            if (menuIconTrack) {
                menuIconTrack.className = 'fas fa-bars';
            }
        }
    });
    
    // Close menu when clicking on a link
    const mobileLinks = mobileMenuTrack.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuTrack.classList.add('hidden');
            if (menuIconTrack) {
                menuIconTrack.className = 'fas fa-bars';
            }
        });
    });
}

// Tracking Form Handling
const trackingForm = document.getElementById('trackingForm');
const trackingResults = document.getElementById('trackingResults');
const noResults = document.getElementById('noResults');
const findOrderBtn = document.getElementById('findOrderBtn');
const guestTrackLink = document.getElementById('guestTrackLink');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// Demo tracking data
const demoOrders = {
    'GB-2025-12345': {
        email: 'demo@example.com',
        status: 'in-transit',
        progress: 60,
        date: 'Dec 15, 2025',
        delivery: 'Dec 18, 2025',
        method: 'UPS Ground',
        tracking: '1Z999AA1234567890'
    },
    'GB-2025-67890': {
        email: 'demo@example.com',
        status: 'delivered',
        progress: 100,
        date: 'Dec 10, 2025',
        delivery: 'Dec 13, 2025',
        method: 'FedEx Ground',
        tracking: '123456789012'
    },
    'GB-2025-11223': {
        email: 'demo@example.com',
        status: 'processing',
        progress: 30,
        date: 'Dec 16, 2025',
        delivery: 'Dec 20, 2025',
        method: 'USPS Priority',
        tracking: '9205590164912345678901'
    }
};

if (trackingForm) {
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const orderNumber = document.getElementById('orderNumber').value.trim().toUpperCase();
        const email = document.getElementById('trackingEmail').value.trim().toLowerCase();
        
        // Demo validation
        if (demoOrders[orderNumber] && email.includes('@')) {

          trackingResults.classList.remove('hidden');
            noResults.classList.add('hidden');
            
            // Update demo data
            const order = demoOrders[orderNumber];
            document.getElementById('demoOrderNumber').textContent = orderNumber;
            document.getElementById('demoOrderDate').textContent = order.date;
            document.getElementById('demoDeliveryDate').textContent = order.delivery;
            document.getElementById('demoShippingMethod').textContent = order.method;
            document.getElementById('demoTrackingNumber').textContent = order.tracking;
            document.getElementById('progressPercent').textContent = order.progress + '%';
            document.getElementById('progressFill').style.width = order.progress + '%';
            
            trackingResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            trackingResults.classList.add('hidden');
            noResults.classList.remove('hidden');
            
            noResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// Find order number button
if (findOrderBtn) {
    findOrderBtn.addEventListener('click', function() {
        alert('Check your email for your order confirmation. Your order number starts with "GB-" followed by the year and a 5-digit number (e.g., GB-2025-12345).');
    });
}

// Guest tracking link
if (guestTrackLink) {
    guestTrackLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Pre-fill demo data for testing
        document.getElementById('orderNumber').value = 'GB-2025-12345';
        document.getElementById('trackingEmail').value = 'demo@example.com';
        // Trigger form submission
        trackingForm.dispatchEvent(new Event('submit'));
    });
}

// Try again button
if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function() {
        noResults.classList.add('hidden');
        document.getElementById('orderNumber').value = '';
        document.getElementById('trackingEmail').value = '';
        document.getElementById('orderNumber').focus();
    });
}

// Print tracking button
const printTrackingBtn = document.getElementById('printTracking');
if (printTrackingBtn) {
    printTrackingBtn.addEventListener('click', function() {
        window.print();
    });
}

// Share tracking button
const shareTrackingBtn = document.getElementById('shareTracking');
if (shareTrackingBtn) {
    shareTrackingBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'GearBox Order Tracking',
                text: `Track my GearBox Auto Parts order ${document.getElementById('demoOrderNumber').textContent}`,
                url: window.location.href,
            })
            .catch(console.error);
        } else {
            // Fallback for browsers without Web Share API
            const trackingUrl = window.location.href;
            navigator.clipboard.writeText(trackingUrl).then(() => {
                alert('Tracking link copied to clipboard!');
            });
        }
    });
}

// Copy tracking number function
window.copyTrackingNumber = function (button) {
const trackingNum =
document.getElementById('demoTrackingNumber').textContent;

navigator.clipboard.writeText(trackingNum).then(() => {
const originalText = button.innerHTML;

button.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';

setTimeout(() => {
  button.innerHTML = originalText;
}, 2000);
});
};


// Simulate live updates
function simulateLiveUpdate() {
    setTimeout(() => {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill && progressPercent) {
            const currentWidth = parseInt(progressFill.style.width);
            if (currentWidth < 100) {
                const newWidth = Math.min(currentWidth + 5, 100);
                progressFill.style.width = newWidth + '%';
                progressPercent.textContent = newWidth + '%';
            }
        }
    }, 10000); // Update every 10 seconds
}

window.addEventListener('load', simulateLiveUpdate);

// Auto-focus search field
document.getElementById('orderNumber')?.focus();