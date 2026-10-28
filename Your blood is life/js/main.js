document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const loader = document.querySelector('.page-loader');
  window.setTimeout(() => loader?.classList.add('is-done'), 420);

  const currentPage = body.dataset.page;
  document.querySelectorAll('.site-nav a[data-page]').forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  navToggle?.addEventListener('click', () => {
    const isOpen = siteNav?.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const toTop = document.querySelector('.to-top');
  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollTop > 24);
    toTop?.classList.toggle('is-visible', scrollTop > 430);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 }) : null;
  document.querySelectorAll('.reveal').forEach((element) => revealObserver?.observe(element));

  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (element) => {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.counter || 0);
    const suffix = element.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${Math.floor(target * eased).toLocaleString('ar-SA')}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: .55 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else counters.forEach(animateCounter);

  document.querySelectorAll('.btn, .filter-btn, .social-link').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.remove('ripple');
      void button.offsetWidth;
      button.classList.add('ripple');
    });
  });

  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item?.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(Boolean(isOpen)));
    });
  });

  const hospitalSearch = document.querySelector('#hospital-search');
  const cityFilter = document.querySelector('#city-filter');
  const typeFilter = document.querySelector('#type-filter');
  const hospitalCards = [...document.querySelectorAll('[data-hospital-card]')];
  const hospitalEmpty = document.querySelector('#hospital-empty');
  const filterHospitals = () => {
    if (!hospitalCards.length) return;
    const search = (hospitalSearch?.value || '').trim().toLowerCase();
    const city = cityFilter?.value || 'all';
    const type = typeFilter?.value || 'all';
    let count = 0;
    hospitalCards.forEach((card) => {
      const haystack = card.textContent.toLowerCase();
      const matchSearch = !search || haystack.includes(search);
      const matchCity = city === 'all' || card.dataset.city === city;
      const matchType = type === 'all' || (card.dataset.types || '').split(',').includes(type);
      const visible = matchSearch && matchCity && matchType;
      card.classList.toggle('hidden', !visible);
      if (visible) count += 1;
    });
    if (hospitalEmpty) hospitalEmpty.classList.toggle('hidden', count !== 0);
  };
  [hospitalSearch, cityFilter, typeFilter].forEach((input) => input?.addEventListener('input', filterHospitals));
  [cityFilter, typeFilter].forEach((input) => input?.addEventListener('change', filterHospitals));

  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'], 'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'], 'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'], 'O+': ['O+', 'O-'], 'O-': ['O-']
  };
  const typePicker = document.querySelector('#type-picker');
  const typeOutput = document.querySelector('#type-output');
  const updateTypeOutput = () => {
    if (!typePicker || !typeOutput) return;
    const selected = typePicker.value;
    const donors = compatibility[selected] || [];
    typeOutput.innerHTML = `<strong>الفصيلة ${selected}</strong><span>يمكنها استقبال الدم من: ${donors.join('، ')}</span>`;
  };
  typePicker?.addEventListener('change', updateTypeOutput);
  updateTypeOutput();

  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const galleryButtons = document.querySelectorAll('[data-gallery-filter]');
  galleryButtons.forEach((button) => button.addEventListener('click', () => {
    galleryButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const filter = button.dataset.galleryFilter;
    galleryItems.forEach((item) => item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.category !== filter));
  }));

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  let activeGalleryIndex = 0;
  const visibleGalleryItems = () => galleryItems.filter((item) => !item.classList.contains('is-hidden'));
  const renderLightbox = () => {
    const items = visibleGalleryItems();
    if (!items.length || !lightboxImage) return;
    const item = items[activeGalleryIndex % items.length];
    const image = item.querySelector('img');
    lightboxImage.src = image?.src || '';
    lightboxImage.alt = image?.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = item.dataset.caption || image?.alt || '';
  };
  galleryItems.forEach((item) => item.addEventListener('click', () => {
    const items = visibleGalleryItems();
    activeGalleryIndex = Math.max(0, items.indexOf(item));
    renderLightbox();
    lightbox?.classList.add('is-open');
    lightbox?.setAttribute('aria-hidden', 'false');
    body.classList.add('is-loading');
  }));
  const closeLightbox = () => { lightbox?.classList.remove('is-open'); lightbox?.setAttribute('aria-hidden', 'true'); body.classList.remove('is-loading'); };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  lightboxPrev?.addEventListener('click', () => { const items = visibleGalleryItems(); activeGalleryIndex = (activeGalleryIndex - 1 + items.length) % items.length; renderLightbox(); });
  lightboxNext?.addEventListener('click', () => { const items = visibleGalleryItems(); activeGalleryIndex = (activeGalleryIndex + 1) % items.length; renderLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') lightboxNext?.click();
    if (event.key === 'ArrowRight') lightboxPrev?.click();
  });
});
