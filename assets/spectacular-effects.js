// GODSPEED.CH PROFESSIONAL EFFECTS
document.addEventListener('DOMContentLoaded', function() {
  
  // Subtle scroll reveal animation
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);
  
  // Observe scroll-reveal elements
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
  
  // Professional button click feedback
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Subtle scale animation
      this.style.transform = 'translateY(-1px) scale(0.98)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
  
  // Smooth loading states
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50); // Stagger the animation
  });
});