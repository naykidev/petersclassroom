/**
 * Smart install CTA — Chrome vs other browsers / mobile.
 */
(function () {
  'use strict';

  var storeUrl = (window.AXOL_SITE && window.AXOL_SITE.chromeWebStoreUrl) ||
    'https://chromewebstore.google.com/detail/accessibility-surfer/pccmbliammnfaklpblehkonmhcdnedhn';

  function detectChromeDesktop() {
    var ua = navigator.userAgent || '';
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/Brave\//.test(ua);
    return isChrome && !isMobile;
  }

  function chromeMarkup(variant) {
    var cls = 'btn btn-primary smart-cta-chrome';
    if (variant === 'nav') cls += ' nav-cta';
    if (variant === 'inline') cls += ' smart-cta-chrome--inline';
    var label = 'Add to Chrome — It\u2019s Free';
    var arrow = variant === 'hero' || variant === 'inline'
      ? ' <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '';
    return '<a href="' + storeUrl + '" class="' + cls + '" data-chrome-install rel="noopener noreferrer">' + label + arrow + '</a>';
  }

  function emailMarkup(variant) {
    var id = 'smart-cta-' + variant + '-email';
    var compact = variant === 'nav' || variant === 'inline' || variant === 'product';
    return '<form class="smart-cta-email' + (compact ? ' smart-cta-email--compact' : '') + '" data-smart-cta-form="' + variant + '">' +
      '<label class="visually-hidden" for="' + id + '">Email address</label>' +
      '<input type="email" id="' + id + '" name="email" placeholder="Email me the install link" autocomplete="email" required />' +
      '<button type="submit">Email me a link</button>' +
      '<p class="smart-cta-status" role="status" aria-live="polite"></p>' +
    '</form>';
  }

  function handleEmailSubmit(e, statusEl) {
    e.preventDefault();
    var form = e.target.closest('[data-smart-cta-form]') || e.target;
    var input = form.querySelector('input[type="email"]');
    if (!input || !input.checkValidity()) {
      input && input.reportValidity();
      return;
    }

    var email = input.value.trim();
    var subject = encodeURIComponent('Accessibility Surfer — Chrome install link');
    var body = encodeURIComponent(
      'Hi,\n\nSend me the Chrome Web Store link for Accessibility Surfer.\n\nMy email: ' + email + '\n\nStore link: ' + storeUrl + '\n'
    );

    try { localStorage.setItem('axol-install-email', email); } catch (_) {}

    window.location.href = 'mailto:axolassist.business@gmail.com?subject=' + subject + '&body=' + body;

    if (statusEl) {
      statusEl.innerHTML = 'Opening your email app. You can also install anytime from the <a href="' + storeUrl + '" rel="noopener noreferrer">Chrome Web Store</a>.';
      statusEl.className = 'smart-cta-status is-success';
    }
  }

  document.querySelectorAll('[data-smart-cta]').forEach(function (host) {
    var variant = host.getAttribute('data-smart-cta') || 'hero';
    var isChrome = detectChromeDesktop();

    if (isChrome) {
      host.innerHTML = chromeMarkup(variant);
    } else {
      host.innerHTML = emailMarkup(variant);
      var form = host.querySelector('[data-smart-cta-form]');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          handleEmailSubmit(e, form.querySelector('.smart-cta-status'));
        });
      }
    }
  });

  document.querySelectorAll('[data-chrome-install]').forEach(function (el) {
    if (!el.href || el.href.indexOf('chromewebstore') === -1) el.href = storeUrl;
  });
})();
