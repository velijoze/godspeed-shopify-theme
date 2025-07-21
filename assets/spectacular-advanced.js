// GODSPEED SPECTACULAR ADVANCED EFFECTS - TRULY UNIQUE
class SpectacularEffects {
  constructor() {
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.init();
  }

  init() {
    this.createParticleCanvas();
    this.createFloatingElements();
    this.initScrollEffects();
    this.initProductShowcase();
    this.initTypingAnimation();
    this.initMagneticButtons();
    this.initParallaxLayers();
  }

  // Simple background effect - no spinning particles
  createParticleCanvas() {
    // Removed spinning particle canvas - too distracting
  }

  resizeCanvas() {
    // Removed
  }

  animateParticles() {
    // Removed spinning particles - too distracting
  }

  // Floating 3D elements
  createFloatingElements() {
    const floatingElements = document.querySelectorAll('.product-card, .hero-title');
    
    floatingElements.forEach((el, index) => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      
      el.addEventListener('mouseenter', () => {
        const randomX = (Math.random() - 0.5) * 20;
        const randomY = (Math.random() - 0.5) * 20;
        const randomZ = Math.random() * 50 + 20;
        
        el.style.transform = `perspective(1000px) rotateX(${randomX}deg) rotateY(${randomY}deg) translateZ(${randomZ}px)`;
        el.style.boxShadow = `0 ${randomZ}px ${randomZ * 2}px rgba(171, 130, 87, 0.3)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        el.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      });
    });
  }

  // Advanced scroll effects
  initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const element = entry.target;
          
          // Staggered animation
          const children = element.querySelectorAll('*');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.style.transform = 'translateY(0) rotateX(0) scale(1)';
              child.style.opacity = '1';
              child.style.filter = 'blur(0px) brightness(1)';
            }, index * 100);
          });
          
          // Add sparkle effect
          this.addSparkleEffect(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('section, .product-card, h1, h2').forEach(el => {
      // Prepare elements
      const children = el.querySelectorAll('*');
      children.forEach(child => {
        child.style.transform = 'translateY(50px) rotateX(-15deg) scale(0.8)';
        child.style.opacity = '0';
        child.style.filter = 'blur(5px) brightness(0.7)';
        child.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      });
      
      observer.observe(el);
    });
  }

  // 3D Product showcase
  initProductShowcase() {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
      const img = product.querySelector('img');
      if(!img) return;
      
      // Create 3D container
      const container3D = document.createElement('div');
      container3D.style.perspective = '1000px';
      container3D.style.transformStyle = 'preserve-3d';
      
      img.parentNode.insertBefore(container3D, img);
      container3D.appendChild(img);
      
      product.addEventListener('mousemove', (e) => {
        const rect = product.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / 10;
        const rotateY = (e.clientX - centerX) / 10;
        
        img.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
        
        // Add glow effect
        product.style.boxShadow = `
          ${rotateY}px ${rotateX}px 40px rgba(171, 130, 87, 0.4),
          0 0 80px rgba(171, 130, 87, 0.2)
        `;
      });
      
      product.addEventListener('mouseleave', () => {
        img.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        product.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
      });
    });
  }

  // Typewriter animation for headings
  initTypingAnimation() {
    const headings = document.querySelectorAll('h1, h2, .hero-title');
    
    headings.forEach(heading => {
      const text = heading.textContent;
      heading.textContent = '';
      heading.style.borderRight = '3px solid #ab8257';
      heading.style.animation = 'blink 1s infinite';
      
      let i = 0;
      const typeWriter = () => {
        if(i < text.length) {
          heading.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 100 + Math.random() * 100);
        } else {
          heading.style.borderRight = 'none';
        }
      };
      
      // Start typing when element comes into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            setTimeout(typeWriter, 500);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(heading);
    });
  }

  // Magnetic button effects
  initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .button');
    
    buttons.forEach(button => {
      button.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
      
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 100;
        
        if(distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          button.style.transform = `translate(${x * force * 0.3}px, ${y * force * 0.3}px) scale(${1 + force * 0.1})`;
          
          // Add ripple effect
          this.createRipple(button, e.clientX - rect.left, e.clientY - rect.top);
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0px, 0px) scale(1)';
      });
    });
  }

  // Parallax layers
  initParallaxLayers() {
    const parallaxElements = document.querySelectorAll('.hero, .product-card, section');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach((element, index) => {
        const rate = scrolled * (index * 0.1 + 0.5);
        element.style.transform = `translateY(${rate * 0.5}px) rotateX(${rate * 0.01}deg)`;
        
        // Dynamic blur based on scroll speed
        const blur = Math.min(scrolled * 0.01, 5);
        element.style.filter = `blur(${blur}px)`;
      });
    });
  }

  // Sparkle effects
  addSparkleEffect(element) {
    for(let i = 0; i < 10; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.fontSize = Math.random() * 20 + 10 + 'px';
        sparkle.style.left = Math.random() * element.offsetWidth + 'px';
        sparkle.style.top = Math.random() * element.offsetHeight + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'sparkleFloat 2s ease-out forwards';
        sparkle.style.zIndex = '1000';
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
      }, i * 200);
    }
  }

  // Ripple effect
  createRipple(button, x, y) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'rippleEffect 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes sparkleFloat {
    0% { transform: translateY(0) rotate(0deg) scale(0); opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg) scale(1.5); opacity: 0; }
  }
  
  @keyframes rippleEffect {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
  }
  
  @keyframes blink {
    0%, 50% { border-color: transparent; }
    51%, 100% { border-color: #ab8257; }
  }
  
  .spectacular-glow {
    animation: spectacularGlow 3s ease-in-out infinite alternate;
  }
  
  @keyframes spectacularGlow {
    from { 
      box-shadow: 0 0 20px rgba(171, 130, 87, 0.5), inset 0 0 20px rgba(171, 130, 87, 0.1);
      filter: brightness(1);
    }
    to { 
      box-shadow: 0 0 60px rgba(171, 130, 87, 0.8), inset 0 0 40px rgba(171, 130, 87, 0.3);
      filter: brightness(1.2);
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SpectacularEffects();
  
  // Add glow class to key elements
  setTimeout(() => {
    document.querySelectorAll('.btn-primary, .product-card, .hero-title').forEach(el => {
      el.classList.add('spectacular-glow');
    });
  }, 1000);
});