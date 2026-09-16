# TO SCALE

A browser game about size. One silhouette is drawn at its **true size** — that
is the only ruler you get. Drag the corner handle on the red silhouette until
it looks right next to it, lock it in, and find out how wrong you were.

Five rounds, 100 points each. Plays in Italian and English.

**Live:** https://vitainnumeri.github.io/scale/

---

## How it works

Everything is measured in metres in a "world" coordinate space and projected
to screen pixels through a single scale factor, so zooming and panning can
never change the answer. The reference is pinned to its real size; the target
is whatever the player has dragged it to.

Two rules keep a round honest:

- **The starting size leaks nothing.** It is derived from the *reference*
  (a random 0.4×–2.5× of its on-screen width), never from the answer, so no
  round gives away its own solution through where the handle begins.
- **Error is measured in log space.** Guessing 2× too big costs exactly what
  2× too small costs. Within 2% counts as exact; 6× out scores zero.
  Roughly: 10% out ≈ 94, 1.5× ≈ 75, 2× ≈ 59, 3× ≈ 37, 5× ≈ 10.

The **daily challenge** seeds its five rounds from the date, so everyone
playing on the same day gets the same set and scores are comparable.

## Files

| File | What it does |
|------|--------------|
| `index.html` | Markup — start screen, stage, result screen |
| `style.css` | Styling, mobile first |
| `game.js` | Game loop, view transform, drag/zoom/pan, scoring |
| `subjects.js` | The 43 subjects with their real measurements, and the curated matchups |
| `silhouettes.js` | The artwork |
| `i18n.js` | Italian and English interface strings |

No build step, no dependencies, no server. Open `index.html`, or:

```bash
python3 -m http.server 8000
```

## The artwork

Silhouettes are not image files. Each one is a short list of overlapping
primitives — ellipses, rounded rectangles, polygons, and tapered limbs swept
along a curve — compiled into SVG paths at load time:

```js
rhino: [
  ['e', 104, 48, 50, 26],                    // barrel
  ['e', 56, 58, 30, 19, -10],                // lowered head
  ['p', 'M33 53C28 49 24 43 22 36C30 40…'],  // horn
  ['r', 64, 62, 19, 38, 7],                  // foreleg
  ['l', [152, 40], [162, 54], [158, 72], 5, 2]   // tail
]
```

`['m', axisX, [...]]` mirrors a group of shapes, which is how anything
symmetrical (arms, legs, wings, spider legs) is drawn once instead of twice.

Each primitive stays a **separate path** under a shared group rather than
being concatenated into one `d` string. Merging them would leave the nonzero
fill rule to decide what happens where two shapes overlap, and any pair with
opposite winding directions punches a hole — which showed up as dark bands
across the giraffe's neck and the elephant's trunk.

Coordinates are arbitrary. The game measures each finished group with
`getBBox()` and rescales it, so only proportions matter.

## Adding a subject

1. Draw it in `silhouettes.js` facing left, standing on the bottom of its own
   bounding box.
2. Add an entry to `SUBJECTS` in `subjects.js` with `dim` (`'length'` measures
   the silhouette horizontally, `'height'` vertically), `m` (that measurement
   in metres), both languages, and a one-line fact for the reveal.
3. Add it to `PAIRS` alongside something familiar. The reference comes first —
   it is the one people reason *from*.

Figures are typical adult averages rather than record holders, and every label
says which individual is meant ("average male", "wingspan"), because *how big
is a shark* has no single answer.
