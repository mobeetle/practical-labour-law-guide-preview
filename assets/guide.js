(() => {
  const root = document.documentElement;
  const body = document.body;

  /* Theme: light is the default for reading; the choice is remembered. */
  const savedTheme = window.localStorage.getItem('guide-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.dataset.theme = savedTheme;
  }

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    window.localStorage.setItem('guide-theme', next);
  });

  /* Mobile navigation drawer. */
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const menuButton = document.getElementById('menu-btn');

  function setNavigation(open) {
    body.classList.toggle('nav-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    if (scrim) scrim.hidden = !open;
  }

  menuButton?.addEventListener('click', () => setNavigation(!body.classList.contains('nav-open')));
  scrim?.addEventListener('click', () => setNavigation(false));
  document.getElementById('sidebar-close')?.addEventListener('click', () => setNavigation(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setNavigation(false);
  });

  /* Sidebar filter. */
  const filter = document.getElementById('q-filter');
  const emptyMessage = document.getElementById('filter-empty');
  const chapters = [...document.querySelectorAll('.chapter')];
  const parts = [...document.querySelectorAll('.part')];
  const links = [...document.querySelectorAll('.q-link')];

  const normalize = (value) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  function applyFilter() {
    const query = normalize(filter?.value.trim() ?? '');
    const filtering = query.length > 0;

    chapters.forEach((chapter) => {
      let visible = 0;
      chapter.querySelectorAll('.q-link').forEach((link) => {
        const match = !filtering || (link.dataset.search ?? '').includes(query);
        link.parentElement.hidden = !match;
        if (match) visible += 1;
      });
      chapter.hidden = visible === 0;
      chapter.open = filtering ? visible > 0 : chapter.dataset.defaultOpen === 'true';
    });

    parts.forEach((part) => {
      const visible = [...part.querySelectorAll('.chapter')].some((chapter) => !chapter.hidden);
      part.hidden = filtering && !visible;
      part.open = filtering ? visible : part.dataset.defaultOpen === 'true';
    });

    if (emptyMessage) {
      emptyMessage.hidden = !(filtering && !links.some((link) => !link.parentElement.hidden));
    }
  }

  filter?.addEventListener('input', applyFilter);
  filter?.addEventListener('search', applyFilter);

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== filter) {
      event.preventDefault();
      filter?.focus();
    }
  });

  /* Keep the active question visible in the long sidebar. */
  const activeLink = document.querySelector('.q-link.is-active');
  if (activeLink && sidebar) {
    window.requestAnimationFrame(() => {
      const linkRect = activeLink.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
        sidebar.scrollTop += linkRect.top - sidebarRect.top - sidebarRect.height / 2;
      }
    });
  }

  /* Print: expand the editorial notes before the dialog opens. */
  function openDetails() {
    document.querySelectorAll('details').forEach((detail) => {
      detail.open = true;
    });
  }

  document.getElementById('print-btn')?.addEventListener('click', () => {
    openDetails();
    window.print();
  });
  window.addEventListener('beforeprint', openDetails);
})();
