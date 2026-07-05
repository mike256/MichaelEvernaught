
/**
 * RENDER DYNAMIC GALLERY (Carousel & Separated Video)
 */
let currentCarouselIndex = 0;
let carouselTotal = 0;

function initializeGallery() {
    const galleryContainer = document.getElementById('dynamic-gallery');
    const videoContainer = document.getElementById('dynamic-video');
    
    if (typeof galleryImages !== 'undefined') {
        galleryImages.forEach(item => {
            const basePath = `Images/${item.filename}`;

            if (item.type === 'video') {
                // Populate independent video section
                videoContainer.innerHTML = `
                    <video src="${basePath}" controls playsinline poster="Images/hero.png"></video>
                `;
            } else {
                // Populate Carousel track
                const photoFrame = document.createElement('div');
                photoFrame.className = 'carousel-item photo-frame';
                photoFrame.onclick = function() { openLightbox(this, item.type); };

                const placeholder = `https://placehold.co/600x800/1e1a15/d4af37?text=${encodeURIComponent(item.caption)}`;
                photoFrame.innerHTML = `
                    <img src="${basePath}" alt="${item.caption}" onerror="this.src='${placeholder}'">
                    <div class="caption">${item.caption}</div>
                `;

                galleryContainer.appendChild(photoFrame);
                carouselTotal++;
            }
        });
    }
}

function moveCarousel(direction) {
    if (carouselTotal === 0) return;
    const track = document.getElementById('dynamic-gallery');
    currentCarouselIndex = (currentCarouselIndex + direction + carouselTotal) % carouselTotal;
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
}

/**
 * LIGHTBOX LOGIC
 */
function openLightbox(element, type) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVid = document.getElementById('lightbox-video');
    const lightboxCap = document.getElementById('lightbox-caption');
    const sourceCap = element.querySelector('.caption');

    // Reset visibility
    lightboxImg.style.display = 'none';
    lightboxVid.style.display = 'none';
    lightboxVid.pause();

    if (type === 'video') {
        const sourceVid = element.querySelector('video');
        lightboxVid.src = sourceVid.src;
        lightboxVid.style.display = 'block';
    } else {
        const sourceImg = element.querySelector('img');
        lightboxImg.src = sourceImg.src;
        lightboxImg.style.display = 'block';
    }

    lightboxCap.innerText = sourceCap.innerText;
    
    lightbox.style.display = 'flex';
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });
    document.body.style.overflow = 'hidden'; 
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxVid = document.getElementById('lightbox-video');
    
    lightbox.classList.remove('active');
    lightboxVid.pause(); // Stop video playing in the background
    
    setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
            lightbox.style.display = 'none';
        }
    }, 800);
    document.body.style.overflow = 'auto'; 
}

/**
 * MAGICAL EFFECTS: Pixie Dust & Pop
 */
document.addEventListener('mousemove', function(e) {
    const particlesPerStep = 3; 
    for (let i = 0; i < particlesPerStep; i++) {
        if (Math.random() > 0.4) continue;
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-trail';
        const size = Math.random() * 5 + 2;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        const dx = (Math.random() - 0.5) * 50;
        const dy = (Math.random() * 30) + 10; 
        sparkle.style.setProperty('--dx', `${dx}px`);
        sparkle.style.setProperty('--dy', `${dy}px`);
        const glowColors = ['#d4af37', '#e5c687', '#ffffff', '#f1d38e'];
        const color = glowColors[Math.floor(Math.random() * glowColors.length)];
        sparkle.style.setProperty('--glow', color);
        sparkle.style.background = color;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }
});

document.addEventListener('mousedown', function(e) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'magical-pop';
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        const colors = ['#e5c687', '#d4af37', '#ffffff', '#f1d38e'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
});

function handleSecureMail() {
    const secureElements = document.querySelectorAll('.secure-mail');
    const secureButtons = document.querySelectorAll('.secure-mail-btn');
    const getAddress = (el) => {
        const user = el.getAttribute('data-user');
        const domain = el.getAttribute('data-domain');
        return `${user}@${domain}`;
    };
    secureElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.innerText = getAddress(el);
        }, { once: true });
        el.addEventListener('click', () => {
            const address = getAddress(el);
            window.location.href = `mailto:${address}`;
        });
    });
    secureButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const address = getAddress(btn);
            const subject = btn.getAttribute('data-subject') || 'Inquiry';
            window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}`;
        });
    });
}

// Run both setup scripts when the page finishes loading
window.onload = function() {
    handleSecureMail();
    initializeGallery();
};