(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const year = document.querySelector('[data-year]');
  const form = document.querySelector('[data-contact-form]');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menu?.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });

  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const counters = document.querySelectorAll('[data-counter]');

  const formatNumber = (value) => {
    const hasDecimals = !Number.isInteger(value);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: hasDecimals ? 1 : 0,
      maximumFractionDigits: hasDecimals ? 1 : 0,
    }).format(value);
  };

  const animateCounter = (element) => {
    const target = Number(element.dataset.value || 0);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 1300;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const displayValue = Number.isInteger(target) ? Math.round(current) : Number(current.toFixed(1));

      element.textContent = `${prefix}${formatNumber(displayValue)}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    counters.forEach((counter) => {
      const value = Number(counter.dataset.value || 0);
      counter.textContent = `${counter.dataset.prefix || ''}${formatNumber(value)}${counter.dataset.suffix || ''}`;
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('nome') || '').trim();
    const company = String(data.get('empresa') || '').trim();
    const goal = String(data.get('objetivo') || '').trim();
    const whatsapp = String(form.dataset.whatsapp || '').replace(/\D/g, '');

    if (!whatsapp || whatsapp.endsWith('999999999')) {
      window.alert('Antes de publicar, substitua o número de WhatsApp no atributo data-whatsapp do formulário.');
      return;
    }

    const message = [
      'Olá! Vim pelo seu portfólio.',
      '',
      `Nome: ${name}`,
      `Empresa/projeto: ${company}`,
      `Objetivo: ${goal}`,
    ].join('\n');

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
