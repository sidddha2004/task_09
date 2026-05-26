/**
 * AdiShila Landing Page - JavaScript
 * Max Pro UX Design Patterns
 */

(function() {
    'use strict';

    // ===== DOM Elements =====
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.querySelector('.navbar');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    // ===== Mobile Navigation =====
    function toggleMobileMenu() {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    }

    function closeMobileMenu() {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
            closeMobileMenu();
            mobileMenuBtn?.focus();
        }
    });

    // ===== Smooth Scroll with Offset =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navHeight = navbar?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Set focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    // ===== Navbar Scroll Effect =====
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(88, 44, 40, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 12px rgba(88, 44, 40, 0.08)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // ===== Form Validation & Submission =====
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            message: 'Please enter your name (at least 2 characters)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: false,
            pattern: /^[\d\s\+\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number'
        },
        product: {
            required: true,
            message: 'Please select a product'
        }
    };

    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = validationRules[fieldName];
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup?.querySelector('.error-message');

        if (!rules) return true;

        // Reset state
        formGroup?.classList.remove('error');
        if (errorEl) errorEl.textContent = '';

        // Required check
        if (rules.required && !value) {
            showError(field, 'This field is required', formGroup, errorEl);
            return false;
        }

        // Min length check
        if (rules.minLength && value.length < rules.minLength) {
            showError(field, rules.message, formGroup, errorEl);
            return false;
        }

        // Pattern check
        if (value && rules.pattern && !rules.pattern.test(value)) {
            showError(field, rules.message, formGroup, errorEl);
            return false;
        }

        return true;
    }

    function showError(field, message, formGroup, errorEl) {
        formGroup?.classList.add('error');
        if (errorEl) errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field) {
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup?.querySelector('.error-message');
        formGroup?.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
    }

    // Add blur validation to all form fields
    contactForm?.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearError(field));
    });

    // Form submission
    contactForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        const submitBtn = this.querySelector('button[type="submit"]');

        // Validate all fields
        let isValid = true;
        this.querySelectorAll('input[required], select[required]').forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Focus first invalid field
            const firstError = this.querySelector('.form-group.error input, .form-group.error select');
            firstError?.focus();
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Send to Make.com webhook for CRM automation
        try {
            await fetch('https://hook.eu1.make.com/b9xo4ehd9xa0rurqabex263ytsvtux67', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.log('Webhook error (non-blocking):', err);
        }

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            formSuccess.classList.add('show');
            this.reset();

            // Announce success to screen readers
            formSuccess.focus();

            // Hide success after 6 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 6000);
        }, 1500);
    });

    // ===== Intersection Observer for Scroll Animations =====
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .product-card, .testimonial-card, .pricing-card, .catalog-card').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== Accessibility Enhancements =====
    // Handle focus trap in mobile menu
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    if (navLinks) trapFocus(navLinks);

    // ===== Active Navigation State =====
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

    function updateActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ===== Lazy Load Images (if needed) =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== Prefers Color Scheme =====
    // Could be extended to support dark mode if needed
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // ===== Initialize =====
    console.log('AdiShila Landing Page initialized');

})();