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

  function renderRail(stories) {
    var track = $('storiesTrack');
    if (!track) return;

    if (!stories || !stories.length) {
      track.innerHTML = '';
      track.removeAttribute('data-count');
      track.classList.remove('is-static');
      setRailVisible(false);
      return;
    }

    var unique = stories.map(storyCardHtml).join('');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Enough cards for a seamless ribbon, then duplicate for -50% loop.
    var minCards = 6;
    var repeats = Math.max(2, Math.ceil(minCards / stories.length));
    var segment = '';
    for (var i = 0; i < repeats; i++) segment += unique;

    track.innerHTML = reduce ? unique : segment + segment;
    track.setAttribute('data-count', String(stories.length));
    track.classList.toggle('is-static', reduce);
    setRailVisible(true);
  }

  function selectedTags(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="tag"]:checked'))
      .map(function (el) {
        return el.value;
      })
      .slice(0, MAX_TAGS);
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

  function initTagLimit(form) {
    var boxes = form.querySelectorAll('input[name="tag"]');
    boxes.forEach(function (box) {
      box.addEventListener('change', function () {
        var checked = form.querySelectorAll('input[name="tag"]:checked');
        if (checked.length > MAX_TAGS) {
          box.checked = false;
          setStatus('Pick up to ' + MAX_TAGS + ' tags.', true);
          return;
        }
        if ($('storyFormStatus') && $('storyFormStatus').classList.contains('is-error')) {
          setStatus('');
        }
      });
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
    initTagLimit(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var honey = form.querySelector('[name="website"]');
      if (honey && honey.value.trim()) {
        setStatus('Thanks — every story is reviewed before publication.');
        form.reset();
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
