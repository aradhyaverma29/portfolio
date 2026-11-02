/**
 * ARADHYA VERMA — PORTFOLIO SCRIPT
 * Interactions: Custom fluid cursor, IntersectionObserver scroll reveals,
 * and hover states. Lightweight & high performance.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollReveal();
  initHeaderScroll();
});

/* --------------------------------------------------------------------------
   1. Custom Cursor with Fluid Trailing
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (!dot || !ring) return;

  // Don't activate on touch/coarse pointers
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot snaps directly to mouse
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth lerp loop for the outer ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection for interactive elements
  function attachHoverListeners() {
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [data-hover]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  attachHoverListeners();

  // Re-attach whenever DOM updates might happen
  window.attachCursorHoverListeners = attachHoverListeners;

  // Fade out when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   2. Scroll Reveal Animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');

  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger reveal slightly if multiple items enter together
        setTimeout(() => {
          entry.target.classList.add('is-revealed');
        }, idx * 60);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   3. Header background on scroll
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
      header.style.background = 'rgba(8, 8, 8, 0.9)';
    } else {
      header.classList.remove('scrolled');
      header.style.borderBottomColor = 'var(--border-subtle)';
      header.style.background = 'rgba(8, 8, 8, 0.75)';
    }
  }, { passive: true });
}
