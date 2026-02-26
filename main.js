// ── NAVBAR SCROLL EFFECT ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const steps = document.querySelectorAll('.step');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

reveals.forEach(el => observer.observe(el));

// ── STEPS STAGGERED ANIMATION ──
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const allSteps = document.querySelectorAll('.step');
      allSteps.forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 120);
      });
      stepObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

if (steps.length) stepObserver.observe(steps[0]);
