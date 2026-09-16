/* =========================================================================
   SUBJECTS
   -------------------------------------------------------------------------
   Every subject carries one honest real-world measurement.

     dim   'length' measures the silhouette horizontally,
           'height' measures it vertically.
     m     that measurement, in metres.

   Figures are typical adult averages, not record holders, and the label the
   player sees always says which individual is meant ("average male", ...),
   because "how big is a shark" has no single answer.
   ========================================================================= */

(function (global) {
  'use strict';

  var SUBJECTS = [
    /* ---- people & land mammals ---- */
    { id: 'human', art: 'human', cat: 'life', dim: 'height', m: 1.75,
      en: ['Human', 'Average adult man'], it: ['Essere umano', 'Uomo adulto medio'],
      fEn: 'Half of everyone alive is within 10 cm of this.',
      fIt: 'Metà delle persone al mondo sta entro 10 cm da questa misura.' },
    { id: 'elephant', art: 'elephant', cat: 'life', dim: 'height', m: 3.2,
      en: ['African Elephant', 'Adult male, at the shoulder'], it: ['Elefante africano', 'Maschio adulto, al garrese'],
      fEn: 'The largest land animal alive — it can weigh six tonnes.',
      fIt: 'Il più grande animale terrestre vivente: può pesare sei tonnellate.' },
    { id: 'rhino', art: 'rhino', cat: 'life', dim: 'length', m: 3.7,
      en: ['White Rhinoceros', 'Average male'], it: ['Rinoceronte bianco', 'Maschio medio'],
      fEn: 'Second-heaviest land animal, and its horn is just keratin — like a fingernail.',
      fIt: 'Secondo animale terrestre più pesante; il corno è solo cheratina, come un’unghia.' },
    { id: 'hippo', art: 'hippo', cat: 'life', dim: 'length', m: 3.5,
      en: ['Hippopotamus', 'Average adult'], it: ['Ippopotamo', 'Adulto medio'],
      fEn: 'Cannot actually swim — it runs along the riverbed.',
      fIt: 'Non sa davvero nuotare: corre sul fondo del fiume.' },
    { id: 'giraffe', art: 'giraffe', cat: 'life', dim: 'height', m: 5.3,
      en: ['Giraffe', 'Adult male, to the horns'], it: ['Giraffa', 'Maschio adulto, fino alle corna'],
      fEn: 'Its neck has seven vertebrae — exactly as many as yours.',
      fIt: 'Il collo ha sette vertebre: esattamente come il tuo.' },
    { id: 'horse', art: 'horse', cat: 'life', dim: 'height', m: 2.1,
      en: ['Horse', 'Riding horse, to the top of the head'], it: ['Cavallo', 'Cavallo da sella, fino alla testa'],
      fEn: 'Horses are normally measured at the shoulder instead: that is 1.6 m.',
      fIt: 'Di solito il cavallo si misura alla spalla: lì è 1,6 m.' },
    { id: 'polar_bear', art: 'polar_bear', cat: 'life', dim: 'length', m: 2.4,
      en: ['Polar Bear', 'Adult male, nose to tail'], it: ['Orso polare', 'Maschio adulto, dal muso alla coda'],
      fEn: 'The largest land carnivore — and its skin underneath is black.',
      fIt: 'Il più grande carnivoro terrestre; sotto il pelo ha la pelle nera.' },
    { id: 'wolf', art: 'wolf', cat: 'life', dim: 'length', m: 1.3,
      en: ['Grey Wolf', 'Adult, head and body'], it: ['Lupo grigio', 'Adulto, testa e corpo'],
      fEn: 'Every dog breed on Earth descends from this animal.',
      fIt: 'Ogni razza di cane al mondo discende da questo animale.' },
    { id: 'cat', art: 'cat', cat: 'life', dim: 'length', m: 0.46,
      en: ['House Cat', 'Adult, head and body'], it: ['Gatto domestico', 'Adulto, testa e corpo'],
      fEn: 'Measured without the tail, which adds another 30 cm.',
      fIt: 'Misurato senza la coda, che aggiunge altri 30 cm.' },
    { id: 'mouse', art: 'mouse', cat: 'life', dim: 'length', m: 0.17,
      en: ['House Mouse', 'Adult, nose to tail tip'], it: ['Topolino domestico', 'Adulto, dal muso alla punta della coda'],
      fEn: 'Half of that is tail. It can squeeze through a gap the width of a pencil.',
      fIt: 'Metà è coda. Riesce a passare in una fessura larga quanto una matita.' },
    { id: 'moose', art: 'moose', cat: 'life', dim: 'height', m: 2.3,
      en: ['Moose', 'Adult male, to the top of the antlers'], it: ['Alce', 'Maschio adulto, fino ai palchi'],
      fEn: 'The biggest deer alive — its antlers alone can span 1.8 m.',
      fIt: 'Il più grande cervide vivente: solo i palchi arrivano a 1,8 m.' },
    { id: 'gorilla', art: 'gorilla', cat: 'life', dim: 'height', m: 1.7,
      en: ['Gorilla', 'Adult male, standing'], it: ['Gorilla', 'Maschio adulto, in piedi'],
      fEn: 'About as tall as a man, and roughly twice as heavy.',
      fIt: 'Alto più o meno come un uomo, e pesa circa il doppio.' },

    /* ---- birds ---- */
    { id: 'penguin', art: 'penguin', cat: 'life', dim: 'height', m: 1.15,
      en: ['Emperor Penguin', 'Adult male'], it: ['Pinguino imperatore', 'Maschio adulto'],
      fEn: 'The tallest penguin — it comes up to an adult’s waist.',
      fIt: 'Il pinguino più alto: arriva alla vita di un adulto.' },
    { id: 'ostrich', art: 'ostrich', cat: 'life', dim: 'height', m: 2.4,
      en: ['Ostrich', 'Adult male'], it: ['Struzzo', 'Maschio adulto'],
      fEn: 'The tallest bird, and the fastest thing on two legs at 70 km/h.',
      fIt: 'L’uccello più alto, e il bipede più veloce: 70 km/h.' },
    { id: 'eagle', art: 'eagle', cat: 'life', dim: 'length', m: 2.0,
      en: ['Bald Eagle', 'Adult female, wingspan'], it: ['Aquila calva', 'Femmina adulta, apertura alare'],
      fEn: 'Wingspan measured tip to tip; the bird itself is only 90 cm long.',
      fIt: 'Apertura da punta a punta; l’uccello è lungo solo 90 cm.' },
    { id: 'hummingbird', art: 'hummingbird', cat: 'life', dim: 'length', m: 0.057,
      en: ['Bee Hummingbird', 'Adult, beak to tail'], it: ['Colibrì di Elena', 'Adulto, dal becco alla coda'],
      fEn: 'The smallest bird on Earth — it weighs less than a two-euro coin.',
      fIt: 'L’uccello più piccolo al mondo: pesa meno di una moneta da due euro.' },

    /* ---- sea life ---- */
    { id: 'blue_whale', art: 'blue_whale', cat: 'sea', dim: 'length', m: 25,
      en: ['Blue Whale', 'Average adult'], it: ['Balenottera azzurra', 'Adulto medio'],
      fEn: 'The largest animal that has ever lived, dinosaurs included.',
      fIt: 'Il più grande animale mai esistito, dinosauri compresi.' },
    { id: 'orca', art: 'orca', cat: 'sea', dim: 'length', m: 7.0,
      en: ['Orca', 'Adult male'], it: ['Orca', 'Maschio adulto'],
      fEn: 'Technically the largest dolphin, not a whale.',
      fIt: 'Tecnicamente il più grande delfino, non una balena.' },
    { id: 'shark', art: 'shark', cat: 'sea', dim: 'length', m: 4.6,
      en: ['Great White Shark', 'Average adult female'], it: ['Squalo bianco', 'Femmina adulta media'],
      fEn: 'Females run about a metre longer than males.',
      fIt: 'Le femmine sono circa un metro più lunghe dei maschi.' },
    { id: 'manta', art: 'manta', cat: 'sea', dim: 'length', m: 5.5,
      en: ['Giant Manta Ray', 'Adult female, wingspan'], it: ['Manta gigante', 'Femmina adulta, apertura alare'],
      fEn: 'Measured wingtip to wingtip; the biggest reach seven metres.',
      fIt: 'Misurata da punta a punta: le più grandi raggiungono sette metri.' },
    { id: 'squid', art: 'squid', cat: 'sea', dim: 'height', m: 10,
      en: ['Giant Squid', 'Adult female, with tentacles'], it: ['Calamaro gigante', 'Femmina adulta, con i tentacoli'],
      fEn: 'Has the largest eye in the animal kingdom, the size of a dinner plate.',
      fIt: 'Ha l’occhio più grande del regno animale, come un piatto da portata.' },
    { id: 'crocodile', art: 'crocodile', cat: 'sea', dim: 'length', m: 4.5,
      en: ['Saltwater Crocodile', 'Average adult male'], it: ['Coccodrillo marino', 'Maschio adulto medio'],
      fEn: 'The largest living reptile; big males pass six metres.',
      fIt: 'Il più grande rettile vivente: i maschi grandi superano i sei metri.' },
    { id: 'komodo', art: 'komodo', cat: 'life', dim: 'length', m: 2.5,
      en: ['Komodo Dragon', 'Adult male'], it: ['Drago di Komodo', 'Maschio adulto'],
      fEn: 'The largest lizard alive, and it lives on just five islands.',
      fIt: 'La lucertola più grande vivente, e vive su sole cinque isole.' },

    /* ---- dinosaurs ---- */
    { id: 'trex', art: 'trex', cat: 'dino', dim: 'length', m: 12.3,
      en: ['Tyrannosaurus rex', 'Adult, nose to tail'], it: ['Tyrannosaurus rex', 'Adulto, dal muso alla coda'],
      fEn: 'Lived closer in time to you than to Stegosaurus.',
      fIt: 'È vissuto più vicino a te nel tempo che allo Stegosauro.' },
    { id: 'brachiosaurus', art: 'brachiosaurus', cat: 'dino', dim: 'height', m: 12,
      en: ['Brachiosaurus', 'Adult, head height'], it: ['Brachiosauro', 'Adulto, altezza della testa'],
      fEn: 'Tall enough to look into a fourth-floor window.',
      fIt: 'Abbastanza alto da guardare dentro una finestra al quarto piano.' },
    { id: 'velociraptor', art: 'velociraptor', cat: 'dino', dim: 'length', m: 2.0,
      en: ['Velociraptor', 'Adult, nose to tail'], it: ['Velociraptor', 'Adulto, dal muso alla coda'],
      fEn: 'Turkey-sized and feathered. The films made it six times too big.',
      fIt: 'Grande come un tacchino e piumato. I film lo hanno fatto sei volte troppo grande.' },

    /* ---- bugs ---- */
    { id: 'tarantula', art: 'tarantula', cat: 'life', dim: 'length', m: 0.28,
      en: ['Goliath Birdeater', 'Adult, leg span'], it: ['Tarantola Golia', 'Adulto, apertura delle zampe'],
      fEn: 'The largest spider on Earth — it covers a dinner plate.',
      fIt: 'Il ragno più grande del mondo: copre un piatto da portata.' },
    { id: 'bee', art: 'bee', cat: 'life', dim: 'length', m: 0.015,
      en: ['Honeybee', 'Worker'], it: ['Ape', 'Operaia'],
      fEn: 'One worker makes a twelfth of a teaspoon of honey in its whole life.',
      fIt: 'Un’operaia produce un dodicesimo di cucchiaino di miele in tutta la vita.' },

    /* ---- machines ---- */
    { id: 'car', art: 'car', cat: 'made', dim: 'length', m: 4.7,
      en: ['Family Car', 'Mid-size saloon'], it: ['Automobile', 'Berlina media'],
      fEn: 'Cars have grown about 40 cm longer since the 1990s.',
      fIt: 'Le auto sono cresciute di circa 40 cm dagli anni ’90.' },
    { id: 'bus', art: 'bus', cat: 'made', dim: 'length', m: 12,
      en: ['City Bus', 'Standard single-decker'], it: ['Autobus urbano', 'Vettura singola standard'],
      fEn: 'Twelve metres is the usual legal limit for a rigid bus.',
      fIt: 'Dodici metri è il limite di legge abituale per un autobus rigido.' },
    { id: 'bicycle', art: 'bicycle', cat: 'made', dim: 'length', m: 1.75,
      en: ['Bicycle', 'Adult road bike'], it: ['Bicicletta', 'Bici da strada per adulti'],
      fEn: 'About as long as its rider is tall.',
      fIt: 'Lunga più o meno quanto è alto chi la guida.' },
    { id: 'plane', art: 'plane', cat: 'made', dim: 'length', m: 70.6,
      en: ['Boeing 747', 'The -400, nose to tail'], it: ['Boeing 747', 'Versione -400, dal muso alla coda'],
      fEn: 'Its wing alone is longer than the Wright brothers’ first flight.',
      fIt: 'Una sola ala è più lunga del primo volo dei fratelli Wright.' },
    { id: 'ship', art: 'ship', cat: 'made', dim: 'length', m: 397,
      en: ['Container Ship', 'Emma Mærsk class'], it: ['Nave portacontainer', 'Classe Emma Mærsk'],
      fEn: 'Longer than the Empire State Building is tall.',
      fIt: 'Più lunga di quanto sia alto l’Empire State Building.' },
    { id: 'rocket', art: 'rocket', cat: 'made', dim: 'height', m: 110.6,
      en: ['Saturn V', 'Full launch stack'], it: ['Saturn V', 'Razzo completo al lancio'],
      fEn: 'The tallest rocket ever flown to the Moon.',
      fIt: 'Il razzo più alto mai volato verso la Luna.' },

    /* ---- landmarks & everyday objects ---- */
    { id: 'eiffel', art: 'eiffel', cat: 'made', dim: 'height', m: 330,
      en: ['Eiffel Tower', 'Including the antenna'], it: ['Torre Eiffel', 'Antenna compresa'],
      fEn: 'It grows about 15 cm taller on a hot summer day.',
      fIt: 'In una giornata calda si allunga di circa 15 cm.' },
    { id: 'liberty', art: 'liberty', cat: 'made', dim: 'height', m: 93,
      en: ['Statue of Liberty', 'Ground to torch'], it: ['Statua della Libertà', 'Da terra alla fiaccola'],
      fEn: 'The statue alone is 46 m; the pedestal doubles it.',
      fIt: 'La statua da sola è 46 m; il piedistallo la raddoppia.' },
    { id: 'guitar', art: 'guitar', cat: 'made', dim: 'length', m: 1.0,
      en: ['Acoustic Guitar', 'Full size'], it: ['Chitarra acustica', 'Misura intera'],
      fEn: 'A full-size dreadnought is almost exactly one metre.',
      fIt: 'Una dreadnought a misura intera è quasi esattamente un metro.' },
    { id: 'phone', art: 'phone', cat: 'made', dim: 'height', m: 0.147,
      en: ['Smartphone', 'Typical handset'], it: ['Smartphone', 'Telefono tipico'],
      fEn: 'The thing you are almost certainly holding right now.',
      fIt: 'L’oggetto che quasi sicuramente stai tenendo in mano.' },
    { id: 'fridge', art: 'fridge', cat: 'made', dim: 'height', m: 1.8,
      en: ['Fridge-Freezer', 'Tall domestic model'], it: ['Frigorifero', 'Modello alto da casa'],
      fEn: 'Built to stand just under the average kitchen cupboard.',
      fIt: 'Costruito per stare appena sotto il pensile medio da cucina.' },
    { id: 'door', art: 'door', cat: 'made', dim: 'height', m: 2.03,
      en: ['Doorway', 'Standard interior door'], it: ['Porta', 'Porta interna standard'],
      fEn: 'Standardised so that almost everybody clears it.',
      fIt: 'Standardizzata perché quasi tutti ci passino sotto.' },
    { id: 'basketball', art: 'basketball', cat: 'made', dim: 'length', m: 0.24,
      en: ['Basketball', 'Size 7, diameter'], it: ['Pallone da basket', 'Misura 7, diametro'],
      fEn: 'The hoop it goes through is almost twice as wide.',
      fIt: 'Il canestro in cui entra è largo quasi il doppio.' }
  ];

  /* Hand-picked matchups: each one is a comparison that tends to surprise
     people. [reference, target] — the reference is the more familiar of the
     two, because that is the one you reason from. */
  var PAIRS = [
    ['manta', 'rhino'], ['gorilla', 'penguin'], ['human', 'ostrich'],
    ['car', 'orca'], ['bus', 'blue_whale'], ['human', 'velociraptor'],
    ['elephant', 'giraffe'], ['human', 'trex'], ['cat', 'tarantula'],
    ['human', 'moose'], ['door', 'horse'], ['phone', 'mouse'],
    ['bee', 'hummingbird'], ['human', 'komodo'], ['bicycle', 'crocodile'],
    ['liberty', 'plane'], ['eiffel', 'ship'], ['liberty', 'rocket'],
    ['human', 'shark'], ['car', 'squid'], ['human', 'polar_bear'],
    ['human', 'wolf'], ['basketball', 'cat'], ['guitar', 'eagle'],
    ['fridge', 'gorilla'], ['human', 'brachiosaurus'], ['bus', 'trex'],
    ['plane', 'blue_whale'], ['car', 'hippo'], ['human', 'penguin'],
    ['mouse', 'bee'], ['horse', 'wolf'], ['elephant', 'car'],
    ['giraffe', 'bus'], ['shark', 'orca'], ['human', 'elephant'],
    ['door', 'ostrich'], ['guitar', 'tarantula'], ['bicycle', 'komodo'],
    ['car', 'trex'], ['human', 'manta'], ['phone', 'bee'],
    ['fridge', 'penguin'], ['bus', 'plane'], ['rocket', 'eiffel'],
    ['human', 'giraffe'], ['cat', 'mouse'], ['horse', 'moose'],
    ['ship', 'blue_whale'], ['basketball', 'hummingbird']
  ];

  var BY_ID = {};
  SUBJECTS.forEach(function (s) { BY_ID[s.id] = s; });

  global.SUBJECTS = SUBJECTS;
  global.SUBJECTS_BY_ID = BY_ID;
  global.PAIRS = PAIRS.filter(function (p) { return BY_ID[p[0]] && BY_ID[p[1]]; });
})(window);
