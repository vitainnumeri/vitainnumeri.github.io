/* =========================================================================
   TO SCALE — game logic
   -------------------------------------------------------------------------
   One silhouette is drawn at its true size and never moves. The other starts
   at a deliberately uninformative size and the player resizes it until the
   proportion looks right. Everything is measured in metres in "world" space
   and projected to screen pixels through a single scale factor, so zooming
   and panning never touch the answer.
   ========================================================================= */

(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ROUNDS = 5;
  var t = function (k, v) { return I18N.t(k, v); };

  /* ---------------------------------------------------------------- utils */

  function el(id) { return document.getElementById(id); }

  function make(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    return n;
  }

  function num(v, digits) {
    return v.toLocaleString(I18N.lang === 'it' ? 'it-IT' : 'en-GB', {
      minimumFractionDigits: 0, maximumFractionDigits: digits
    });
  }

  /* Lengths read naturally across nine orders of magnitude. */
  function fmtLen(m) {
    if (m < 0.01) return num(m * 1000, 1) + ' mm';
    if (m < 1) return num(m * 100, 1) + ' cm';
    if (m < 1000) return num(m, m < 10 ? 2 : 1) + ' m';
    return num(m / 1000, 2) + ' km';
  }

  /* Deterministic RNG so the daily challenge is the same for everyone. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var v = Math.imul(a ^ a >>> 15, 1 | a);
      v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v;
      return ((v ^ v >>> 14) >>> 0) / 4294967296;
    };
  }

  function hashStr(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------- silhouette measuring */

  /* One path per subject, evenodd so the inner contours stay open. */
  function silhouette(art, cls, transform) {
    return make('path', {
      d: SILHOUETTES[art], class: cls, transform: transform, 'fill-rule': 'evenodd'
    });
  }

  var BBOX = {};
  (function measure() {
    var probe = make('svg', { width: 0, height: 0, style: 'position:absolute;visibility:hidden' });
    document.body.appendChild(probe);
    for (var k in SILHOUETTES) {
      var p = silhouette(k, 'sil');
      probe.appendChild(p);
      var b = p.getBBox();
      BBOX[k] = { x: b.x, y: b.y, w: b.width, h: b.height };
      probe.removeChild(p);
    }
    probe.remove();
  })();

  /* World-space footprint of a subject drawn at `metres` along its own
     measured dimension. */
  function footprint(subject, metres) {
    var b = BBOX[subject.art];
    var aspect = b.w / b.h;
    return subject.dim === 'length'
      ? { w: metres, h: metres / aspect }
      : { w: metres * aspect, h: metres };
  }

  /* --------------------------------------------------------------- rounds */

  function buildRounds(seed) {
    var rng = seed === null ? Math.random : mulberry32(seed);

    /* Draw pairs without letting one subject show up all set. Pass 0 allows
       each subject once; if the shuffled pool cannot fill five rounds that
       way, pass 1 relaxes to twice. */
    function draw(cap) {
      var pool = PAIRS.slice(), out = [], used = {};
      while (out.length < ROUNDS && pool.length) {
        var pair = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        if ((used[pair[0]] || 0) >= cap || (used[pair[1]] || 0) >= cap) continue;
        used[pair[0]] = (used[pair[0]] || 0) + 1;
        used[pair[1]] = (used[pair[1]] || 0) + 1;
        out.push(pair);
      }
      return out;
    }

    var chosen = draw(1);
    if (chosen.length < ROUNDS) chosen = draw(2);

    return chosen.map(function (pair) {
      var ref = SUBJECTS_BY_ID[pair[0]], tgt = SUBJECTS_BY_ID[pair[1]];
      /* The opening size carries no information about the answer: it is
         derived purely from the reference, so no round leaks its own
         solution through where the handle happens to start. */
      var factor = Math.exp(Math.log(0.4) + rng() * (Math.log(2.5) - Math.log(0.4)));
      var startW = footprint(ref, ref.m).w * factor;
      var tb = BBOX[tgt.art];
      var start = tgt.dim === 'length' ? startW : startW / (tb.w / tb.h);
      return { ref: ref, tgt: tgt, start: start };
    });
  }

  /* Distance is measured in log space, so being 2x too big costs the same as
     2x too small. Everything within 2% counts as exact; 6x out scores zero.
     Rough shape: 10% out ~ 94, 1.5x ~ 74, 2x ~ 57, 3x ~ 36, 5x ~ 9. */
  function scoreFor(guess, actual) {
    var d = Math.max(0, Math.abs(Math.log(guess / actual)) - 0.02);
    var r = Math.min(1, d / Math.log(6));
    return Math.max(0, Math.round(100 * (1 - Math.pow(r, 0.9))));
  }

  /* ----------------------------------------------------------------- state */

  var G = {
    mode: 'daily',
    rounds: [],
    index: 0,
    results: [],
    total: 0,
    guess: 1,
    phase: 'idle',      /* 'play' | 'reveal' */
    view: { k: 1, panX: 0, panY: 0 }
  };

  var svg = el('svg'), stage = el('stage');
  var W = 0, H = 0;

  function baseAnchor() { return { x: 26, y: H - 46 }; }
  function anchorX() { return baseAnchor().x + G.view.panX; }
  function groundY() { return baseAnchor().y + G.view.panY; }

  function current() { return G.rounds[G.index]; }

  function gapMetres() {
    var r = current();
    return footprint(r.ref, r.ref.m).w * 0.16;
  }

  function targetLeft() {
    var r = current();
    return footprint(r.ref, r.ref.m).w + gapMetres();
  }

  /* -------------------------------------------------------------- viewport */

  function measureStage() {
    var rect = stage.getBoundingClientRect();
    W = Math.max(240, rect.width);
    H = Math.max(240, rect.height);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
  }

  /* Choose a scale that shows the reference and everything currently drawn
     beside it, with room to breathe. */
  function fitView(includeActual) {
    var r = current();
    var fRef = footprint(r.ref, r.ref.m);
    var fTgt = footprint(r.tgt, G.guess);
    var right = targetLeft() + fTgt.w;
    var tall = Math.max(fRef.h, fTgt.h);

    if (includeActual) {
      var fAct = footprint(r.tgt, r.tgt.m);
      right = Math.max(right, targetLeft() + fAct.w);
      tall = Math.max(tall, fAct.h);
    }

    var padX = 52, padTop = 34, padBottom = 54;
    var k = Math.min((W - padX) / right, (H - padTop - padBottom) / tall);
    if (!isFinite(k) || k <= 0) k = 1;

    G.view.k = k;
    G.view.panX = Math.max(0, (W - padX - right * k) / 2);
    /* Lift the ground line so the scene sits in the middle of the stage
       rather than hugging the bottom edge. */
    G.view.panY = -Math.max(0, (H - padTop - padBottom - tall * k) / 2);
  }

  function zoomAt(factor, cx, cy) {
    var k = G.view.k;
    var wx = (cx - anchorX()) / k, wy = (groundY() - cy) / k;
    var nk = Math.min(1e7, Math.max(1e-5, k * factor));
    G.view.k = nk;
    G.view.panX = (cx - wx * nk) - baseAnchor().x;
    G.view.panY = (cy + wy * nk) - baseAnchor().y;
    render();
  }

  /* ---------------------------------------------------------------- render */

  /* Map a silhouette's own bbox onto a world rectangle standing on the ground. */
  function placement(art, worldX, fp) {
    var b = BBOX[art], k = G.view.k;
    var wpx = fp.w * k, hpx = fp.h * k;
    var s = wpx / b.w;
    var x = anchorX() + worldX * k;
    var y = groundY() - hpx;
    return {
      transform: 'translate(' + x + ' ' + y + ') scale(' + s + ') translate(' + (-b.x) + ' ' + (-b.y) + ')',
      x: x, y: y, w: wpx, h: hpx
    };
  }

  function label(x, y, text, cls) {
    var n = make('text', { x: x, y: y, class: cls });
    n.textContent = text;
    return n;
  }

  function render() {
    if (!G.rounds.length) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var r = current();
    var gy = groundY();

    /* ground */
    svg.appendChild(make('line', { x1: 0, y1: gy, x2: W, y2: gy, class: 'ground' }));

    /* reference — always true size */
    var fRef = footprint(r.ref, r.ref.m);
    var pRef = placement(r.ref.art, 0, fRef);
    svg.appendChild(silhouette(r.ref.art, 'sil ref', pRef.transform));
    if (G.phase === 'play') svg.appendChild(label(pRef.x, gy + 16, I18N.name(r.ref), 'tag'));

    var tl = targetLeft();

    /* the real size, revealed behind the answer */
    if (G.phase === 'reveal') {
      var fAct = footprint(r.tgt, r.tgt.m);
      var pAct = placement(r.tgt.art, tl, fAct);
      svg.appendChild(silhouette(r.tgt.art, 'sil truth', pAct.transform));
      svg.appendChild(label(pAct.x, gy + 16, t('actual'), 'tag tag-truth'));
      svg.appendChild(make('line', {
        x1: pAct.x, y1: gy, x2: pAct.x, y2: gy + 6, class: 'ticks'
      }));
    }

    /* the player's answer */
    var fTgt = footprint(r.tgt, G.guess);
    var pTgt = placement(r.tgt.art, tl, fTgt);
    svg.appendChild(silhouette(r.tgt.art,
      'sil tgt' + (G.phase === 'reveal' ? ' tgt-done' : ''), pTgt.transform));
    if (G.phase === 'reveal') {
      svg.appendChild(label(pTgt.x, gy + 30, t('yourAnswer'), 'tag tag-you'));
    }

    /* Resize handle. Its true home is the answer's top-right corner, but a
       big guess puts that off-screen, so keep it inside the stage — dragging
       works from wherever it is grabbed. */
    if (G.phase === 'play') {
      var hx = Math.min(W - 18, Math.max(18, pTgt.x + pTgt.w));
      var hy = Math.min(H - 18, Math.max(18, pTgt.y));
      var g = make('g', { class: 'handle', transform: 'translate(' + hx + ' ' + hy + ')' });
      g.appendChild(make('circle', { r: 26, class: 'handle-hit' }));
      g.appendChild(make('circle', { r: 13, class: 'handle-ring' }));
      g.appendChild(make('path', { d: 'M-5 5 L5 -5 M5 -5 L0 -5 M5 -5 L5 0', class: 'handle-arrow' }));
      svg.appendChild(g);
    }
  }

  /* ------------------------------------------------------------ interaction */

  var drag = null;

  /* Solve for the guess whose handle sits closest to the pointer, by
     projecting onto the diagonal the handle travels along. */
  function guessFromPointer(px, py) {
    var r = current(), k = G.view.k;
    var unit = footprint(r.tgt, 1);
    var ax = anchorX() + targetLeft() * k, ay = groundY();
    var dx = unit.w * k, dy = unit.h * k;
    var denom = dx * dx + dy * dy;
    if (!denom) return G.guess;
    return ((px - ax) * dx + (ay - py) * dy) / denom;
  }

  function clampGuess(v) {
    var r = current();
    return Math.min(r.ref.m * 2000, Math.max(r.ref.m / 2000, v));
  }

  function localPoint(e) {
    var rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  var pointers = {};
  var pinch = null;

  stage.addEventListener('pointerdown', function (e) {
    pointers[e.pointerId] = localPoint(e);
    var ids = Object.keys(pointers);

    if (ids.length === 2) {           /* second finger: start a pinch */
      drag = null;
      var a = pointers[ids[0]], b = pointers[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: G.view.k };
      return;
    }

    var p = pointers[e.pointerId];
    var hit = e.target.closest && e.target.closest('.handle');

    if (hit && G.phase === 'play') {
      drag = { mode: 'resize', offset: G.guess - guessFromPointer(p.x, p.y) };
    } else {
      drag = { mode: 'pan', x: p.x, y: p.y, panX: G.view.panX, panY: G.view.panY };
    }
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', function (e) {
    if (!(e.pointerId in pointers)) return;
    pointers[e.pointerId] = localPoint(e);
    var ids = Object.keys(pointers);

    if (pinch && ids.length === 2) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.d > 8) {
        zoomAt((d / pinch.d) * pinch.k / G.view.k, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      return;
    }
    if (!drag) return;
    var p = pointers[e.pointerId];

    if (drag.mode === 'resize') {
      G.guess = clampGuess(guessFromPointer(p.x, p.y) + drag.offset);
      render();
    } else {
      G.view.panX = drag.panX + (p.x - drag.x);
      G.view.panY = drag.panY + (p.y - drag.y);
      render();
    }
  });

  function endPointer(e) {
    delete pointers[e.pointerId];
    if (Object.keys(pointers).length < 2) pinch = null;
    if (!Object.keys(pointers).length) drag = null;
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = localPoint(e);
    zoomAt(Math.pow(0.9988, e.deltaY), p.x, p.y);
  }, { passive: false });

  document.addEventListener('keydown', function (e) {
    if (G.phase !== 'play') return;
    var step = e.shiftKey ? 1.15 : 1.02;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') G.guess = clampGuess(G.guess * step);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') G.guess = clampGuess(G.guess / step);
    else return;
    e.preventDefault();
    render();
  });

  el('zoomIn').addEventListener('click', function () { zoomAt(1.35, W / 2, H / 2); });
  el('zoomOut').addEventListener('click', function () { zoomAt(1 / 1.35, W / 2, H / 2); });
  el('fitBtn').addEventListener('click', function () {
    fitView(G.phase === 'reveal');
    render();
  });

  window.addEventListener('resize', function () {
    if (!G.rounds.length || el('stageWrap').hidden) return;
    measureStage();
    fitView(G.phase === 'reveal');
    render();
  });

  /* ------------------------------------------------------------------ flow */

  function startGame(mode) {
    G.mode = mode;
    G.rounds = buildRounds(mode === 'daily' ? hashStr('toscale-' + todayKey()) : null);
    G.index = 0;
    G.results = [];
    G.total = 0;

    el('startPanel').hidden = true;
    el('endPanel').hidden = true;
    el('stageWrap').hidden = false;
    el('meta').hidden = false;
    el('roundTot').textContent = ROUNDS;

    measureStage();
    beginRound();
  }

  function beginRound() {
    var r = current();
    G.guess = r.start;
    G.phase = 'play';

    el('roundNo').textContent = G.index + 1;
    el('scoreNo').textContent = G.total;

    var dimWord = t(r.tgt.dim === 'length' ? 'lengthWord' : 'heightWord');
    el('legRefName').textContent = I18N.name(r.ref);
    el('legRefNote').textContent = '(' + I18N.note(r.ref) + ' — ' + t('toScale') + ')';
    el('legTgtName').textContent = I18N.name(r.tgt);
    el('legTgtNote').textContent = '(' + I18N.note(r.tgt) + ' — ' + t('adjust') + ': ' + dimWord + ')';

    el('verdict').hidden = true;
    el('fact').hidden = true;
    el('lockBtn').hidden = false;
    el('nextBtn').hidden = true;
    el('hint').textContent = t('hint');

    measureStage();
    fitView(false);
    render();
  }

  function lockIn() {
    var r = current();
    var score = scoreFor(G.guess, r.tgt.m);
    G.total += score;
    G.results.push({ score: score, guess: G.guess, actual: r.tgt.m, tgt: r.tgt });
    G.phase = 'reveal';

    el('scoreNo').textContent = G.total;
    el('vScore').textContent = score;
    el('vYouK').textContent = t('yourAnswer');
    el('vRealK').textContent = t('actual');
    el('vYou').textContent = fmtLen(G.guess);
    el('vReal').textContent = fmtLen(r.tgt.m) + ' (' +
      t(r.tgt.dim === 'length' ? 'lengthWord' : 'heightWord') + ')';

    var ratio = G.guess / r.tgt.m;
    var offPct = Math.round(Math.abs(ratio - 1) * 100);
    if (offPct <= 5) el('vOff').textContent = t('spotOn');
    else if (ratio < 1 / 1.5) el('vOff').textContent = t('tooSmall', { n: num(1 / ratio, 1) });
    else if (ratio > 1.5) el('vOff').textContent = t('tooBig', { n: num(ratio, 1) });
    else el('vOff').textContent = t('off', { n: offPct });
    el('verdict').hidden = false;

    var fact = el('fact');
    fact.textContent = I18N.fact(r.tgt);
    fact.hidden = false;

    el('lockBtn').hidden = true;
    var next = el('nextBtn');
    next.hidden = false;
    next.textContent = G.index === ROUNDS - 1 ? t('results') : t('next');
    el('hint').textContent = t('hintRev');

    fitView(true);
    render();
  }

  function nextRound() {
    if (G.index === ROUNDS - 1) { finish(); return; }
    G.index++;
    beginRound();
  }

  function squares() {
    return G.results.map(function (r) {
      if (r.score >= 85) return '🟩';
      if (r.score >= 60) return '🟨';
      if (r.score >= 35) return '🟧';
      return '🟥';
    }).join('');
  }

  function finish() {
    G.phase = 'idle';
    el('stageWrap').hidden = true;
    el('meta').hidden = true;
    el('endPanel').hidden = false;

    el('endScore').textContent = G.total;
    var ranks = t('ranks');
    el('endRank').textContent = ranks[Math.min(ranks.length - 1, Math.floor(G.total / 500 * ranks.length))];
    el('endSquares').textContent = squares();

    var list = el('breakdown');
    list.innerHTML = '';
    G.results.forEach(function (r) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="bd-name">' + I18N.name(r.tgt) + '</span>' +
        '<span class="bd-num">' + fmtLen(r.guess) + ' <i>→</i> ' + fmtLen(r.actual) + '</span>' +
        '<span class="bd-score">' + r.score + '</span>';
      list.appendChild(li);
    });

    var best = parseInt(store('toscale.best') || '0', 10);
    if (G.total > best) store('toscale.best', String(G.total));
    if (G.mode === 'daily') store('toscale.daily.' + todayKey(), String(G.total));
    el('shareNote').hidden = true;
  }

  function shareText() {
    var head = G.mode === 'daily'
      ? 'TO SCALE · ' + t('dailyLabel') + ' ' + todayKey()
      : 'TO SCALE';
    var url = location.origin + location.pathname;
    return head + '\n' + G.total + '/500  ' + squares() + '\n' + url;
  }

  el('lockBtn').addEventListener('click', lockIn);
  el('nextBtn').addEventListener('click', nextRound);
  el('playDaily').addEventListener('click', function () { startGame('daily'); });
  el('playEndless').addEventListener('click', function () { startGame('endless'); });
  el('againBtn').addEventListener('click', function () {
    el('endPanel').hidden = true;
    el('startPanel').hidden = false;
    applyLanguage();
  });

  el('shareBtn').addEventListener('click', function () {
    var text = shareText();
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () {});
      return;
    }
    var done = function () {
      el('shareNote').textContent = t('copied');
      el('shareNote').hidden = false;
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });

  /* -------------------------------------------------------------- language */

  function applyLanguage() {
    document.documentElement.lang = I18N.lang;
    el('langBtn').textContent = I18N.other().toUpperCase();

    el('tagline').textContent = t('tagline');
    el('lblRound').textContent = t('round');
    el('lblScore').textContent = t('score');
    el('startTitle').textContent = t('startTitle');
    el('howList').innerHTML = t('how').map(function (s) { return '<li>' + s + '</li>'; }).join('');
    el('playDailyT').textContent = t('playDailyT');
    el('playDailyS').textContent = t('playDailyS');
    el('playEndlessT').textContent = t('playEndlessT');
    el('playEndlessS').textContent = t('playEndlessS');
    el('legRefK').textContent = t('reference');
    el('lockBtn').textContent = t('lock');
    el('endKicker').textContent = t('finalScore');
    el('shareBtn').textContent = t('share');
    el('againBtn').textContent = t('again');
    el('hint').textContent = t(G.phase === 'reveal' ? 'hintRev' : 'hint');

    var done = store('toscale.daily.' + todayKey());
    var best = store('toscale.best');
    var line = el('bestLine');
    if (done) { line.textContent = t('dailyDone', { n: done }); line.hidden = false; }
    else if (best) { line.textContent = t('best', { n: best }); line.hidden = false; }
    else line.hidden = true;

    if (G.rounds.length && !el('stageWrap').hidden) { beginRoundLabelsOnly(); }
    if (!el('endPanel').hidden && G.results.length) finish();
  }

  /* Re-label the live round without disturbing the player's current guess. */
  function beginRoundLabelsOnly() {
    var r = current();
    var dimWord = t(r.tgt.dim === 'length' ? 'lengthWord' : 'heightWord');
    el('legRefName').textContent = I18N.name(r.ref);
    el('legRefNote').textContent = '(' + I18N.note(r.ref) + ' — ' + t('toScale') + ')';
    el('legTgtName').textContent = I18N.name(r.tgt);
    el('legTgtNote').textContent = '(' + I18N.note(r.tgt) + ' — ' + t('adjust') + ': ' + dimWord + ')';
    if (G.phase === 'reveal') {
      el('vYouK').textContent = t('yourAnswer');
      el('vRealK').textContent = t('actual');
      el('vYou').textContent = fmtLen(G.guess);
      el('vReal').textContent = fmtLen(r.tgt.m) + ' (' + dimWord + ')';
      el('fact').textContent = I18N.fact(r.tgt);
      el('nextBtn').textContent = G.index === ROUNDS - 1 ? t('results') : t('next');
    }
    render();
  }

  el('langBtn').addEventListener('click', function () {
    I18N.set(I18N.other());
    applyLanguage();
  });

  applyLanguage();
})();
