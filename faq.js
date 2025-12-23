// Mobile menu toggle for FAQ page
const mobileMenuBtnFaq = document.getElementById('mobileMenuBtnFaq');
const mobileMenuFaq = document.getElementById('mobileMenuFaq');
const menuIconFaq = document.getElementById('menuIconFaq');

if (mobileMenuBtnFaq && mobileMenuFaq) {
    mobileMenuBtnFaq.addEventListener('click', () => {
        mobileMenuFaq.classList.toggle('hidden');
        if (menuIconFaq) {
            if (mobileMenuFaq.classList.contains('hidden')) {
                menuIconFaq.className = 'fas fa-bars';
            } else {
                menuIconFaq.className = 'fas fa-times';
            }
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileMenuFaq.contains(event.target) && 
            !mobileMenuBtnFaq.contains(event.target) && 
            !mobileMenuFaq.classList.contains('hidden')) {
            mobileMenuFaq.classList.add('hidden');
            if (menuIconFaq) {
                menuIconFaq.className = 'fas fa-bars';
            }
        }
    });
    
    // Close menu when clicking on a link
    const mobileLinks = mobileMenuFaq.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuFaq.classList.add('hidden');
            if (menuIconFaq) {
                menuIconFaq.className = 'fas fa-bars';
            }
        });
    });
}

// FAQ Accordion Functionality
const faqQuestions = document.querySelectorAll('.faq-question');
const faqItems = document.querySelectorAll('.faq-item');

// Initialize counters
const totalCount = faqItems.length;
document.getElementById('totalCount').textContent = totalCount;
document.getElementById('visibleCount').textContent = totalCount;

// Accordion toggle
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('.faq-icon');
        
        // Toggle active classes
        question.classList.toggle('active');
        answer.classList.toggle('active');
        icon.classList.toggle('active');
        
        // Close other FAQ items (optional)
        faqQuestions.forEach(otherQuestion => {
            if (otherQuestion !== question) {
                const otherAnswer = otherQuestion.nextElementSibling;
                const otherIcon = otherQuestion.querySelector('.faq-icon');
                otherQuestion.classList.remove('active');
                otherAnswer.classList.remove('active');
                otherIcon.classList.remove('active');
            }
        });
    });
});

// FAQ Search Functionality
const faqSearch = document.getElementById('faqSearch');
const clearSearch = document.getElementById('clearSearch');

if (faqSearch) {
    faqSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const visibleItems = filterAndSearchFAQ(searchTerm);
        
        // Show/hide clear button
        if (searchTerm.length > 0) {
            clearSearch.classList.remove('hidden');
        } else {
            clearSearch.classList.add('hidden');
        }
        
        // Update results counter
        document.getElementById('visibleCount').textContent = visibleItems;
    });
}

if (clearSearch) {
    clearSearch.addEventListener('click', function() {
        faqSearch.value = '';
        clearSearch.classList.add('hidden');
        filterAndSearchFAQ('');
        document.getElementById('visibleCount').textContent = totalCount;
    });
}

// Category Filter Functionality
const categoryFilters = document.querySelectorAll('.category-filter');

categoryFilters.forEach(filter => {
    filter.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        
        // Update active filter button
        categoryFilters.forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-800');
        });
        this.classList.remove('bg-gray-100', 'text-gray-800');
        this.classList.add('bg-primary', 'text-white');
        
        // Filter FAQ items
        filterFAQByCategory(category);
    });
});

// Search and Filter Functions
function filterAndSearchFAQ(searchTerm) {
    let visibleCount = 0;
    const activeCategory = document.querySelector('.category-filter.bg-primary')?.getAttribute('data-category') || 'all';
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        const category = item.getAttribute('data-category');
        
        // Check if item matches search term
        const matchesSearch = searchTerm === '' || 
            question.includes(searchTerm) || 
            answer.includes(searchTerm);
        
        // Check if item matches category
        const matchesCategory = activeCategory === 'all' || category === activeCategory;
        
        // Show/hide item
        if (matchesSearch && matchesCategory) {
            item.style.display = 'block';
            visibleCount++;
            
            // Highlight search term in question and answer
            if (searchTerm.length > 0) {
                highlightText(item, searchTerm);
            } else {
                removeHighlights(item);
            }
        } else {
            item.style.display = 'none';
            // Close any open answers when hiding
            const questionBtn = item.querySelector('.faq-question');
            const answerDiv = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            questionBtn.classList.remove('active');
            answerDiv.classList.remove('active');
            icon.classList.remove('active');
        }
    });
    
    // Update results counter
    document.getElementById('visibleCount').textContent = visibleCount;
    return visibleCount;
}

function filterFAQByCategory(category) {
    let visibleCount = 0;
    
    faqItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const searchTerm = faqSearch.value.toLowerCase();
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        // Check if item matches category and search term
        const matchesCategory = category === 'all' || itemCategory === category;
        const matchesSearch = searchTerm === '' || 
            question.includes(searchTerm) || 
            answer.includes(searchTerm);
        
        if (matchesCategory && matchesSearch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
            // Close any open answers when hiding
            const questionBtn = item.querySelector('.faq-question');
            const answerDiv = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            questionBtn.classList.remove('active');
            answerDiv.classList.remove('active');
            icon.classList.remove('active');
        }
    });
    
    // Update results counter
    document.getElementById('visibleCount').textContent = visibleCount;
    return visibleCount;
}

function highlightText(item, searchTerm) {
    const questionElement = item.querySelector('.faq-question span:nth-child(2)');
    const answerElement = item.querySelector('.faq-answer');
    
    if (questionElement) {
        const originalText = questionElement.textContent;
        const highlightedText = originalText.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        questionElement.innerHTML = highlightedText;
    }
    
    if (answerElement) {
        const originalText = answerElement.textContent;
        const highlightedText = originalText.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        // Store original HTML for later
        if (!answerElement.dataset.originalHtml) {
            answerElement.dataset.originalHtml = answerElement.innerHTML;
        }
        answerElement.innerHTML = highlightedText;
    }
}

function removeHighlights(item) {
    const questionElement = item.querySelector('.faq-question span:nth-child(2)');
    const answerElement = item.querySelector('.faq-answer');
    
    if (questionElement && questionElement.querySelector('.highlight')) {
        questionElement.innerHTML = questionElement.textContent;
    }
    
    if (answerElement && answerElement.dataset.originalHtml) {
        answerElement.innerHTML = answerElement.dataset.originalHtml;
    }
}

// Open FAQ item if URL has hash
window.addEventListener('load', function() {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // If it's a category section, scroll to it
            if (targetId.startsWith('category-')) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            // If it's an FAQ item, open it
            const faqItem = targetElement.closest('.faq-item');
            if (faqItem) {
                const question = faqItem.querySelector('.faq-question');
                question.click();
                setTimeout(() => {
                    faqItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    }
});