// Carousel Component JavaScript
class AdalexCarousel {
    constructor(element) {
        this.carousel = element;
        this.track = element.querySelector('.a-carousel__track');
        this.slides = Array.from(element.querySelectorAll('.a-carousel__slide'));
        this.prevButton = element.querySelector('.a-carousel__arrow--prev');
        this.nextButton = element.querySelector('.a-carousel__arrow--next');
        this.indicators = Array.from(element.querySelectorAll('.a-carousel__indicator'));
        this.playPauseButton = element.querySelector('.a-carousel__play-pause');
        this.thumbnails = Array.from(element.querySelectorAll('.a-carousel__thumbnail-item'));
        
        // Options from data attributes
        this.autoplay = element.dataset.autoplay === 'true';
        this.autoplayInterval = parseInt(element.dataset.autoplayInterval) || 5000;
        this.loop = element.dataset.loop === 'true';
        this.slidesPerView = parseInt(element.dataset.slidesPerView) || 1;
        
        // State
        this.currentIndex = 0;
        this.isPlaying = this.autoplay;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragOffset = 0;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set initial state
        this.updateSlideVisibility();
        
        // Bind events
        this.bindEvents();
        
        // Start autoplay if enabled
        if (this.autoplay) {
            this.startAutoplay();
        }
        
        // Dispatch init event
        this.dispatchEvent('carousel:init');
    }
    
