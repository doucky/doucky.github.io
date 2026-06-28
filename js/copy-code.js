/**
 * copy-code.js
 * Adds a "copy" button to syntax-highlighted code blocks (.highlight).
 * Bash blocks (.bash-block) are intentionally excluded — they are not
 * .highlight elements, so they are never matched.
 */

(function () {
  document.querySelectorAll('.article-content .highlight').forEach(function (block) {
    // Rouge nests <div class="highlight"><pre class="highlight">: keep only the outer one
    if (block.parentElement && block.parentElement.closest('.highlight')) return;
    // Skip preview clones inside code-peek and already-initialized blocks
    if (block.closest('.ce-preview')) return;
    if (block.querySelector('.copy-code-btn')) return;

    const codeEl = block.querySelector('code') || block.querySelector('pre');
    if (!codeEl) return;

    block.classList.add('has-copy-btn');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.textContent = 'copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', function () {
      const text = (codeEl.innerText || codeEl.textContent || '').replace(/\n$/, '');
      copyText(text).then(function () {
        flash(btn, 'copied', 'ok');
      }).catch(function () {
        flash(btn, 'failed', 'err');
      });
    });

    block.appendChild(btn);
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  function flash(btn, label, state) {
    btn.textContent = label;
    btn.classList.add('is-' + state);
    setTimeout(function () {
      btn.textContent = 'copy';
      btn.classList.remove('is-' + state);
    }, 1500);
  }
})();
