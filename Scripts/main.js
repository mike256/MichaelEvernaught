/**
 * Michael Evernaught — Official Website Scripts
 * Accessible Gallery Carousel, Lightbox Modal & Mobile Navigation
 */

let currentCarouselIndex = 0;
let currentLightboxIndex = 0;
let carouselTotal = 0;

/**
 * 1. MOBILE NAVIGATION TOGGLE
 */
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.getElementById('primary-nav-links');

    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navLinks.classList.toggle('is-open', !isExpanded);
    });

    // Close mobile menu when any navigation link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('is-open');
        });
    });
}

/**
 * 2. RENDER DYNAMIC GALLERY CAROUSEL
 */
function initializeGallery() {
    const galleryContainer = document.getElementById('dynamic-gallery');
    const videoContainer = document.getElementById('dynamic-video');

    if (!galleryContainer || typeof galleryImages === 'undefined' || !Array.isArray(galleryImages)) {
        return;
    }

    galleryImages.forEach((item, index) => {
        const basePath = `Images/${item.filename}`;

        if (item.type === 'video') {
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <video src="${basePath}" controls playsinline poster="Images/hero.png"></video>
                `;
            }
            return;
        }

        const itemIndex = carouselTotal;
        const photoFrame = document.createElement('div');
        photoFrame.className = 'carousel-item photo-frame';
        photoFrame.setAttribute('role', 'button');
        photoFrame.setAttribute('tabindex', '0');
        photoFrame.setAttribute('aria-label', `View full size: ${item.caption}`);

        photoFrame.addEventListener('click', () => openLightbox(itemIndex));
        photoFrame.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(itemIndex);
            }
        });

        const placeholder = `https://placehold.co/900x600/1c1b19/d4af37?text=${encodeURIComponent(item.caption)}`;
        const img = document.createElement('img');
        img.src = basePath;
        img.alt = item.caption || 'Michael Evernaught live magic performance';
        img.loading = itemIndex === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.onerror = function() {
            this.onerror = null;
            this.src = placeholder;
        };

        const captionDiv = document.createElement('div');
        captionDiv.className = 'caption';
        captionDiv.textContent = item.caption || '';

        photoFrame.appendChild(img);
        photoFrame.appendChild(captionDiv);
        galleryContainer.appendChild(photoFrame);
        carouselTotal++;
    });

    updateCarouselMetadata();
    attachCarouselSwipe(galleryContainer);
}

function updateCarouselMetadata() {
    const counterEl = document.getElementById('carousel-counter');
    const captionBarEl = document.getElementById('carousel-caption-bar');
    const track = document.getElementById('dynamic-gallery');

    if (counterEl && carouselTotal > 0) {
        counterEl.textContent = `${currentCarouselIndex + 1} / ${carouselTotal}`;
    }

    if (captionBarEl && track) {
        const items = track.querySelectorAll('.carousel-item');
        const activeItem = items[currentCarouselIndex];
        if (activeItem) {
            const cap = activeItem.querySelector('.caption');
            captionBarEl.textContent = cap ? cap.textContent : '';
        }
    }
}

function moveCarousel(direction) {
    if (carouselTotal === 0) return;
    const track = document.getElementById('dynamic-gallery');
    if (!track) return;

    currentCarouselIndex = (currentCarouselIndex + direction + carouselTotal) % carouselTotal;
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    updateCarouselMetadata();
}

/**
 * Touch Swipe Support for Mobile Carousel
 */
function attachCarouselSwipe(trackElement) {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 45;

    trackElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    trackElement.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchStartX - touchEndX;
        if (Math.abs(deltaX) > minSwipeDistance) {
            moveCarousel(deltaX > 0 ? 1 : -1);
        }
    }, { passive: true });
}

/**
 * 3. ACCESSIBLE LIGHTBOX LOGIC
 */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const track = document.getElementById('dynamic-gallery');
    if (!lightbox || !track) return;

    const items = track.querySelectorAll('.carousel-item');
    if (!items.length) return;

    currentLightboxIndex = (index + items.length) % items.length;
    renderLightboxSlide(items[currentLightboxIndex]);

    lightbox.style.display = 'flex';
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
}

function renderLightboxSlide(element) {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVid = document.getElementById('lightbox-video');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    if (!lightboxImg || !lightboxVid) return;

    lightboxImg.style.display = 'none';
    lightboxVid.style.display = 'none';
    lightboxVid.pause();

    const sourceVid = element.querySelector('video');
    const sourceImg = element.querySelector('img');
    const sourceCap = element.querySelector('.caption');

    if (sourceVid) {
        lightboxVid.src = sourceVid.src;
        lightboxVid.style.display = 'block';
    } else if (sourceImg) {
        lightboxImg.src = sourceImg.src;
        lightboxImg.alt = sourceImg.alt || '';
        lightboxImg.style.display = 'block';
    }

    if (lightboxCap) {
        lightboxCap.textContent = sourceCap ? sourceCap.textContent : '';
    }
    if (lightboxCounter && carouselTotal > 0) {
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${carouselTotal}`;
    }
}

function navigateLightbox(direction) {
    const track = document.getElementById('dynamic-gallery');
    if (!track || carouselTotal === 0) return;

    const items = track.querySelectorAll('.carousel-item');
    currentLightboxIndex = (currentLightboxIndex + direction + carouselTotal) % carouselTotal;
    renderLightboxSlide(items[currentLightboxIndex]);

    // Keep background carousel synchronized with Lightbox position
    currentCarouselIndex = currentLightboxIndex;
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    updateCarouselMetadata();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxVid = document.getElementById('lightbox-video');
    if (!lightbox) return;

    lightbox.classList.remove('active');
    if (lightboxVid) {
        lightboxVid.pause();
    }

    setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
            lightbox.style.display = 'none';
        }
    }, 300);
    document.body.style.overflow = '';
}

/**
 * 4. KEYBOARD NAVIGATION (Lightbox & Carousel)
 */
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    const isLightboxOpen = lightbox && lightbox.classList.contains('active');

    if (isLightboxOpen) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        }
    }
});

/**
 * 5. INITIALIZE ON DOM READY
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeGallery();
});
