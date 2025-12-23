// Mobile menu toggle for contact page
const mobileMenuBtnContact = document.getElementById('mobileMenuBtnContact');
const mobileMenuContact = document.getElementById('mobileMenuContact');
const menuIconContact = document.getElementById('menuIconContact');

if (mobileMenuBtnContact && mobileMenuContact) {
    mobileMenuBtnContact.addEventListener('click', () => {
        mobileMenuContact.classList.toggle('hidden');
        if (menuIconContact) {
            if (mobileMenuContact.classList.contains('hidden')) {
                menuIconContact.className = 'fas fa-bars';
            } else {
                menuIconContact.className = 'fas fa-times';
            }
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileMenuContact.contains(event.target) && 
            !mobileMenuBtnContact.contains(event.target) && 
            !mobileMenuContact.classList.contains('hidden')) {
            mobileMenuContact.classList.add('hidden');
            if (menuIconContact) {
                menuIconContact.className = 'fas fa-bars';
            }
        }
    });
    
    // Close menu when clicking on a link
    const mobileLinks = mobileMenuContact.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuContact.classList.add('hidden');
            if (menuIconContact) {
                menuIconContact.className = 'fas fa-bars';
            }
        });
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        contactForm.reset();
        
        // Show success message
        formSuccess.classList.remove('hidden');
        
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        setTimeout(() => {
            formSuccess.classList.add('hidden');
        }, 10000);
    });
}

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');
        
        answer.classList.toggle('hidden');
        
        if (answer.classList.contains('hidden')) {
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.style.transform = 'rotate(180deg)';
        }
        
        // Close other FAQ items
        faqQuestions.forEach(otherQuestion => {
            if (otherQuestion !== question) {
                const otherAnswer = otherQuestion.nextElementSibling;
                const otherIcon = otherQuestion.querySelector('i');
                otherAnswer.classList.add('hidden');
                otherIcon.style.transform = 'rotate(0deg)';
            }
        });
    });
});

// Smooth scroll to form from FAQ link
const faqLink = document.querySelector('a[href="#contactForm"]');
if (faqLink && contactForm) {
    faqLink.addEventListener('click', (e) => {
        e.preventDefault();
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}