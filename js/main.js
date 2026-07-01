/* =========================================================
   Tammam Benbettaieb — Portfolio interactions
   Vanilla JS, no dependencies
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScrollHeader = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const closeNav = () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  navLinks.forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Smooth-scroll with sticky offset ---------- */
  const headerH = 64;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Scroll-spy: highlight active nav link ---------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const linkBySection = new Map();
  navLinks.forEach((l) => {
    const id = l.getAttribute('href');
    if (id && id.startsWith('#')) linkBySection.set(id.slice(1), l);
  });

  const spy = () => {
    let current = '';
    const trigger = window.scrollY + headerH + 120;
    for (const s of sections) {
      if (s.offsetTop <= trigger) current = s.id;
    }
    if (!current && sections.length) current = sections[0].id;
    navLinks.forEach((l) => l.classList.remove('active'));
    const active = linkBySection.get(current);
    if (active) active.classList.add('active');
  };
  spy();
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);

  /* ---------- Hero typing animation ---------- */
  const typed = document.getElementById('typedName');
  if (typed) {
    const full = 'Tammam Benbettaieb';
    if (prefersReduced) {
      typed.textContent = full;
    } else {
      let i = 0;
      const tick = () => {
        typed.textContent = full.slice(0, i);
        i++;
        if (i <= full.length) setTimeout(tick, 85 + Math.random() * 55);
      };
      setTimeout(tick, 450);
    }
  }

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Back-to-top button ---------- */
  const toTop = document.getElementById('toTop');
  const onScrollTop = () => {
    if (window.scrollY > 600) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  onScrollTop();
  window.addEventListener('scroll', onScrollTop, { passive: true });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* ---------- Active-section sync on load (hash) ---------- */
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) {
      requestAnimationFrame(() => {
        const y = el.getBoundingClientRect().top + window.scrollY - headerH + 1;
        window.scrollTo({ top: y });
      });
    }
  }
})();
