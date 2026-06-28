/**
 * command-palette.js
 * Site-wide command palette (Ctrl/Cmd+K).
 *
 * Sources its items from the JSON index embedded in
 * `_includes/command-palette.html` (#cmdk-index), which Jekyll fills with the
 * nav pages and every post. Two built-in actions (theme toggle, RSS) are added
 * in JS. Fuzzy subsequence matching, full keyboard control.
 */

(function () {
  'use strict';

  const root = document.getElementById('cmdk');
  if (!root) return;

  const input    = document.getElementById('cmdk-input');
  const list     = document.getElementById('cmdk-list');
  const empty    = document.getElementById('cmdk-empty');
  const emptyTerm = document.getElementById('cmdk-empty-term');

  // ─── Build the item set ────────────────────────────────────────────────
  let items = [];
  try {
    const raw = document.getElementById('cmdk-index');
    if (raw) items = JSON.parse(raw.textContent);
  } catch (e) {
    items = [];
  }

  // Built-in actions.
  items.push({
    type: 'action', title: 'Toggle theme', hint: 'dark / light',
    run: function () {
      const btn = document.getElementById('theme-switch');
      if (btn) btn.click();
    },
  });
  items.push({ type: 'action', title: 'RSS feed', hint: 'subscribe', url: '/feed.xml' });

  const ICONS = {
    page:    '~/',
    article: '$',
    action:  '⚡',
  };

  // ─── Fuzzy subsequence match + score ──────────────────────────────────
  function score(query, item) {
    const hay = (item.title + ' ' + (item.tags || '') + ' ' + (item.hint || '')).toLowerCase();
    const q = query.toLowerCase();
    if (!q) return 0; // neutral; original order kept
    let qi = 0, s = 0, streak = 0, lastIdx = -1;
    for (let i = 0; i < hay.length && qi < q.length; i++) {
      if (hay[i] === q[qi]) {
        streak = (lastIdx === i - 1) ? streak + 1 : 1;
        s += streak * 2;
        if (i === 0 || hay[i - 1] === ' ') s += 5; // word-start bonus
        lastIdx = i;
        qi++;
      }
    }
    return qi === q.length ? s : -1; // -1 == no match (not all chars found)
  }

  // ─── Render ────────────────────────────────────────────────────────────
  let view = [];      // currently visible items
  let active = 0;     // index into view

  function render(query) {
    const q = (query || '').trim();
    if (q) {
      view = items
        .map(function (it) { return { it: it, sc: score(q, it) }; })
        .filter(function (r) { return r.sc >= 0; })
        .sort(function (a, b) { return b.sc - a.sc; })
        .map(function (r) { return r.it; });
    } else {
      view = items.slice();
    }

    list.innerHTML = '';
    if (!view.length) {
      empty.hidden = false;
      list.hidden = true;
      if (emptyTerm) emptyTerm.textContent = q;
      return;
    }
    empty.hidden = true;
    list.hidden = false;

    view.forEach(function (it, i) {
      const li = document.createElement('li');
      li.className = 'cmdk-item' + (i === active ? ' is-active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === active ? 'true' : 'false');
      li.dataset.index = i;

      const icon = document.createElement('span');
      icon.className = 'cmdk-item-icon';
      icon.textContent = ICONS[it.type] || '·';

      const title = document.createElement('span');
      title.className = 'cmdk-item-title';
      title.textContent = it.title;

      const hint = document.createElement('span');
      hint.className = 'cmdk-item-hint';
      hint.textContent = it.hint || '';

      li.appendChild(icon);
      li.appendChild(title);
      li.appendChild(hint);

      li.addEventListener('mousemove', function () { setActive(i); });
      li.addEventListener('click', function () { activate(i); });

      list.appendChild(li);
    });
  }

  function setActive(i) {
    if (i < 0) i = view.length - 1;
    if (i >= view.length) i = 0;
    active = i;
    const nodes = list.children;
    for (let n = 0; n < nodes.length; n++) {
      const on = n === active;
      nodes[n].classList.toggle('is-active', on);
      nodes[n].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    const el = nodes[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  function activate(i) {
    const it = view[i];
    if (!it) return;
    close();
    if (typeof it.run === 'function') { it.run(); return; }
    if (it.url) window.location.href = it.url;
  }

  // ─── Open / close ──────────────────────────────────────────────────────
  let lastFocus = null;

  function isOpen() { return !root.hidden; }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    input.value = '';
    active = 0;
    render('');
    requestAnimationFrame(function () { input.focus(); });
    document.body.classList.add('cmdk-open');
  }

  function close() {
    if (!isOpen()) return;
    root.hidden = true;
    document.body.classList.remove('cmdk-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function toggle() { isOpen() ? close() : open(); }

  // ─── Wiring ────────────────────────────────────────────────────────────
  input.addEventListener('input', function () { active = 0; render(input.value); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown')      { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter')     { e.preventDefault(); activate(active); }
    else if (e.key === 'Home')      { e.preventDefault(); setActive(0); }
    else if (e.key === 'End')       { e.preventDefault(); setActive(view.length - 1); }
  });

  root.querySelectorAll('[data-cmdk-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  // Global shortcuts.
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      toggle();
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    }
  });

  // Optional trigger button(s) in the nav.
  document.querySelectorAll('[data-cmdk-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
})();