    bindEvents() {
        // Arrow navigation
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prev());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.next());
        }
        
        // Indicator navigation
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Thumbnail navigation
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Play/Pause
        if (this.playPauseButton) {
            this.playPauseButton.addEventListener('click', () => this.togglePlayPause());
        }
        
        // Keyboard navigation
        this.carousel.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe support
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Mouse drag support
        this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.track.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.track.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Hover pause for autoplay
        if (this.autoplay) {
            this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.carousel.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.startAutoplay();
                }
            });
        }
        
        // Reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            this.disableTransitions();
        }
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.disableTransitions();
            } else {
                this.enableTransitions();
            }
        });
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else if (this.loop) {
            this.goToSlide(this.slides.length - 1);
        }
    }
    
    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else if (this.loop) {
            this.goToSlide(0);
        }
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        // Dispatch slide start event
        this.dispatchEvent('carousel:slide-start', { from: this.currentIndex, to: index });
        
        const prevIndex = this.currentIndex;
        this.currentIndex = index;
        
        // Update visibility
        this.updateSlideVisibility();
        
        // Update transform for slide animation
        if (this.slidesPerView === 1) {
            const offset = -100 * this.currentIndex;
            this.track.style.transform = `translateX(${offset}%)`;
        } else {
            const slideWidth = 100 / this.slidesPerView;
            const offset = -slideWidth * this.currentIndex;
            this.track.style.transform = `translateX(${offset}%)`;
        }
        
        // Update indicators
        this.updateIndicators();
        
        // Update thumbnails
        this.updateThumbnails();
        
        // Dispatch events
        this.dispatchEvent('carousel:change', { index: this.currentIndex });
        
        // Dispatch slide end event after transition
        setTimeout(() => {
            this.dispatchEvent('carousel:slide-end', { from: prevIndex, to: index });
        }, 500);
        
        // Reset autoplay timer
        if (this.autoplay && this.isPlaying) {
            this.resetAutoplay();
        }
    }
    
    updateSlideVisibility() {
        this.slides.forEach((slide, index) => {
            if (this.slidesPerView > 1) {
                // For multiple slides, all visible slides should be active
                const isVisible = index >= this.currentIndex && index < this.currentIndex + this.slidesPerView;
                slide.dataset.active = isVisible ? 'true' : 'false';
            } else {
                slide.dataset.active = index === this.currentIndex ? 'true' : 'false';
            }
        });
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('a-carousel__indicator--active');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('a-carousel__indicator--active');
                indicator.removeAttribute('aria-current');
            }
        });
    }
    
    updateThumbnails() {
        this.thumbnails.forEach((thumbnail, index) => {
            if (index === this.currentIndex) {
                thumbnail.classList.add('a-carousel__thumbnail-item--active');
            } else {
                thumbnail.classList.remove('a-carousel__thumbnail-item--active');
            }
        });
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case ' ':
                if (this.playPauseButton) {
                    e.preventDefault();
                    this.togglePlayPause();
                }
                break;
        }
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.pauseAutoplay();
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
        this.dragOffset = this.currentX - this.startX;
        
        // Apply drag transform
        const currentTransform = -100 * this.currentIndex;
        const dragPercent = (this.dragOffset / this.carousel.offsetWidth) * 100;
        this.track.style.transform = `translateX(${currentTransform + dragPercent}%)`;
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.touchEndX = this.currentX || this.touchStartX;
        
        // Reset transform
        const currentTransform = -100 * this.currentIndex;
        this.track.style.transform = `translateX(${currentTransform}%)`;
        
        this.handleSwipeGesture();
        
        // Resume autoplay
        if (this.autoplay && this.isPlaying) {
            this.startAutoplay();
        }
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.startX = e.clientX;
        this.track.style.cursor = 'grabbing';
        this.pauseAutoplay();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.currentX = e.clientX;
        this.dragOffset = this.currentX - this.startX;
        
        // Apply drag transform
        const currentTransform = -100 * this.currentIndex;
        const dragPercent = (this.dragOffset / this.carousel.offsetWidth) * 100;
        this.track.style.transform = `translateX(${currentTransform + dragPercent}%)`;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.cursor = '';
        
        // Reset transform
        const currentTransform = -100 * this.currentIndex;
        this.track.style.transform = `translateX(${currentTransform}%)`;
        
        // Check if drag was significant
        const threshold = this.carousel.offsetWidth * 0.2; // 20% of carousel width
        if (Math.abs(this.dragOffset) > threshold) {
            if (this.dragOffset > 0) {
                this.prev();
            } else {
                this.next();
            }
        }
        
        this.dragOffset = 0;
        
        // Resume autoplay
        if (this.autoplay && this.isPlaying) {
            this.startAutoplay();
        }
    }
    
    handleSwipeGesture() {
        const swipeThreshold = 50; // Minimum distance for swipe
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left
                this.next();
            } else {
                // Swipe right
                this.prev();
            }
        }
    }
    
    startAutoplay() {
        this.pauseAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.autoplayInterval);
    }
    
    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    resetAutoplay() {
        if (this.autoplay && this.isPlaying) {
            this.pauseAutoplay();
            this.startAutoplay();
        }
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.startAutoplay();
            this.playPauseButton.dataset.playing = 'true';
            this.playPauseButton.setAttribute('aria-label', 'Pause carousel');
        } else {
            this.pauseAutoplay();
            this.playPauseButton.dataset.playing = 'false';
            this.playPauseButton.setAttribute('aria-label', 'Play carousel');
        }
    }
    
    disableTransitions() {
        this.track.style.transition = 'none';
    }
    
    enableTransitions() {
        this.track.style.transition = '';
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...detail, carousel: this.carousel },
            bubbles: true
        });
        this.carousel.dispatchEvent(event);
    }
    
    destroy() {
        this.pauseAutoplay();
        // Remove event listeners if needed
        this.dispatchEvent('carousel:destroy');
    }
}

// Initialize carousels (idempotent for HTMX)
function initCarousels() {
    const carousels = document.querySelectorAll('.a-carousel:not([data-carousel-initialized])');
    carousels.forEach(carousel => {
        const instance = new AdalexCarousel(carousel);
        carousel.adalexCarousel = instance;
        carousel.dataset.carouselInitialized = 'true';
    });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
} else {
    initCarousels();
}

// Re-initialize on HTMX swap
document.addEventListener('htmx:afterSwap', initCarousels);

// Export for use in other modules
window.AdalexCarousel = AdalexCarousel;
window.initCarousels = initCarousels;