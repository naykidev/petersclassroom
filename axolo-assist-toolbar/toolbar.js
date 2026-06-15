(function () {
  'use strict';

  var config = window.axoloAssistToolbar || {};
  var STORAGE_KEY = config.storageKey || 'pc-a11y-settings-v1';
  var root = document.documentElement;

  var toggleBtn = document.getElementById('a11yToggle');
  var panel = document.getElementById('a11yPanel');
  var overlay = document.getElementById('a11yOverlay');
  var closeBtn = document.getElementById('a11yClose');
  var resetBtn = document.getElementById('a11yReset');

  if (!toggleBtn || !panel || !overlay || !closeBtn || !resetBtn) {
    return;
  }

  if (config.iconUrl) {
    var icon = toggleBtn.querySelector('img');
    if (icon) {
      icon.src = config.iconUrl;
    }
  }

  if (config.fontBaseUrl) {
    var styleId = 'aat-dyslexia-fonts';
    if (!document.getElementById(styleId)) {
      var fontStyle = document.createElement('style');
      fontStyle.id = styleId;
      fontStyle.textContent =
        "@font-face{font-family:'OpenDyslexic';font-style:normal;font-weight:400;font-display:swap;src:url('" +
        config.fontBaseUrl +
        "opendyslexic-7.woff') format('woff');}" +
        "@font-face{font-family:'OpenDyslexic';font-style:normal;font-weight:700;font-display:swap;src:url('" +
        config.fontBaseUrl +
        "opendyslexic-8.woff') format('woff');}";
      document.head.appendChild(fontStyle);
    }
  }

  var defaults = {
    'text-size': 'default',
    'line-spacing': 'default',
    'letter-spacing': 'default',
    font: 'default',
    contrast: 'default',
    saturation: 'default',
    'underline-links': 'off',
    'enhanced-focus': 'off',
    'highlight-headings': 'off',
    'reading-guide': 'off',
    'reduce-motion': 'off',
    'pause-animations': 'off',
    'big-cursor': 'off'
  };

  var settings;
  try {
    settings = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch (e) {
    settings = Object.assign({}, defaults);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      /* ignore quota / private mode */
    }
  }

  function apply() {
    Object.keys(defaults).forEach(function (key) {
      var val = settings[key];
      if (val === 'default' || val === 'off' || val === undefined) {
        root.removeAttribute('data-' + key);
      } else {
        root.setAttribute('data-' + key, val);
      }
    });
    setupReadingGuide();
  }

  function syncUI() {
    document.querySelectorAll('.a11y-btn[data-setting]').forEach(function (btn) {
      var active = settings[btn.dataset.setting] === btn.dataset.value;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.querySelectorAll('.a11y-switch[data-toggle]').forEach(function (sw) {
      sw.setAttribute('aria-checked', settings[sw.dataset.toggle] === 'on' ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.a11y-btn[data-setting]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      settings[btn.dataset.setting] = btn.dataset.value;
      save();
      apply();
      syncUI();
    });
  });

  document.querySelectorAll('.a11y-switch[data-toggle]').forEach(function (sw) {
    sw.addEventListener('click', function () {
      var key = sw.dataset.toggle;
      settings[key] = settings[key] === 'on' ? 'off' : 'on';
      save();
      apply();
      syncUI();
    });
  });

  resetBtn.addEventListener('click', function () {
    settings = Object.assign({}, defaults);
    save();
    apply();
    syncUI();
  });

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('open');
    root.classList.add('a11y-locked');
    toggleBtn.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(function () {
      panel.focus();
    }, 50);
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    root.classList.remove('a11y-locked');
    toggleBtn.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', function () {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
    }
    if (e.key !== 'Tab' || !panel.classList.contains('open')) {
      return;
    }
    var focusable = Array.prototype.slice
      .call(
        panel.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return !el.disabled;
      });
    if (!focusable.length) {
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  var guideEl = null;

  function moveGuide(e) {
    if (guideEl) {
      guideEl.style.top = e.clientY - 22 + 'px';
    }
  }

  function setupReadingGuide() {
    if (settings['reading-guide'] === 'on') {
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

  apply();
  syncUI();
})();
