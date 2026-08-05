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

  function buildLoopHtml(stories, railWidth) {
    var unique = stories.map(storyCardHtml).join('');
    // Pad short sets so the loop half is wider than the viewport — animation
    // keeps moving without packing A–B–A–B side by side.
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

  function renderRail(stories) {
    var track = $('storiesTrack');
    var rail = document.querySelector('[data-stories-rail]');
    if (!track) return;

    railStories = stories || [];

    if (!railStories.length) {
      track.innerHTML = '';
      track.removeAttribute('data-count');
      track.classList.remove('is-static', 'is-sparse');
      setRailVisible(false);
      return;
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.setAttribute('data-count', String(railStories.length));
    track.classList.remove('is-sparse');
    setRailVisible(true);

    if (reduce) {
      track.innerHTML = railStories.map(storyCardHtml).join('');
      track.classList.add('is-static');
      return;
    }

    function applyLoop() {
      var width = rail ? rail.clientWidth : window.innerWidth;
      track.innerHTML = buildLoopHtml(railStories, width);
      track.classList.remove('is-static');
    }

    // Second frame: rail is visible and has a real width.
    requestAnimationFrame(function () {
      requestAnimationFrame(applyLoop);
    });

    if (!railResizeBound) {
      railResizeBound = true;
      window.addEventListener(
        'resize',
        function () {
          if (!railStories.length) return;
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          applyLoop();
        },
        { passive: true },
      );
    }
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
