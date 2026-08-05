/**
 * Barrier stories — card carousel + moderated Firestore submissions.
 * Collection: barrierStories (axol-work). Public create; approved-only read.
 */
(function () {
  'use strict';

  var STORY_TAGS = [
    { id: 'visual', label: 'Visual' },
    { id: 'motor-keyboard', label: 'Motor & Keyboard' },
    { id: 'screen-reader', label: 'Screen Reader' },
    { id: 'forms-inputs', label: 'Forms & Inputs' },
    { id: 'color-contrast', label: 'Color & Contrast' },
    { id: 'cognitive-focus', label: 'Cognitive & Focus' },
  ];

  /** Display labels for current + legacy tag ids. */
  var TAG_LABEL = STORY_TAGS.reduce(function (map, t) {
    map[t.id] = t.label;
    return map;
  }, {
    chrome: 'Chrome',
    'job-apply': 'Job apply',
    reading: 'Reading',
    motor: 'Motor',
    vision: 'Vision',
    websites: 'Websites',
  });

  var MAX_LEN = 240;
  var MIN_LEN = 20;
  var MAX_TAGS = 3;
  var MAX_TAG_LEN = 28;
  var MIN_TAG_LEN = 2;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tagLabel(id) {
    return TAG_LABEL[id] || id;
  }

  function storyCardHtml(story) {
    var tags = (story.tags || []).filter(Boolean);
    var chips = tags
      .map(function (id) {
        return '<span class="story-card-tag">' + escapeHtml(tagLabel(id)) + '</span>';
      })
      .join('');
    var place = story.place ? ' · ' + escapeHtml(story.place) : '';
    var tagsBlock = chips
      ? '<div class="story-card-tags">' + chips + '</div>'
      : '';

    return (
      '<article class="story-card">' +
      '<p class="story-card-text">' +
      escapeHtml(story.text) +
      '</p>' +
      '<p class="story-card-by">— ' +
      escapeHtml(story.name || 'Anonymous') +
      place +
      '</p>' +
      tagsBlock +
      '</article>'
    );
  }

  function setRailVisible(visible) {
    var rail = document.querySelector('[data-stories-rail]');
    if (rail) rail.hidden = !visible;
  }

  var railStories = [];
  var railResizeBound = false;
  var flipTimer = null;
  var flipIndex = 0;
  var flipPaused = false;
  var FLIP_MS = 5000;
  var MOBILE_FLIP_MQ = '(max-width: 900px)';
  var flipListenersBound = false;
  var lastWasMobileFlip = null;

  function stopFlip() {
    if (flipTimer) {
      clearInterval(flipTimer);
      flipTimer = null;
    }
    flipPaused = false;
  }

  function isMobileFlip() {
    return window.matchMedia(MOBILE_FLIP_MQ).matches;
  }

  function desktopTrack() {
    return $('storiesTrack');
  }

  function mobileTrack() {
    return $('storiesTrackMobile');
  }

  function dotsEl() {
    return $('storyCarouselDots');
  }

  function navEl() {
    return $('storyCarouselNav');
  }

  function setActiveCard(track, index) {
    if (!track) return;
    var cards = track.querySelectorAll('.story-card');
    cards.forEach(function (card, idx) {
      var on = idx === index;
      card.classList.toggle('is-active', on);
      card.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    var dots = dotsEl();
    if (!dots) return;
    dots.querySelectorAll('.story-carousel-dot').forEach(function (dot, idx) {
      var on = idx === index;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-selected', on ? 'true' : 'false');
      dot.tabIndex = on ? 0 : -1;
    });
  }

  function buildDots(count) {
    var dots = dotsEl();
    var nav = navEl();
    if (nav) nav.hidden = count < 2;
    if (!dots) return;
    if (count < 2) {
      dots.innerHTML = '';
      return;
    }
    var html = '';
    for (var i = 0; i < count; i++) {
      html +=
        '<button type="button" class="story-carousel-dot' +
        (i === flipIndex ? ' is-active' : '') +
        '" role="tab" aria-label="Show story ' +
        (i + 1) +
        '" aria-selected="' +
        (i === flipIndex ? 'true' : 'false') +
        '" data-index="' +
        i +
        '" tabindex="' +
        (i === flipIndex ? '0' : '-1') +
        '"></button>';
    }
    dots.innerHTML = html;
  }

  function goToFlip(index) {
    if (!railStories.length) return;
    var track = mobileTrack();
    if (!track) return;
    flipIndex = ((index % railStories.length) + railStories.length) % railStories.length;
    setActiveCard(track, flipIndex);
    restartFlipTimer(track);
  }

  function advanceFlip(track, step) {
    if (!railStories.length) return;
    var delta = typeof step === 'number' ? step : 1;
    flipIndex = (flipIndex + delta + railStories.length) % railStories.length;
    setActiveCard(track || mobileTrack(), flipIndex);
  }

  function restartFlipTimer(track) {
    if (flipTimer) clearInterval(flipTimer);
    flipTimer = null;
    if (railStories.length < 2) return;
    var t = track || mobileTrack();
    flipTimer = setInterval(function () {
      if (flipPaused) return;
      advanceFlip(t, 1);
    }, FLIP_MS);
  }

  function startFlip(track, keepIndex, autoplay) {
    stopFlip();
    if (!keepIndex) flipIndex = 0;
    if (flipIndex < 0 || flipIndex >= railStories.length) flipIndex = 0;
    setActiveCard(track, flipIndex);
    if (autoplay !== false) restartFlipTimer(track);
  }

  function bindFlipControls(root, track) {
    if (flipListenersBound || !root) return;
    flipListenersBound = true;

    function pause() {
      flipPaused = true;
    }
    function resume() {
      flipPaused = false;
    }

    root.addEventListener('pointerdown', pause, { passive: true });
    root.addEventListener('pointerup', resume, { passive: true });
    root.addEventListener('pointercancel', resume, { passive: true });
    root.addEventListener('pointerleave', resume, { passive: true });

    var prev = $('storyCarouselPrev');
    var next = $('storyCarouselNext');
    if (prev) {
      prev.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToFlip(flipIndex - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToFlip(flipIndex + 1);
      });
    }

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToFlip(flipIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToFlip(flipIndex - 1);
      }
    });

    var dots = dotsEl();
    if (dots) {
      dots.addEventListener('click', function (e) {
        var btn = e.target.closest('.story-carousel-dot');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        if (isNaN(idx)) return;
        goToFlip(idx);
      });
    }
  }

  function ensureRailResizeBound() {
    if (railResizeBound) return;
    railResizeBound = true;
    var resizeTimer = null;
    window.addEventListener(
      'resize',
      function () {
        if (!railStories.length) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var nowMobile = isMobileFlip();
          // iOS/Android chrome show/hide fires resize — don't remount the
          // carousel (that resets to story 0 and looks like tap did nothing).
          if (nowMobile === lastWasMobileFlip) {
            if (!nowMobile) {
              var desktop = desktopTrack();
              var r = document.querySelector('[data-stories-rail]');
              if (desktop) renderMarquee(desktop, r);
            }
            return;
          }
          lastWasMobileFlip = nowMobile;
          renderRail(railStories);
        }, 150);
      },
      { passive: true },
    );
  }

  function buildLoopHtml(stories, railWidth) {
    var unique = stories.map(storyCardHtml).join('');
    var measure = document.createElement('div');
    measure.style.cssText =
      'position:absolute;visibility:hidden;display:flex;gap:1rem;pointer-events:none';
    measure.innerHTML = unique;
    document.body.appendChild(measure);
    var uniqueWidth = measure.scrollWidth;
    document.body.removeChild(measure);

    var pad = 0;
    if (railWidth > 0 && uniqueWidth <= railWidth + 24) {
      pad = Math.ceil(railWidth - uniqueWidth + 96);
    }
    var spacer = pad
      ? '<span class="story-card-spacer" aria-hidden="true" style="flex:0 0 ' +
        pad +
        'px"></span>'
      : '';
    var half = unique + spacer;
    return half + half;
  }

  function renderMarquee(track, rail) {
    var mobileWrap = document.querySelector('[data-mobile-carousel]');
    if (mobileWrap) mobileWrap.hidden = true;
    track.hidden = false;
    track.classList.remove('is-flip', 'is-static');
    function applyLoop() {
      var width = rail ? rail.clientWidth : window.innerWidth;
      track.innerHTML = buildLoopHtml(railStories, width);
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(applyLoop);
    });
  }

  function renderFlip(track, keepIndex, autoplay) {
    var desktop = desktopTrack();
    var mobileWrap = document.querySelector('[data-mobile-carousel]');
    if (desktop) {
      desktop.hidden = true;
      desktop.innerHTML = '';
      desktop.classList.remove('is-flip');
    }
    if (mobileWrap) mobileWrap.hidden = false;

    stopFlip();
    track.hidden = false;
    track.classList.add('is-flip');
    track.classList.remove('is-static');
    track.innerHTML = railStories.map(storyCardHtml).join('');
    buildDots(railStories.length);
    startFlip(track, keepIndex, autoplay !== false);
    bindFlipControls(mobileWrap || track, track);
  }

  function renderRail(stories) {
    var trackDesktop = desktopTrack();
    var trackMobile = mobileTrack();
    var rail = document.querySelector('[data-stories-rail]');
    if (!trackDesktop && !trackMobile) return;

    railStories = stories || [];
    stopFlip();

    if (!railStories.length) {
      if (trackDesktop) {
        trackDesktop.innerHTML = '';
        trackDesktop.classList.remove('is-static', 'is-sparse', 'is-flip');
      }
      if (trackMobile) {
        trackMobile.innerHTML = '';
        trackMobile.classList.remove('is-static', 'is-flip');
      }
      buildDots(0);
      setRailVisible(false);
      lastWasMobileFlip = null;
      return;
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setRailVisible(true);
    lastWasMobileFlip = isMobileFlip();

    if (isMobileFlip() && trackMobile) {
      // Always show arrows/dots on mobile. Skip autoplay when reduced motion.
      renderFlip(trackMobile, false, !reduce);
    } else if (trackDesktop) {
      if (reduce) {
        var mobileWrap = document.querySelector('[data-mobile-carousel]');
        if (mobileWrap) mobileWrap.hidden = true;
        trackDesktop.hidden = false;
        trackDesktop.classList.remove('is-flip');
        trackDesktop.innerHTML = railStories.map(storyCardHtml).join('');
        trackDesktop.classList.add('is-static');
        buildDots(0);
      } else {
        renderMarquee(trackDesktop, rail);
        buildDots(0);
      }
    }

    ensureRailResizeBound();
  }

  function normalizeCustomTag(raw) {
    return String(raw || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, MAX_TAG_LEN);
  }

  function selectedTags(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="tag"]:checked'))
      .map(function (el) {
        return el.value;
      })
      .slice(0, MAX_TAGS);
  }

  function tagCount(form) {
    return form.querySelectorAll('input[name="tag"]:checked').length;
  }

  function addCustomTagPill(form, label) {
    var options = form.querySelector('.story-tag-options');
    if (!options) return false;

    var value = normalizeCustomTag(label);
    if (value.length < MIN_TAG_LEN) {
      setStatus('Custom tags need at least ' + MIN_TAG_LEN + ' characters.', true);
      return false;
    }
    if (value.length > MAX_TAG_LEN) {
      setStatus('Keep custom tags to ' + MAX_TAG_LEN + ' characters.', true);
      return false;
    }

    var existing = form.querySelectorAll('input[name="tag"]');
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].value.toLowerCase() === value.toLowerCase()) {
        if (!existing[i].checked) {
          if (tagCount(form) >= MAX_TAGS) {
            setStatus('Pick up to ' + MAX_TAGS + ' tags.', true);
            return false;
          }
          existing[i].checked = true;
        }
        setStatus('');
        return true;
      }
    }

    if (tagCount(form) >= MAX_TAGS) {
      setStatus('Pick up to ' + MAX_TAGS + ' tags.', true);
      return false;
    }

    var id = 'story-tag-custom-' + Date.now();
    var pill = document.createElement('label');
    pill.className = 'story-tag story-tag--custom';
    pill.innerHTML =
      '<input type="checkbox" name="tag" value="' +
      escapeHtml(value) +
      '" id="' +
      id +
      '" checked /> ' +
      escapeHtml(value);
    options.appendChild(pill);
    setStatus('');
    return true;
  }

  function clearCustomTagPills(form) {
    form.querySelectorAll('.story-tag--custom').forEach(function (el) {
      el.remove();
    });
  }

  function setStatus(msg, isError) {
    var el = $('storyFormStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isError);
  }

  function initCharCount(textarea) {
    var counter = $('storyCharCount');
    if (!textarea || !counter) return;
    function sync() {
      var n = textarea.value.length;
      counter.textContent = n + ' / ' + MAX_LEN;
      counter.classList.toggle('is-over', n > MAX_LEN);
    }
    textarea.addEventListener('input', sync);
    sync();
  }

  function initTagControls(form) {
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || t.name !== 'tag') return;
      if (t.checked && tagCount(form) > MAX_TAGS) {
        t.checked = false;
        setStatus('Pick up to ' + MAX_TAGS + ' tags.', true);
        return;
      }
      if ($('storyFormStatus') && $('storyFormStatus').classList.contains('is-error')) {
        setStatus('');
      }
    });

    var addBtn = $('storyTagAdd');
    var customInput = $('story-tag-custom');
    if (!addBtn || !customInput) return;

    function tryAdd() {
      var value = customInput.value;
      if (!normalizeCustomTag(value)) return;
      if (addCustomTagPill(form, value)) {
        customInput.value = '';
        customInput.focus();
      }
    }

    addBtn.addEventListener('click', function () {
      tryAdd();
    });
    customInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        tryAdd();
      }
    });
  }

  function getFirebase() {
    var cfg = window.AXOL_SITE && window.AXOL_SITE.firebase;
    if (!cfg || !window.firebase) return null;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    return firebase.firestore();
  }

  function loadApproved(db) {
    return db
      .collection('barrierStories')
      .where('approved', '==', true)
      .limit(40)
      .get()
      .then(function (snap) {
        if (snap.empty) return [];
        var list = [];
        snap.forEach(function (doc) {
          var d = doc.data();
          list.push({
            text: d.text,
            name: d.name,
            place: d.place || '',
            tags: d.tags || [],
            createdAt: d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : 0,
          });
        });
        list.sort(function (a, b) {
          return b.createdAt - a.createdAt;
        });
        return list;
      })
      .catch(function () {
        return [];
      });
  }

  function submitStory(db, payload) {
    return db.collection('barrierStories').add({
      text: payload.text,
      name: payload.name,
      place: payload.place || '',
      tags: payload.tags,
      approved: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  function initForm(db) {
    var form = $('storyForm');
    if (!form) return;

    initCharCount($('story-text'));
    initTagControls(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var honey = form.querySelector('[name="website"]');
      if (honey && honey.value.trim()) {
        setStatus('Thanks — every story is reviewed before publication.');
        form.reset();
        clearCustomTagPills(form);
        initCharCount($('story-text'));
        return;
      }

      var text = (form.elements.text.value || '').trim();
      var name = (form.elements.name.value || '').trim() || 'Anonymous';
      var place = (form.elements.place.value || '').trim();
      var tags = selectedTags(form);

      if (text.length < MIN_LEN) {
        setStatus('Give a concrete moment — at least ' + MIN_LEN + ' characters.', true);
        return;
      }
      if (text.length > MAX_LEN) {
        setStatus('Keep it to ' + MAX_LEN + ' characters.', true);
        return;
      }
      if (tags.length > MAX_TAGS) {
        setStatus('Pick up to ' + MAX_TAGS + ' tags.', true);
        return;
      }
      if (!db) {
        setStatus('Couldn’t reach the story inbox. Email axolassist.business@gmail.com instead.', true);
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      submitStory(db, { text: text, name: name, place: place, tags: tags })
        .then(function () {
          setStatus('Got it. The Axol Assist team will review it before it appears.');
          form.reset();
          clearCustomTagPills(form);
          initCharCount($('story-text'));
        })
        .catch(function () {
          setStatus('Submit failed. Try again, or email axolassist.business@gmail.com.', true);
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  function init() {
    if (!$('storiesTrack')) return;

    setRailVisible(false);

    var db = null;
    try {
      db = getFirebase();
    } catch (err) {
      db = null;
    }

    if (db) {
      loadApproved(db).then(renderRail);
    }

    initForm(db);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
