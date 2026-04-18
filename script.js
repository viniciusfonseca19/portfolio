/**
 * script.js — Vinícius Fonseca Portfolio
 * Features:
 *  - Custom cursor
 *  - Navbar scroll behavior + active link tracking
 *  - Mobile hamburger menu
 *  - Intersection Observer (reveal animations + stagger)
 *  - Typed text effect
 *  - Smooth scroll
 *  - Tech card interaction delays
 */

/* ===================== DOM READY ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initMobileMenu();
  initRevealObserver();
  initTypedText();
  applyTechCardDelays();
  initSmoothScroll();
});

/* ===================== CUSTOM CURSOR ===================== */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (!cursor || !follower) return;

  // Only enable on non-touch devices
  if (!matchMedia('(hover: hover)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Cursor dot follows instantly
    cursor.style.left = `${mouseX}px`;
    cursor.style.top  = `${mouseY}px`;
  });

  // Follower uses lerp for smooth lag
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;

    follower.style.left = `${followerX}px`;
    follower.style.top  = `${followerY}px`;

    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects on interactive elements
  const interactiveSelectors = 'a, button, .tech-card, .project-card, .contact-card, .btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.remove('cursor-hover');
    }
  });
}

/* ===================== NAVBAR ===================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll: add .scrolled class + active link
  function onScroll() {
    // Scrolled state
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section detection
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ===================== MOBILE MENU ===================== */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!hamburger || !mobileMenu) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu when a link is clicked
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on overlay click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggleMenu(false);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ===================== INTERSECTION OBSERVER (REVEAL) ===================== */
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const options = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Respect data-delay attribute for stagger effect
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Number(delay));

        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, options);

  revealEls.forEach((el) => observer.observe(el));
}

/* ===================== TYPED TEXT EFFECT ===================== */
function initTypedText() {
  const target = document.getElementById('typedText');
  if (!target) return;

  const words = ['Backend', 'Fullstack', 'Frontend', 'Java Dev', 'React Dev', 'Building scalable systems'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      // Remove character
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Add character
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIndex === currentWord.length) {
      // Finished typing — pause then start deleting
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting — move to next word
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }

    typingTimeout = setTimeout(type, delay);
  }

  type();
}

/* ===================== TECH CARD DELAYS ===================== */
/**
 * Tech cards have data-delay attributes in HTML.
 * This function ensures the Intersection Observer respects those delays.
 * (Cards already have data-delay, the observer reads it.)
 */
function applyTechCardDelays() {
  // Cards already have data-delay on them from the HTML.
  // Add reveal-up class so they participate in the observer.
  const techCards = document.querySelectorAll('.tech-card');
  techCards.forEach((card) => {
    card.classList.add('reveal-up');
  });

  // Re-init the observer to pick up newly added .reveal-up elements
  // (observer is already observing; this refreshes newly classified elements)
  const newRevealEls = document.querySelectorAll('.tech-card.reveal-up:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  });

  newRevealEls.forEach((el) => observer.observe(el));
}

/* ===================== SMOOTH SCROLL ===================== */
function initSmoothScroll() {
  // Polyfill for browsers that don't support scroll-behavior: smooth
  // (modern browsers handle this via CSS, this is a fallback + offset for navbar)

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 72;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });
    });
  });
}

/* ===================== MICRO INTERACTIONS ===================== */

// Parallax orbs on hero mouse move
(function initParallaxOrbs() {
  const hero = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.orb');
  if (!hero || !orbs.length) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 15;
      orb.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    orbs.forEach((orb) => {
      orb.style.transform = '';
    });
  });
})();

// Button ripple effect
(function initRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 4px; height: 4px;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        left: ${x}px; top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple-anim 500ms ease-out forwards;
        pointer-events: none;
        z-index: 10;
      `;

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Inject ripple keyframe once
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-anim {
        to {
          transform: translate(-50%, -50%) scale(60);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();