(function () {

  /* ── Expand / collapse ──────────────────────────────────── */
  function expandGroup(group) {
    group.classList.add('expanded');
    var btn = group.querySelector('.theme-show-more');
    if (btn) {
      btn.querySelector('.show-more-text').style.display = 'none';
      btn.querySelector('.show-less-text').style.display = '';
    }
  }

  document.querySelectorAll('.theme-show-more').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var group = btn.closest('.theme-group');
      var isExpanded = group.classList.toggle('expanded');
      btn.querySelector('.show-more-text').style.display = isExpanded ? 'none' : '';
      btn.querySelector('.show-less-text').style.display = isExpanded ? '' : 'none';
    });
  });

  document.querySelectorAll('.theme-toggle').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var group = link.closest('.theme-group');
      expandGroup(group);
      group.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#' + group.id);
    });
  });

  function expandFromHash() {
    var hash = window.location.hash;
    if (!hash) return;
    var group = document.querySelector(hash);
    if (!group || !group.classList.contains('theme-group')) return;
    expandGroup(group);
    setTimeout(function () {
      group.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  expandFromHash();

  /* ── Search ─────────────────────────────────────────────── */
  var input     = document.getElementById('article-search');
  var countEl   = document.getElementById('search-count');
  var emptyEl   = document.getElementById('search-empty');
  var emptyTerm = document.getElementById('search-empty-term');
  var groups    = document.querySelectorAll('.theme-group');

  if (!input) return;

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(text, re) {
    return text.replace(re, function (m) {
      return '<mark class="search-highlight">' + m + '</mark>';
    });
  }

  function clearHighlights(el) {
    el.querySelectorAll('mark.search-highlight').forEach(function (mark) {
      var parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function runSearch() {
    var query = input.value.trim();
    var re    = query ? new RegExp(escapeRegex(query), 'gi') : null;
    var totalVisible = 0;
    var anyGroupVisible = false;

    groups.forEach(function (group) {
      var links = group.querySelectorAll('.theme-article-link');
      var groupVisible = 0;

      links.forEach(function (link) {
        var titleEl = link.querySelector('.title');
        clearHighlights(titleEl);

        var rawTitle = link.dataset.title;

        if (!re || rawTitle.match(re)) {
          link.style.display = '';
          link.removeAttribute('aria-hidden');
          groupVisible++;
          totalVisible++;
          if (re) {
            titleEl.innerHTML = highlight(titleEl.textContent, re);
          }
        } else {
          link.style.display = 'none';
          link.setAttribute('aria-hidden', 'true');
        }
      });

      var btn = group.querySelector('.theme-show-more');

      if (groupVisible === 0) {
        group.style.display = 'none';
      } else {
        group.style.display = '';
        anyGroupVisible = true;

        var countBadge = group.querySelector('.theme-count');
        if (countBadge) {
          countBadge.textContent = re ? groupVisible : countBadge.dataset.defaultCount;
        }

        if (btn) btn.style.display = re ? 'none' : '';
      }
    });

    if (!anyGroupVisible && re) {
      emptyEl.style.display = '';
      emptyTerm.textContent = query;
    } else {
      emptyEl.style.display = 'none';
    }

    if (re) {
      countEl.textContent = totalVisible + ' result' + (totalVisible !== 1 ? 's' : '');
    } else {
      countEl.textContent = '';
    }
  }

  input.addEventListener('input', runSearch);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      input.value = '';
      runSearch();
      input.blur();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input &&
        document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      input.focus();
    }
  });

})();
