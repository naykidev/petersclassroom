/**
 * Axol Assist — live page demo (homepage).
 * Lets visitors experience accessibility adjustments on the actual site.
 */
(function () {
  'use strict';

  if (!document.body || !document.body.hasAttribute('data-live-demo')) return;
  if (document.getElementById('liveDemoPanel')) return;

  var STORAGE_KEY = 'axol-live-demo-v1';
  var root = document.documentElement;

  var defaults = {
    clutter: false,
    'font-size': false,
    contrast: false,
    dyslexia: false,
    focus: false
  };

  var state;
  try {
    state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch (_) {
    state = Object.assign({}, defaults);
  }

  var guideEl = null;

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function moveGuide(e) {
    if (guideEl) guideEl.style.top = (e.clientY - 22) + 'px';
  }

  function setupGuide(on) {
    if (on) {
      if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.className = 'a11y-reading-guide';
        guideEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(guideEl);
        document.addEventListener('mousemove', moveGuide);
      }
    } else if (guideEl) {
      document.removeEventListener('mousemove', moveGuide);
      guideEl.remove();
      guideEl = null;
    }
  }

  function apply() {
    root.classList.toggle('live-clutter-reduced', !!state.clutter);
    document.body.classList.toggle('live-demo-active', Object.keys(state).some(function (k) { return state[k]; }));

    if (state['font-size']) root.setAttribute('data-text-size', 'xl');
    else root.removeAttribute('data-text-size');

    if (state.contrast) root.setAttribute('data-contrast', 'high');
    else if (!document.querySelector('.a11y-panel')) root.removeAttribute('data-contrast');

    if (state.dyslexia) root.setAttribute('data-font', 'dyslexia');
    else root.removeAttribute('data-font');

    if (state.focus) {
      root.setAttribute('data-reading-guide', 'on');
      root.setAttribute('data-highlight-headings', 'on');
      root.setAttribute('data-enhanced-focus', 'on');
      document.body.classList.add('live-focus-mode');
      setupGuide(true);
    } else {
      root.removeAttribute('data-reading-guide');
      root.removeAttribute('data-highlight-headings');
      root.removeAttribute('data-enhanced-focus');
      document.body.classList.remove('live-focus-mode');
      setupGuide(false);
    }
  }

  function syncUI() {
    panel.querySelectorAll('[data-live-toggle]').forEach(function (btn) {
      var key = btn.getAttribute('data-live-toggle');
      var on = !!state[key];
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var anyOn = Object.keys(state).some(function (k) { return state[k]; });
    resetBtn.disabled = !anyOn;
    resetBtn.setAttribute('aria-disabled', anyOn ? 'false' : 'true');
  }

  var panel = document.createElement('aside');
  panel.id = 'liveDemoPanel';
  panel.className = 'live-demo-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', 'liveDemoTitle');

  panel.innerHTML =
    '<div class="live-demo-head">' +
      '<div>' +
        '<p class="live-demo-kicker">Try it live</p>' +
        '<h2 id="liveDemoTitle">Experience Axol Assist on this page</h2>' +
      '</div>' +
      '<button type="button" class="live-demo-collapse" id="liveDemoCollapse" aria-expanded="true" aria-controls="liveDemoBody" aria-label="Collapse demo panel">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="live-demo-body" id="liveDemoBody">' +
      '<p class="live-demo-lead">Toggle a setting and watch this page change instantly. No install required.</p>' +
      '<ul class="live-demo-toggles" role="list">' +
        toggleRow('clutter', 'Reduce visual clutter', 'Hide decorative elements so content is easier to scan.') +
        toggleRow('font-size', 'Increase font size', 'Make body text larger across the page.') +
        toggleRow('contrast', 'High contrast mode', 'Sharpen text and control contrast for low vision.') +
        toggleRow('dyslexia', 'Dyslexia-friendly font', 'Switch to a more readable typeface.') +
        toggleRow('focus', 'Reading focus mode', 'Highlight headings and add a reading guide bar.') +
      '</ul>' +
      '<div class="live-demo-actions">' +
        '<button type="button" class="live-demo-reset" id="liveDemoReset" disabled aria-disabled="true">Reset page</button>' +
        '<a href="#products" class="live-demo-install">Get the full extension</a>' +
      '</div>' +
    '</div>';

  function toggleRow(key, label, desc) {
    return '<li class="live-demo-row">' +
      '<button type="button" class="live-demo-toggle" data-live-toggle="' + key + '" aria-pressed="false" aria-label="' + label + '">' +
        '<span class="live-demo-toggle-track" aria-hidden="true"><span class="live-demo-toggle-thumb"></span></span>' +
        '<span class="live-demo-toggle-copy">' +
          '<span class="live-demo-toggle-label">' + label + '</span>' +
          '<span class="live-demo-toggle-desc">' + desc + '</span>' +
        '</span>' +
      '</button>' +
    '</li>';
  }

  var resetBtn = panel.querySelector('#liveDemoReset');
  var collapseBtn = panel.querySelector('#liveDemoCollapse');

  panel.querySelectorAll('[data-live-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-live-toggle');
      state[key] = !state[key];
      save();
      apply();
      syncUI();
    });
  });

  resetBtn.addEventListener('click', function () {
    state = Object.assign({}, defaults);
    save();
    apply();
    syncUI();
  });

  collapseBtn.addEventListener('click', function () {
    var collapsed = panel.classList.toggle('is-collapsed');
    collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    collapseBtn.setAttribute('aria-label', collapsed ? 'Expand demo panel' : 'Collapse demo panel');
  });

  document.body.appendChild(panel);
  apply();
  syncUI();

  window.AxolLiveDemo = {
    open: function () {
      panel.classList.remove('is-collapsed');
      collapseBtn.setAttribute('aria-expanded', 'true');
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      var first = panel.querySelector('[data-live-toggle]');
      if (first) first.focus();
    },
    reset: function () {
      state = Object.assign({}, defaults);
      save();
      apply();
      syncUI();
    }
  };

  document.querySelectorAll('[data-open-live-demo]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.AxolLiveDemo.open();
    });
  });
})();
