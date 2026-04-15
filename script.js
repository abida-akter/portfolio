const menuToggle = document.querySelector('.menu-toggle');
const siteHeader = document.querySelector('.site-header');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const revealElements = document.querySelectorAll('.reveal');
const observedSections = document.querySelectorAll('main section[id]');
const currentYear = document.querySelector('#currentYear');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sectionLinkMap = new Map(
  Array.from(navLinks).map((link) => [link.getAttribute('href'), link])
);

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    siteNav.classList.toggle('is-open', !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!siteHeader || !siteHeader.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}

if (navLinks.length > 0) {
  navLinks[0].classList.add('is-active');
}

if (!prefersReducedMotion && 'IntersectionObserver' in window && observedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      const currentLink = sectionLinkMap.get(`#${visibleEntry.target.id}`);

      if (!currentLink) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link === currentLink);
      });
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: '-18% 0px -56% 0px',
    }
  );

  observedSections.forEach((section) => {
    if (sectionLinkMap.has(`#${section.id}`)) {
      sectionObserver.observe(section);
    }
  });
}

if (revealElements.length > 0) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => {
      element.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
      revealObserver.observe(element);
    });
  }
}