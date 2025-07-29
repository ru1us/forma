// Video Slider with GSAP and 3D effects
class VideoSlider {
  constructor(container) {
    this.container = container;
    this.slides = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.autoplayDelay = 10000;
    // Fix body styling conflicts first
    this.setupBodyOverrides();
    this.init();
  }
  
  setupBodyOverrides() {
    // Warte ein bisschen, damit loader.js seine Arbeit machen kann
    setTimeout(() => {
      // Override styles that prevent slider from working
      document.body.style.setProperty('overflow', 'visible', 'important');
      document.body.style.setProperty('height', '100vh', 'important');
      document.body.style.setProperty('position', 'relative', 'important');
    }, 100);
  }
  
  init() {
    this.createSlider();
    this.setupEventListeners();
    this.updateDescription();
    this.startAutoplay();
  }
  updateDescription() {
    const videoTitles = [
      '01_',
      '02_',
      '03_',
      '04_',
      '05_'
    ];
    const videoDescriptions = [
      'Beschreibung für Projekt Eins: Komfort und Design vereint.',
      'Beschreibung für Projekt Zwei: Minimalismus trifft Funktion.',
      'Beschreibung für Projekt Drei: Innovative Materialien.',
      'Beschreibung für Projekt Vier: Nachhaltigkeit im Fokus.',
      'Beschreibung für Projekt Fünf: Zeitlose Ästhetik.'
    ];
    this.descriptionContent.innerHTML = `
      <h2>${videoTitles[this.currentIndex]}</h2>
      <p>${videoDescriptions[this.currentIndex]}</p>
    `;
  }
  
  createSlider() {
    // Create main slider structure
    this.container.innerHTML = `
      <div class="slider-description" style="position:absolute;left:0;top:0;width:28vw;height:100vh;display:flex;align-items:center;justify-content:center;z-index:20;">
        <div class="description-content" style="width:90%;color:#fff;font-size:1.2em;"></div>
      </div>
      <div class="video-slider">
        ${this.createVideoSlides()}
        ${this.createProgressIndicator()}
      </div>
    `;
    this.slideElements = this.container.querySelectorAll('.video-slide');
    this.videos = this.container.querySelectorAll('video');
    this.progressDots = this.container.querySelectorAll('.progress-dot');
    this.descriptionContent = this.container.querySelector('.description-content');
    this.updateSlidePositions();
  }
  
  createVideoSlides() {
    const videoTitles = [
      '01',
      '02',
      '03',
      '04',
      '05'
    ];
    const videoFiles = [
      "public/3/lamp.webm",
      "public/3/sofa.1.webm",
      "public/3/sideboard.webm",
      "public/3/müll.webm",
      "public/3/tabloe.webm",
    ];
    return videoTitles.map((title, index) => `
      <div class="video-slide" data-index="${index}">
        <video loop muted preload="metadata" autoplay>
          <source src="${videoFiles[index]}" type="video/mp4">
          Ihr Browser unterstützt das Video-Element nicht.
        </video>
        <div class="video-overlay"></div>
        <div class="video-title">${title}</div>
      </div>
    `).join('');
  }
  
  
  createProgressIndicator() {
    const dots = Array.from({length: 5}, (_, i) => 
      `<div class="progress-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
    ).join('');
    return `<div class="slider-progress">${dots}</div>`;
  }
  
  setupEventListeners() {
    // Navigation buttons
    const prevBtn = this.container.querySelector('.prev-btn');
    const nextBtn = this.container.querySelector('.next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.goToPrevious());
    if (nextBtn) nextBtn.addEventListener('click', () => this.goToNext());
    
    // Progress dots
    // this.progressDots.forEach((dot, index) => {
    //   dot.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     this.goToSlide(index);
    //   });
    // });
    
    // Video click events
    this.slideElements.forEach((slide, index) => {
      slide.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`Clicked slide ${index}, current: ${this.currentIndex}`);
        if (index !== this.currentIndex) {
          this.goToSlide(index);
        }
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goToPrevious();
      if (e.key === 'ArrowRight') this.goToNext();
    });
    
    // Pause autoplay on hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
  }
  
  setupGSAP() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Initial animation when slider comes into view
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.container,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });
    
    // Animate slider entrance
    tl.from(this.slideElements, {
      duration: 1.2,
      y: 100,
      opacity: 0,
      rotationX: -15,
      stagger: 0.2,
      ease: "power3.out"
    });
    
    // Animate progress dots
    tl.from('.progress-dot', {
      duration: 0.6,
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.3");
  }
  
  updateSlidePositions() {
    this.slideElements.forEach((slide, index) => {
      const video = slide.querySelector('video');
      const position = this.getSlidePosition(index);
      
      // Remove all position classes
      slide.classList.remove('active', 'prev', 'next', 'far-left', 'far-right', 'hidden');
      
      // Add appropriate position class
      slide.classList.add(position);
      
      // Control video playback - only active video plays and loops
      if (position === 'active') {
        video.currentTime = 0; // Start from beginning
        video.play().catch(e => console.log('Video autoplay prevented:', e));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
    
    // Update progress dots
    this.progressDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
    
    console.log(`Current slide: ${this.currentIndex}`);
  }
  
  getSlidePosition(index) {
    const diff = index - this.currentIndex;
    const totalSlides = this.slideElements.length;
    
    if (diff === 0) return 'active';
    if (diff === 1 || diff === -(totalSlides - 1)) return 'next';
    if (diff === -1 || diff === totalSlides - 1) return 'prev';
    if (diff === 2 || diff === -(totalSlides - 2)) return 'far-right';
    if (diff === -2 || diff === totalSlides - 2) return 'far-left';
    
    return 'hidden';
  }
  
  goToSlide(index, direction = 'auto') {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    this.currentIndex = index;

    this.updateSlidePositions();
    this.updateDescription();
    // Simple timeout to prevent rapid clicking
    setTimeout(() => {
      this.isAnimating = false;
    }, 100);
    // Autoplay intentionally disabled
  }
  
  goToNext() {
    const nextIndex = (this.currentIndex + 1) % this.slideElements.length;
    this.goToSlide(nextIndex, 'next');
  }
  
  goToPrevious() {
    const prevIndex = (this.currentIndex - 1 + this.slideElements.length) % this.slideElements.length;
    this.goToSlide(prevIndex, 'prev');
  }
  
  startAutoplay() {
    this.pauseAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.goToNext();
    }, this.autoplayDelay);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  restartAutoplay() {
    this.startAutoplay();
  }
  
  // Public API
  destroy() {
    this.pauseAutoplay();
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.container) {
        trigger.kill();
      }
    });
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.video-slider-container');
  if (sliderContainer && !window.videoSlider) {
    window.videoSlider = new VideoSlider(sliderContainer);
    }
    document.querySelector(".logo").addEventListener("click", () => {
      window.location.href = "index.html";
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoSlider;
}
