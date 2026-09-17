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

Silhouettes are not image files and not hand-drawn primitives. Each subject is
**one SVG path string**, drawn with `fill-rule="evenodd"` so the inner contours
read as holes — the gap between a horse's legs, the Eiffel Tower's arches, a
car's wheels, the sound hole in the guitar.

The outlines were produced by a pipeline rather than by hand:

1. Generate a reference image of the subject as a flat black silhouette on
   white, in the pose the measurement assumes (side profile facing left for
   animals, front view for anything measured by height, top view for a
   wingspan).
2. Threshold it, then trace the contours — outer shapes and their holes.
3. Simplify with Douglas–Peucker, then smooth the result into cubic beziers
   through a Catmull–Rom pass that keeps a **hard corner** wherever the
   direction changes by more than 62°, so hooves, horns, beaks and antlers
   stay sharp instead of melting into curves.
4. Normalise so the longer side spans 1000 units.

Coordinates are otherwise arbitrary: the game measures each path with
`getBBox()` and rescales it, so only the proportions matter.

### Proportions are load-bearing

The bounding box is not just cosmetic. The game draws a subject at its declared
`m` along its `dim`, and the *other* axis follows from the path's aspect ratio —
so a silhouette whose proportions are wrong quietly misleads the player on the
axis they are not being scored on.

This also means the stated measurement has to describe **what the drawing
actually spans**. A horse drawn head-up is not 1.6 m tall at the withers, it is
2.1 m to the top of the head; a mouse drawn with its tail stretched out is not
9 cm, it is 17 cm nose to tail tip. Where the pose and the label disagree,
change one of them.

## Adding a subject

1. Trace a silhouette facing left, standing on the bottom of its own bounding
   box, and add its path to `silhouettes.js`.
2. Add an entry to `SUBJECTS` in `subjects.js` with `dim` (`'length'` measures
   the silhouette horizontally, `'height'` vertically), `m` (that measurement
   in metres, describing what the drawing spans), both languages, and a
   one-line fact for the reveal.
3. Add it to `PAIRS` alongside something familiar. The reference comes first —
   it is the one people reason *from*.

Figures are typical adult averages rather than record holders, and every label
says which individual is meant ("average male", "wingspan"), because *how big
is a shark* has no single answer.
