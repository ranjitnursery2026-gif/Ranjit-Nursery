import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-md', 'bg-white/95');
      navbar.classList.remove('bg-white/80', 'shadow-sm');
    } else {
      navbar.classList.add('bg-white/80', 'shadow-sm');
      navbar.classList.remove('shadow-md', 'bg-white/95');
    }
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove the translate/opacity classes to trigger Tailwind transition
        entry.target.classList.remove('opacity-0', 'translate-y-8', '-translate-x-8', 'translate-x-8');
        entry.target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select all elements with the animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
});
