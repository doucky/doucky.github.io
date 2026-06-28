/**
 * article-nav.js
 * Keyboard navigation between articles.
 *
 *   Ctrl + ArrowLeft  → previous post link  (.post-nav-prev — "← newer", left)
 *   Ctrl + ArrowRight → next post link      (.post-nav-next — "older →", right)
 *
 * Targets are read from the rendered prev/next links in `_layouts/post.html`,
 * so direction stays in sync with whatever the layout shows. The shortcut is
 * ignored while typing in a field or when the command palette is open, so it
 * never clobbers Ctrl+Arrow word-jumping in inputs.
 */

(function () {
  'use strict';

  const left  = document.querySelector('.post-nav-prev'); // newer
  const right = document.querySelector('.post-nav-next'); // older
  if (!left && !right) return;

  function isTyping() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function paletteOpen() {
    const cmdk = document.getElementById('cmdk');
    return cmdk && !cmdk.hidden;
  }

  document.addEventListener('keydown', function (e) {
    if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (isTyping() || paletteOpen()) return;

    const target = e.key === 'ArrowLeft' ? left : right;
    if (target && target.href) {
      e.preventDefault();
      window.location.href = target.href;
    }
  });
})();
