// ==================== 
// Main Landing Page JavaScript 
// ==================== 

document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initAnimations();
    initMobileMenu();
    loadTemplatesShowcase();
});

// ==================== 
// Load Templates Showcase
// ==================== 
async function loadTemplatesShowcase() {
    try {
        const templates = await apiService.getAllTemplates();
        
        // Update template count
        const templateCount = document.getElementById('templateCount');
        if (templateCount) {
            templateCount.textContent = templates.length;
        }
        
        // Display templates
        const showcaseGrid = document.getElementById('templatesShowcaseGrid');
        if (showcaseGrid) {
            if (templates.length === 0) {
                showcaseGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6B7280;">
                        <i class="fas fa-folder-open" style="font-size: 60px; margin-bottom: 20px; opacity: 0.5;"></i>
                        <p style="font-size: 18px;">لا توجد قوالب متاحة حالياً</p>
                        <p style="font-size: 14px; margin-top: 10px;">سيتم إضافة القوالب قريباً من لوحة التحكم</p>
                    </div>
                `;
            } else {
                // Show first 6 templates
                const displayTemplates = templates.slice(0, 6);
                showcaseGrid.innerHTML = displayTemplates.map(template => `
                    <div class="template-showcase-card">
                        <div class="template-showcase-image">
                            <img src="${apiService.getImageUrl(template.image) || 'https://via.placeholder.com/400x400?text=Template'}" 
                                 alt="${template.name}">
                            <div class="template-overlay">
                                <span class="template-category-badge">${getCategoryNameArabic(template.category)}</span>
                            </div>
                        </div>
                        <div class="template-showcase-info">
                            <h4>${template.name}</h4>
                            ${template.description ? `<p>${template.description}</p>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading templates showcase:', error);
        const showcaseGrid = document.getElementById('templatesShowcaseGrid');
        if (showcaseGrid) {
            showcaseGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #DC2626;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 60px; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px;">حدث خطأ في تحميل القوالب</p>
                    <p style="font-size: 14px; margin-top: 10px;">الرجاء التأكد من تشغيل السيرفر</p>
                </div>
            `;
        }
    }
}

function getCategoryNameArabic(category) {
    const categories = {
        restaurant: 'مطعم',
        cafe: 'كافيه',
        supermarket: 'سوبرماركت',
        shop: 'متجر',
        online: 'متجر إلكتروني',
        services: 'خدمات',
        fashion: 'أزياء',
        beauty: 'تجميل',
        general: 'عام'
    };
    return categories[category] || category;
}

// ==================== 
// Header Scroll Effect 
// ==================== 
function initHeader() {
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// ==================== 
// Animations on Scroll 
// ==================== 
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.step-card, .category-card, .feature-card, .pricing-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ==================== 
// Mobile Menu 
// ==================== 
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            menuBtn.classList.toggle('open');
        });
    }
    
    // Add mobile menu styles
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links.mobile-open {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                gap: 1rem;
            }
            
            .mobile-menu-btn.open span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .mobile-menu-btn.open span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-btn.open span:nth-child(3) {
                transform: rotate(-45deg) translate(5px, -5px);
            }
        }
    `;
    document.head.appendChild(style);
}

// ==================== 
// Smooth Scroll for anchor links 
// ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
