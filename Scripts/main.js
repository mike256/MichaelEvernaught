/**
 * Michael Evernaught — Official Website Scripts
 * Unified Mobile Navigation, Carousel, Filterable Photo Album & Accessible Lightbox
 */

let currentCarouselIndex = 0;
let currentLightboxIndex = 0;
let carouselTotal = 0;
let activeLightboxItems = [];

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

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('is-open');
        });
    });
}

/**
 * 2. RENDER DYNAMIC GALLERY CAROUSEL (index.html)
 */
function initializeGallery() {
    const galleryContainer = document.getElementById('dynamic-gallery');
    const videoContainer = document.getElementById('dynamic-video');

    if (!galleryContainer || typeof galleryImages === 'undefined' || !Array.isArray(galleryImages)) {
        return;
    }

    activeLightboxItems = [];
    carouselTotal = 0;

    galleryImages.forEach((item) => {
        const basePath = item.path || `Images/${item.filename}`;

        if (item.type === 'video') {
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <video src="${basePath}" controls playsinline poster="Images/hero.png"></video>
                `;
            }
            return;
        }

        const itemIndex = carouselTotal;
        const captionText = item.caption || 'Michael Evernaught live magic performance';
        activeLightboxItems.push({ src: basePath, caption: captionText, type: 'image' });

        const photoFrame = document.createElement('div');
        photoFrame.className = 'carousel-item photo-frame';
        photoFrame.setAttribute('role', 'button');
        photoFrame.setAttribute('tabindex', '0');
        photoFrame.setAttribute('aria-label', `View full size: ${captionText}`);

        photoFrame.addEventListener('click', () => openLightbox(itemIndex));
        photoFrame.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(itemIndex);
            }
        });

        const placeholder = `https://placehold.co/900x600/1c1b19/d4af37?text=${encodeURIComponent(captionText)}`;
        const img = document.createElement('img');
        img.src = basePath;
        img.alt = captionText;
        img.loading = itemIndex === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.onerror = function() {
            this.onerror = null;
            this.src = placeholder;
        };

        const captionDiv = document.createElement('div');
        captionDiv.className = 'caption';
        captionDiv.textContent = captionText;

        photoFrame.appendChild(img);
        photoFrame.appendChild(captionDiv);
        galleryContainer.appendChild(photoFrame);
        carouselTotal++;
    });

    updateCarouselMetadata();
    attachTouchSwipe(galleryContainer, (dir) => moveCarousel(dir));
}

function updateCarouselMetadata() {
    const counterEl = document.getElementById('carousel-counter');
    const captionBarEl = document.getElementById('carousel-caption-bar');

    if (counterEl && carouselTotal > 0) {
        counterEl.textContent = `${currentCarouselIndex + 1} / ${carouselTotal}`;
    }

    if (captionBarEl && activeLightboxItems[currentCarouselIndex]) {
        captionBarEl.textContent = activeLightboxItems[currentCarouselIndex].caption;
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
 * 3. RENDER FILTERABLE PHOTO ALBUM GRID (album.html)
 */
function initializeAlbum() {
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid || typeof albumPhotos === 'undefined' || !Array.isArray(albumPhotos)) {
        return;
    }

    const filterBtns = document.querySelectorAll('.filter-btn');

    function renderAlbumFilter(category) {
        albumGrid.innerHTML = '';
        activeLightboxItems = [];

        const filtered = category === 'all'
            ? albumPhotos
            : albumPhotos.filter(item => item.category === category);

        filtered.forEach((item, idx) => {
            activeLightboxItems.push({
                src: item.src,
                caption: item.caption,
                type: 'image'
            });

            const card = document.createElement('figure');
            card.className = 'album-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Enlarge photo: ${item.caption}`);

            card.addEventListener('click', () => openLightbox(idx));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                }
            });

            const placeholder = `https://placehold.co/800x600/1c1b19/d4af37?text=${encodeURIComponent(item.tag || 'Illumination')}`;
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption;
            img.loading = idx < 4 ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.onerror = function() {
                this.onerror = null;
                this.src = placeholder;
            };

            const overlay = document.createElement('figcaption');
            overlay.className = 'album-card-overlay';

            const tagSpan = document.createElement('span');
            tagSpan.className = 'album-card-tag';
            tagSpan.textContent = item.tag || 'Live Performance';

            const capSpan = document.createElement('span');
            capSpan.className = 'album-card-caption';
            capSpan.textContent = item.caption;

            overlay.appendChild(tagSpan);
            overlay.appendChild(capSpan);
            card.appendChild(img);
            card.appendChild(overlay);
            albumGrid.appendChild(card);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-filter') || 'all';
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            renderAlbumFilter(category);
        });
    });

    renderAlbumFilter('all');
}

/**
 * 4. TOUCH SWIPE HELPER
 */
function attachTouchSwipe(element, onSwipe) {
    if (!element) return;
    let touchStartX = 0;
    const minSwipeDistance = 45;

    element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchStartX - touchEndX;
        if (Math.abs(deltaX) > minSwipeDistance) {
            onSwipe(deltaX > 0 ? 1 : -1);
        }
    }, { passive: true });
}

/**
 * 5. ACCESSIBLE LIGHTBOX LOGIC (Shared by Carousel & Album Grid)
 */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !activeLightboxItems.length) return;

    currentLightboxIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
    renderLightboxSlide(activeLightboxItems[currentLightboxIndex]);

    lightbox.style.display = 'flex';
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
}

function renderLightboxSlide(item) {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVid = document.getElementById('lightbox-video');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    if (!lightboxImg || !item) return;

    lightboxImg.style.display = 'none';
    if (lightboxVid) {
        lightboxVid.style.display = 'none';
        lightboxVid.pause();
    }

    if (item.type === 'video' && lightboxVid) {
        lightboxVid.src = item.src;
        lightboxVid.style.display = 'block';
    } else {
        const placeholder = `https://placehold.co/900x650/1c1b19/d4af37?text=${encodeURIComponent(item.caption)}`;
        lightboxImg.onerror = function() {
            this.onerror = null;
            this.src = placeholder;
        };
        lightboxImg.src = item.src;
        lightboxImg.alt = item.caption || '';
        lightboxImg.style.display = 'block';
    }

    if (lightboxCap) {
        lightboxCap.textContent = item.caption || '';
    }
    if (lightboxCounter && activeLightboxItems.length > 0) {
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${activeLightboxItems.length}`;
    }
}

function navigateLightbox(direction) {
    if (!activeLightboxItems.length) return;

    currentLightboxIndex = (currentLightboxIndex + direction + activeLightboxItems.length) % activeLightboxItems.length;
    renderLightboxSlide(activeLightboxItems[currentLightboxIndex]);

    // Synchronize background carousel if present on the page
    const track = document.getElementById('dynamic-gallery');
    if (track && carouselTotal === activeLightboxItems.length) {
        currentCarouselIndex = currentLightboxIndex;
        track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
        updateCarouselMetadata();
    }
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
 * 6. KEYBOARD & LIGHTBOX SWIPE NAVIGATION
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
 * 7. INITIALIZE ON DOM READY
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeGallery();
    initializeAlbum();

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        attachTouchSwipe(lightbox, (dir) => navigateLightbox(dir));
    }
});
