(function () {
  var content = document.querySelector('.article-content');
  if (!content) return;

  var headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  function slugify(t) {
    return t.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  var items = [];
  headings.forEach(function (h) {
    if (!h.id) h.id = slugify(h.textContent);
    items.push(h);
  });

  // Floating toggle button
  var toggle = document.createElement('button');
  toggle.id = 'toc-toggle';
  toggle.setAttribute('aria-label', 'Table of contents');
  toggle.innerHTML = '<span class="toc-toggle-icon" aria-hidden="true">≡</span> contents';
  document.body.appendChild(toggle);

  // Overlay + panel
  var overlay = document.createElement('div');
  overlay.id = 'toc-overlay';

  var panel = document.createElement('div');
  panel.id = 'toc-panel';

  var bar = document.createElement('div');
  bar.className = 'toc-panel-bar';
  bar.innerHTML = '<span>table of contents</span>';

  var close = document.createElement('button');
  close.className = 'toc-close';
  close.setAttribute('aria-label', 'Close');
  close.textContent = '×';
  bar.appendChild(close);

  var list = document.createElement('ul');
  list.id = 'toc-list';

  items.forEach(function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'toc-link toc-' + h.tagName.toLowerCase();
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + h.id);
      closeToc();
    });
    li.appendChild(a);
    list.appendChild(li);
  });

  panel.appendChild(bar);
  panel.appendChild(list);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function openToc() {
    overlay.classList.add('toc-visible');
    document.body.style.overflow = 'hidden';
  }
  function closeToc() {
    overlay.classList.remove('toc-visible');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openToc);
  close.addEventListener('click', closeToc);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeToc();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeToc();
  });

  // Highlight the section currently in view
  var links = list.querySelectorAll('.toc-link');
  function onScroll() {
    var current = -1;
    items.forEach(function (h, i) {
      if (h.getBoundingClientRect().top <= 140) current = i;
    });
    links.forEach(function (l, i) {
      l.classList.toggle('toc-active', i === current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
