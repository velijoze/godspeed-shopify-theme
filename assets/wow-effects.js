// Wow Effects: hero parallax, skeleton loader, dark-mode toggle

(function () {
  /* Parallax */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    const onScroll = () => {
      const scrolled = window.pageYOffset;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Skeleton loader for lazy images */
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((img) => {
    img.classList.add('skeleton');
    if (img.complete) img.classList.remove('skeleton');
    else {
      img.addEventListener('load', () => img.classList.remove('skeleton'));
    }
  });

  /* Dark-mode toggle */
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    const applyMode = (dark) => {
      document.documentElement.classList.toggle('dark-mode', dark);
      localStorage.setItem('darkMode', dark);
      toggle.setAttribute('aria-pressed', dark);
    };
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) applyMode(saved === 'true');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyMode(true);
    }
    toggle.addEventListener('click', () => {
      applyMode(!document.documentElement.classList.contains('dark-mode'));
    });
  }
})(); 