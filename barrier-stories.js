/**
 * Barrier stories — marketing-site rail + moderated Firestore submissions.
 * Collection: barrierStories (axol-work). Public create; approved-only read.
 */
(function () {
  'use strict';

  var TAG_LABEL = {
    chrome: 'Chrome',
    'job-apply': 'Job apply',
    reading: 'Reading',
    motor: 'Motor',
    vision: 'Vision',
    websites: 'Websites',
  };

  var MAX_LEN = 240;
  var MIN_LEN = 20;

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

  function storyCardHtml(story) {
    var chips = (story.tags || [])
      .map(function (id) {
        return '<span class="story-chip">' + escapeHtml(TAG_LABEL[id] || id) + '</span>';
      })
      .join('');
    var place = story.place ? ' · ' + escapeHtml(story.place) : '';
    return (
      '<article class="story-item">' +
      '<p class="story-text">' +
      escapeHtml(story.text) +
      '</p>' +
      '<div class="story-meta">' +
      '<span class="story-by">— ' +
      escapeHtml(story.name) +
      place +
      '</span>' +
      '<span class="story-chips">' +
      chips +
      '</span>' +
      '</div>' +
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
      track.classList.remove('is-static', 'is-sparse');
      setRailVisible(false);
      return;
    }

    var html = stories.map(storyCardHtml).join('');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Always duplicate for a seamless CSS loop when motion is allowed.
    // Sparse rails get extra spacing so clones aren't visible side-by-side.
    track.innerHTML = reduce ? html : html + html;
    track.setAttribute('data-count', String(stories.length));
    track.classList.toggle('is-static', reduce);
    track.classList.toggle('is-sparse', !reduce && stories.length < 3);
    setRailVisible(true);
  }

  function selectedTags(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="tag"]:checked'))
      .map(function (el) {
        return el.value;
      })
      .slice(0, 4);
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

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var honey = form.querySelector('[name="website"]');
      if (honey && honey.value.trim()) {
        setStatus('Thanks — we’ll review it before it shows up.');
        form.reset();
        initCharCount($('story-text'));
        return;
      }

      var text = (form.elements.text.value || '').trim();
      var name = (form.elements.name.value || '').trim();
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
      if (!name) {
        setStatus('Add a first name (or a nickname).', true);
        return;
      }
      if (!tags.length) {
        setStatus('Pick at least one context chip.', true);
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
          setStatus('Got it. We review before anything goes on the rail.');
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
