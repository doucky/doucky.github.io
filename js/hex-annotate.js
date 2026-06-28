/**
 * hex-annotate.js
 * Interactive annotated hex dumps.
 *
 * Markup:
 *   <div class="hex-annotated">
 *     <span class="hx" data-tip="Type ID of string">0C</span>
 *     <span class="hx" data-tip="Size of the string (10 bytes)">0A</span>
 *     <span class="hx" data-tip="Data: &quot;BufferSize&quot;">42 75 ...</span>
 *     <span class="hx-ascii">..BufferSize.....</span>
 *   </div>
 *
 * Each .hx span with a data-tip shows a floating tooltip on hover/focus.
 * Optional: group related spans with data-group="x" to highlight them together.
 */

(function () {
  const spans = document.querySelectorAll('.hex-annotated .hx[data-tip]');
  if (!spans.length) return;

  // One shared tooltip element for the whole page
  const tip = document.createElement('div');
  tip.className = 'hex-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);

  let current = null;

  function show(span) {
    current = span;
    tip.textContent = span.dataset.tip;
    tip.classList.add('is-visible');
    position(span);

    const group = span.dataset.group;
    if (group) {
      span.closest('.hex-annotated')
          .querySelectorAll('.hx[data-group="' + cssEscape(group) + '"]')
          .forEach(function (s) { s.classList.add('is-active'); });
    } else {
      span.classList.add('is-active');
    }
  }

  function hide() {
    tip.classList.remove('is-visible');
    document.querySelectorAll('.hx.is-active')
            .forEach(function (s) { s.classList.remove('is-active'); });
    current = null;
  }

  function position(span) {
    const r = span.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    let left = r.left + r.width / 2 - tr.width / 2 + window.scrollX;
    let top  = r.top - tr.height - 8 + window.scrollY;

    // Keep inside the viewport horizontally
    const margin = 8;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - tr.width - margin;
    if (left < window.scrollX + margin) left = window.scrollX + margin;
    if (left > maxLeft) left = maxLeft;

    // Flip below if there's no room above
    if (r.top - tr.height - 8 < 0) {
      top = r.bottom + 8 + window.scrollY;
      tip.classList.add('below');
    } else {
      tip.classList.remove('below');
    }

    tip.style.left = left + 'px';
    tip.style.top  = top + 'px';
  }

  spans.forEach(function (span) {
    span.tabIndex = 0;
    span.addEventListener('mouseenter', function () { show(span); });
    span.addEventListener('mouseleave', hide);
    span.addEventListener('focus', function () { show(span); });
    span.addEventListener('blur', hide);
  });

  window.addEventListener('scroll', function () {
    if (current) position(current);
  }, { passive: true });

  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/"/g, '\\"');
  }
})();
