/* Interações compartilhadas. Toda a informação principal existe no HTML. */
(function () {
  'use strict';

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Menu móvel: teclado, Escape, clique fora e mudança de largura.
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const mobile = window.matchMedia('(max-width: 760px)');
  if (toggle && nav) {
    toggle.hidden = false;
    document.body.classList.add('nav-ready');
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    function setMenu(open, restoreFocus = false) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open && mobile.matches);
      if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => setMenu(!isOpen()));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !event.target.closest('.site-header')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (!isOpen() || !mobile.matches) return;
      if (event.key === 'Escape') setMenu(false, true);
      if (event.key === 'Tab') {
        const links = nav.querySelectorAll('a');
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === toggle) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); toggle.focus();
        }
      }
    });
    mobile.addEventListener('change', () => setMenu(false));
  }

  // Movimento é opcional. Não há rolagem artificial ou bibliotecas de animação.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('[data-motion-toggle]');
  let paused = false;
  try { paused = localStorage.getItem('anyway:motion-paused') === 'true'; } catch (_) { /* Storage opcional. */ }
  const motionOff = () => paused || reducedMotion.matches;
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const progress = document.querySelector('.scroll-progress');
  let scheduled = false;

  function paintScroll() {
    scheduled = false;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0})`;
    for (const layer of layers) {
      if (motionOff()) { layer.style.transform = ''; continue; }
      const bounds = layer.parentElement.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) continue;
      const speed = Number(layer.dataset.parallax) * (mobile.matches ? 0.45 : 1);
      const maxShift = bounds.height * 0.08;
      const offset = Math.max(-maxShift, Math.min(maxShift, -bounds.top * speed));
      layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  }
  function queueScroll() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(paintScroll); }
  }
  function syncMotion() {
    document.body.classList.toggle('motion-paused', motionOff());
    if (motionButton) {
      motionButton.hidden = reducedMotion.matches;
      motionButton.textContent = paused ? 'Ativar animações' : 'Pausar animações';
      motionButton.setAttribute('aria-pressed', String(paused));
    }
    if (motionOff()) document.querySelectorAll('.is-pending').forEach((el) => el.classList.replace('is-pending', 'is-visible'));
    queueScroll();
  }
  motionButton?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('anyway:motion-paused', String(paused)); } catch (_) { /* Storage opcional. */ }
    syncMotion();
  });
  reducedMotion.addEventListener('change', syncMotion);
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  window.addEventListener('load', queueScroll, { once: true });
  syncMotion();

  if ('IntersectionObserver' in window && !motionOff()) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('is-pending');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06 });
    for (const element of document.querySelectorAll('.reveal')) {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('is-pending'); observer.observe(element);
      }
    }
  }

  // YouTube só é carregado quando o visitante escolhe reproduzir.
  document.querySelectorAll('[data-video]').forEach((frame) => {
    frame.querySelector('.video-trigger')?.addEventListener('click', () => {
      const video = document.createElement('iframe');
      video.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(frame.dataset.video)}?autoplay=1&rel=0`;
      video.title = 'Anyway — Insônia (webclipe oficial)';
      video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      video.allowFullscreen = true;
      video.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.replaceChildren(video);
      video.focus();
    }, { once: true });
  });

  const filters = document.querySelector('.store-filters');
  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', (event) => {
      const selected = event.target.closest('[data-filter]');
      if (!selected) return;
      let visible = 0;
      filters.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
      document.querySelectorAll('[data-category]').forEach((card) => {
        card.hidden = selected.dataset.filter !== 'all' && card.dataset.category !== selected.dataset.filter;
        if (!card.hidden) visible += 1;
      });
      document.getElementById('filter-status').textContent = `${visible} ${visible === 1 ? 'produto encontrado' : 'produtos encontrados'}.`;
    });
  }

  const form = document.getElementById('order-form');
  const catalog = window.AnywayCatalog;
  if (!form || !catalog) return;
  form.hidden = false;
  const kind = form.dataset.product;
  const preview = document.getElementById('order-preview');
  const error = document.getElementById('order-error');
  const orderLink = document.getElementById('whatsapp-order');
  const gallery = document.querySelector('.gallery-thumbnails');
  let side = 'front';
  const values = () => Object.fromEntries(new FormData(form));

  function imagePath(chosenSide) {
    const options = values();
    const basename = kind === 'camiseta'
      ? `Camisa_Anyway_${chosenSide === 'front' ? 'Frente' : 'Costas'}_${options.cor === 'Branca' ? 'Branca' : 'Preta'}`
      : `Copo_Anyway_${chosenSide === 'front' ? 'Frente' : 'Verso'}`;
    return `img/optimized/${basename}.webp`;
  }
  function updateGallery() {
    const img = document.getElementById('product-image');
    const label = side === 'front' ? 'Frente' : 'Verso';
    img.src = imagePath(side);
    img.alt = `${catalog.products[kind].name}${kind === 'camiseta' ? ` ${values().cor.toLowerCase()}` : ''} — ${label.toLowerCase()}`;
    document.getElementById('gallery-label').textContent = label;
    gallery.querySelectorAll('[data-gallery]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.gallery === side));
      button.querySelector('img').src = imagePath(button.dataset.gallery);
    });
  }
  gallery.hidden = false;
  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-gallery]');
    if (button) { side = button.dataset.gallery; updateGallery(); }
  });

  function updateForm() {
    preview.hidden = true;
    error.hidden = true;
    orderLink.removeAttribute('href');
    try {
      const result = catalog.quote(kind, values());
      document.getElementById('product-price').textContent = catalog.formatPrice(result.total) + (result.quantity > 1 ? ` / ${result.quantity} unidades` : '');
    } catch (_) {
      document.getElementById('product-price').textContent = 'A partir de ' + catalog.formatPrice(Math.min(...Object.values(catalog.products[kind].prices)));
    }
    updateGallery();
  }
  form.addEventListener('input', updateForm);
  form.addEventListener('change', updateForm);
  form.addEventListener('invalid', (event) => event.target.closest('details')?.setAttribute('open', ''), true);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const order = catalog.buildOrder(kind, values());
      document.getElementById('order-summary').textContent = order.summary;
      orderLink.href = order.url;
      preview.hidden = false;
      error.hidden = true;
      preview.focus({ preventScroll: true });
      preview.scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth', block: 'nearest' });
    } catch (problem) {
      preview.hidden = true;
      error.textContent = problem.message;
      error.hidden = false;
    }
  });
  updateForm();
})();
