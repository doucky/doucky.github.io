/**
 * code-peek.js
 * Transforms <details class="code-expand code-peek"> into a collapsible
 * code block that previews the first few lines when closed.
 *
 * Usage in Markdown / HTML:
 *
 *   <details class="code-expand code-peek" data-title="nanocore.cs">
 *     <div class="code-expand-body">
 *       {% highlight csharp %}
 *       ...full code...
 *       {% endhighlight %}
 *     </div>
 *   </details>
 *
 * Optional attributes:
 *   data-title="filename"   shown in the header bar
 *   data-peek-lines="4"     how many lines to preview (default: 4)
 */

(function () {
  document.querySelectorAll('details.code-peek').forEach(function (details) {
    // Skip if already initialized
    if (details.querySelector('summary')) return;

    const body = details.querySelector('.code-expand-body');
    if (!body) return;

    const title      = details.dataset.title || '';
    const peekLines  = parseInt(details.dataset.peekLines || '4', 10);

    // ── Build the <summary> ───────────────────────────────────────────────

    const summary = document.createElement('summary');

    // Header bar (arrow + optional title + expand/collapse hint)
    const bar = document.createElement('div');
    bar.className = 'ce-bar';
    bar.innerHTML =
      '<span class="ce-arrow">▶</span>' +
      (title ? '<span class="ce-title">' + escapeHtml(title) + '</span>' : '') +
      '<span class="ce-hint"></span>';
    summary.appendChild(bar);

    // Preview pane: clone the pre/highlight block and clip to N lines
    const sourceBlock = body.querySelector('.highlight, pre');
    if (sourceBlock) {
      const clone = sourceBlock.cloneNode(true);
      // Remove line-number tables if Rouge was configured with line_numbers: true
      const lineTable = clone.querySelector('table');
      if (lineTable) {
        const codeCell = lineTable.querySelector('td.code pre, td:last-child pre');
        if (codeCell) {
          clone.innerHTML = '';
          clone.appendChild(codeCell);
        }
      }

      // Clip innerHTML to peekLines lines and strip common leading whitespace
      const codeEl = clone.querySelector('code') || clone;
      let rawLines = codeEl.innerHTML.split('\n');

      // Strip common leading whitespace (fixes indentation from HTML source)
      const nonEmpty = rawLines.filter(function (l) { return l.trim().length > 0; });
      const minIndent = nonEmpty.reduce(function (min, line) {
        const m = line.match(/^(\s+)/);
        return Math.min(min, m ? m[1].length : 0);
      }, Infinity);
      if (minIndent > 0 && isFinite(minIndent)) {
        rawLines = rawLines.map(function (l) { return l.slice(minIndent); });
      }

      if (rawLines.length > peekLines) {
        rawLines = rawLines.slice(0, peekLines);
      }
      codeEl.innerHTML = rawLines.join('\n');

      const preview = document.createElement('div');
      preview.className = 'ce-preview';
      // Drive the visible height from peekLines so data-peek-lines is honored.
      // line-height 1.45 × font-size 0.8rem = 1.16rem per line, + 0.6rem top padding.
      preview.style.maxHeight = (peekLines * 1.16 + 0.6).toFixed(2) + 'rem';
      preview.appendChild(clone);

      const fade = document.createElement('div');
      fade.className = 'ce-fade';
      preview.appendChild(fade);

      summary.appendChild(preview);
    }

    // Prepend summary before the body
    details.insertBefore(summary, details.firstChild);
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
