/**
 * Browser-aware Chrome Web Store CTA.
 * Chrome desktop → direct install link.
 * Safari, Firefox, Edge, mobile → email capture + store link for later.
 */
(function initSmartChromeCta() {
  const STORE_URL =
    (window.AXOL_SITE && window.AXOL_SITE.chromeWebStoreUrl) ||
    'https://chromewebstore.google.com/detail/accessibility-surfer/pccmbliammnfaklpblehkonmhcdnedhn';

  function isMobileDevice() {
    const ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(ua)) return true;
    if (/iPad|Tablet/i.test(ua)) return true;
    if (navigator.maxTouchPoints > 1 && window.matchMedia('(max-width: 1024px)').matches) return true;
    return false;
  }

  function isChromeDesktop() {
    if (isMobileDevice()) return false;
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return false;
    if (/Firefox\//.test(ua)) return false;
    if (/OPR\//.test(ua) || /Opera\//.test(ua)) return false;
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua)) return false;
    return /Chrome\//.test(ua) || /CriOS\//.test(ua);
  }

  function storeUrl() {
    return STORE_URL;
  }

  function chromeButtonHtml(variant) {
    const url = storeUrl();
    if (variant === 'nav') {
      return (
        '<a href="' + url + '" class="nav-cta" data-chrome-install rel="noopener noreferrer">' +
        'Add to Chrome — It\'s Free</a>'
      );
    }
    if (variant === 'btn') {
      return (
        '<a href="' + url + '" class="btn btn-primary" data-chrome-install rel="noopener noreferrer">' +
        'Add to Chrome — It\'s Free</a>'
      );
    }
    return (
      '<a href="' + url + '" class="hero-cta-link" data-chrome-install rel="noopener noreferrer">' +
      'Add to Chrome — It\'s Free' +
      '<svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">' +
      '<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg></a>'
    );
  }

  function emailAnchorHtml(variant) {
    if (variant === 'nav') {
      return '<a href="#get-surfer" class="nav-cta smart-cta-nav-email">Email Me a Link</a>';
    }
    return '';
  }

  function emailFormHtml(variant, id) {
    const btnClass =
      variant === 'btn' ? 'btn btn-primary smart-cta-submit' :
      variant === 'install-fallback' ? 'btn btn-ghost smart-cta-submit' :
      'hero-cta-link smart-cta-submit';
    return (
      '<form class="smart-cta-form" data-smart-cta-form novalidate>' +
        '<div class="smart-cta-fields">' +
          '<label class="sr-only" for="' + id + '">Your email</label>' +
          '<input type="email" id="' + id + '" name="email" class="smart-cta-input" ' +
            'placeholder="you@example.com" autocomplete="email" required inputmode="email" />' +
          '<button type="submit" class="' + btnClass + '">Email Me a Link</button>' +
        '</div>' +
        '<p class="smart-cta-hint">Not on Chrome? We\'ll send the install link to your email.</p>' +
        '<p class="smart-cta-status" role="status" aria-live="polite"></p>' +
      '</form>'
    );
  }

  function successHtml(url) {
    return (
      '<div class="smart-cta-success">' +
        '<p class="smart-cta-success-lead"><strong>Your link is ready.</strong> Open Chrome on a computer to install for free.</p>' +
        '<div class="smart-cta-success-actions">' +
          '<a href="' + url + '" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Open Chrome Web Store</a>' +
          '<button type="button" class="btn btn-ghost smart-cta-copy">Copy link</button>' +
        '</div>' +
        '<p class="smart-cta-success-note">Check your email app if it opened — you can save this link for later.</p>' +
      '</div>'
    );
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  function prepareEmailHandoff(email, url) {
    const subject = 'Accessibility Surfer — install on Chrome';
    const body =
      'Save this link for when you are on Chrome:\n\n' +
      url +
      '\n\nAccessibility Surfer is free. No account required.\n\n— Axol Assist';
    window.location.href =
      'mailto:' + encodeURIComponent(email) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  function bindForm(container, url) {
    const form = container.querySelector('[data-smart-cta-form]');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const status = form.querySelector('.smart-cta-status');
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.checkValidity()) {
        input && input.reportValidity();
        return;
      }

      const email = input.value.trim();
      const parent = container.closest('[data-smart-chrome-cta]') || container;
      parent.innerHTML = successHtml(url);
      parent.classList.add('is-success');

      const copyBtn = parent.querySelector('.smart-cta-copy');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          copyText(url).then(function () {
            copyBtn.textContent = 'Copied';
            setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 2200);
          }).catch(function () {});
        });
      }

      copyText(url).catch(function () {});
      setTimeout(function () { prepareEmailHandoff(email, url); }, 400);

      if (status) {
        status.textContent = 'Preparing your link…';
        status.className = 'smart-cta-status is-visible';
      }
    });
  }

  function showCopyToast(btn, toast) {
    if (toast) {
      toast.textContent = 'Link copied to clipboard';
      toast.classList.add('is-visible');
      setTimeout(function () {
        toast.classList.remove('is-visible');
        toast.textContent = '';
      }, 2800);
    }
    const orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(function () { btn.textContent = orig; }, 2200);
  }

  function initCopyStoreLinks() {
    document.querySelectorAll('[data-copy-store-link]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const url = storeUrl();
        const panel = btn.closest('.chrome-install-panel') || btn.closest('section');
        const toast = panel && panel.querySelector('[data-copy-toast]');
        copyText(url).then(function () {
          showCopyToast(btn, toast);
        }).catch(function () {});
      });
    });
  }

  function syncStoreLinks() {
    const url = storeUrl();
    document.querySelectorAll('[data-chrome-install]').forEach(function (a) {
      a.href = url;
    });
  }

  function mount(el, index) {
    const variant = el.getAttribute('data-variant') || 'hero';
    const useChrome = isChromeDesktop();

    if (variant === 'install-fallback') {
      el.classList.add('smart-cta', 'smart-cta--install-fallback');
      if (useChrome) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.classList.add('is-email');
      const inputId = 'smart-cta-email-' + index;
      el.innerHTML = emailFormHtml(variant, inputId);
      bindForm(el, storeUrl());
      return;
    }

    el.classList.add('smart-cta', 'smart-cta--' + variant);
    if (useChrome) {
      el.innerHTML = chromeButtonHtml(variant);
      el.classList.add('is-chrome');
      return;
    }

    el.classList.add('is-email');
    if (variant === 'nav') {
      el.innerHTML = emailAnchorHtml(variant);
      return;
    }

    const inputId = 'smart-cta-email-' + index;
    el.id = el.id || 'get-surfer';
    el.innerHTML = emailFormHtml(variant, inputId);
    bindForm(el, storeUrl());
  }

  function run() {
    syncStoreLinks();
    initCopyStoreLinks();
    document.querySelectorAll('[data-smart-chrome-cta]').forEach(function (el, i) {
      mount(el, i);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.AxolSmartCta = {
    isChromeDesktop: isChromeDesktop,
    isMobileDevice: isMobileDevice,
    storeUrl: storeUrl,
  };
})();
