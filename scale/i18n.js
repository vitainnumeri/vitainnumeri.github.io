/* =========================================================================
   LANGUAGE
   Two languages, picked from the browser on first visit and remembered
   afterwards. Subject names live in subjects.js; this file is the interface.
   ========================================================================= */

(function (global) {
  'use strict';

  var STRINGS = {
    en: {
      tagline: 'Match the silhouette to its real-world scale.',
      round: 'ROUND', score: 'SCORE',
      startTitle: 'How big is it, really?',
      how: [
        'One silhouette is drawn at its <b>true size</b>. That is your ruler.',
        'Drag the corner handle to resize the <b>red</b> one until it looks right.',
        'Lock it in. The closer you are, the more of the 100 points you keep.'
      ],
      playDailyT: 'Daily challenge', playDailyS: 'Same 5 rounds for everyone today',
      playEndlessT: 'Random 5', playEndlessS: 'A fresh set every time',
      best: 'Your best: {n}/500',
      dailyDone: 'You already played today — {n}/500. Play it again for fun, or try a random set.',
      reference: 'Reference',
      lock: 'Lock it in', next: 'Next round', results: 'See results',
      hint: 'Drag the handle on the red silhouette. Pinch or scroll to zoom the view.',
      hintRev: 'Grey is the real size. Compare, then carry on.',
      yourAnswer: 'Your answer', actual: 'Actual',
      off: 'Off by {n}%', spotOn: 'Spot on',
      tooSmall: 'You guessed {n}× too small', tooBig: 'You guessed {n}× too big',
      toScale: 'to scale', adjust: 'drag to resize',
      lengthWord: 'length', heightWord: 'height',
      finalScore: 'Final score',
      share: 'Share result', copied: 'Copied — paste it anywhere.',
      again: 'Play again',
      ranks: [
        'No sense of scale whatsoever',
        'Wildly off, but confident',
        'Getting warmer',
        'A decent eye',
        'Sharp — you know your sizes',
        'Uncanny. Are you a surveyor?'
      ],
      dailyLabel: 'Daily'
    },

    it: {
      tagline: 'Porta la sagoma alla sua scala reale.',
      round: 'ROUND', score: 'PUNTI',
      startTitle: 'Quant\u2019è grande davvero?',
      how: [
        'Una sagoma è disegnata alla sua <b>misura vera</b>. Quello è il tuo metro.',
        'Trascina la maniglia per ridimensionare quella <b>rossa</b> finché ti sembra giusta.',
        'Conferma. Più ci vai vicino, più dei 100 punti ti restano.'
      ],
      playDailyT: 'Sfida del giorno', playDailyS: 'Oggi gli stessi 5 round per tutti',
      playEndlessT: '5 a caso', playEndlessS: 'Una serie nuova ogni volta',
      best: 'Il tuo record: {n}/500',
      dailyDone: 'Oggi hai già giocato — {n}/500. Rigiocala per divertimento, o prova una serie casuale.',
      reference: 'Riferimento',
      lock: 'Conferma', next: 'Round successivo', results: 'Vedi il risultato',
      hint: 'Trascina la maniglia sulla sagoma rossa. Pizzica o scorri per zoomare.',
      hintRev: 'Il grigio è la misura vera. Confronta, poi vai avanti.',
      yourAnswer: 'La tua risposta', actual: 'Reale',
      off: 'Sbagli del {n}%', spotOn: 'In pieno',
      tooSmall: 'L’hai fatta {n}× troppo piccola', tooBig: 'L’hai fatta {n}× troppo grande',
      toScale: 'in scala', adjust: 'trascina per ridimensionare',
      lengthWord: 'lunghezza', heightWord: 'altezza',
      finalScore: 'Punteggio finale',
      share: 'Condividi', copied: 'Copiato — incollalo dove vuoi.',
      again: 'Gioca ancora',
      ranks: [
        'Nessun senso delle proporzioni',
        'Fuori strada, ma con convinzione',
        'Ci stai arrivando',
        'Buon occhio',
        'Preciso: le misure le conosci',
        'Impressionante. Di mestiere fai il geometra?'
      ],
      dailyLabel: 'Sfida del giorno'
    }
  };

  var lang = 'en';
  try {
    var saved = localStorage.getItem('toscale.lang');
    if (saved && STRINGS[saved]) lang = saved;
    else if ((navigator.language || '').toLowerCase().indexOf('it') === 0) lang = 'it';
  } catch (e) { /* storage blocked — English it is */ }

  global.I18N = {
    get lang() { return lang; },
    set: function (l) {
      if (!STRINGS[l]) return;
      lang = l;
      try { localStorage.setItem('toscale.lang', l); } catch (e) {}
    },
    other: function () { return lang === 'it' ? 'en' : 'it'; },
    t: function (key, vars) {
      var s = STRINGS[lang][key];
      if (typeof s === 'string' && vars) {
        s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; });
      }
      return s;
    },
    /* Subject names are stored per language on the subject itself. */
    name: function (s) { return (s[lang] || s.en)[0]; },
    note: function (s) { return (s[lang] || s.en)[1]; },
    fact: function (s) { return lang === 'it' ? s.fIt : s.fEn; }
  };
})(window);
