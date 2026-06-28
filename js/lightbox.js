(function () {
  var overlay = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'lb-overlay';

    var img = document.createElement('img');
    img.id = 'lb-img';

    var close = document.createElement('button');
    close.id = 'lb-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';

    var caption = document.createElement('p');
    caption.id = 'lb-caption';

    overlay.appendChild(close);
    overlay.appendChild(img);
    overlay.appendChild(caption);
    document.body.appendChild(overlay);

    close.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function openLightbox(src, alt) {
    if (!overlay) buildOverlay();
    document.getElementById('lb-img').src = src;
    document.getElementById('lb-img').alt = alt || '';
    document.getElementById('lb-caption').textContent = alt || '';
    overlay.classList.add('lb-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('lb-visible');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.article-figure img').forEach(function (img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function () {
      var figcaption = img.closest('figure').querySelector('figcaption');
      var alt = figcaption ? figcaption.textContent.trim() : img.alt;
      openLightbox(img.src, alt);
    });
  });
})();
