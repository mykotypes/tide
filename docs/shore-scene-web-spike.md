# Spike: Shore scene rendering approach on web (ticket 04)

## Recommendation: Canvas2D re-implementation, not CanvasKit-web

**Reasoning:**

- **Bundle cost.** `@shopify/react-native-skia`'s web target loads CanvasKit's WASM
  binary at runtime (via `LoadSkiaWeb()`), which is multiple megabytes even
  gzipped — a heavy download just to paint a background wave animation, on
  a page whose whole point is to load fast in a browser tab.
- **The worklet architecture doesn't buy anything on web.** Reanimated
  worklets exist to run animation math off the JS thread so it doesn't
  block React re-renders — a real constraint on native, where the JS and
  UI threads are separate. In a browser there's one thread either way, so
  the same effect (repaint without triggering a React re-render) is just a
  plain `requestAnimationFrame` loop that mutates a `<canvas>` directly,
  with no Reanimated/Skia dependency at all.
- **The math is already 100% portable.** `src/lib/shore-scene.ts` is pure,
  dependency-free arithmetic (`bandBaseY`, `shoreEdgeY`, `nextWetBaseY`).
  The `'worklet'` directive comments are inert outside Reanimated's babel
  plugin — these functions run as ordinary JS calls unchanged. Every draw
  the native `ShoreScene` component makes (gradient fill, filled paths,
  stroked paths, circles) has a direct Canvas2D equivalent
  (`createLinearGradient`, `moveTo`/`lineTo`/`closePath`/`fill`, `stroke`,
  `arc`).

**Proof-of-concept** (this commit): `src/components/shore-scene.tsx` renders
a raw `<canvas>` element (via `React.createElement('canvas', …)`, since
react-native's JSX types don't declare a `canvas` intrinsic) sized to the
window, driven by a `requestAnimationFrame` loop that calls the ported
`bandBaseY`/`shoreEdgeY` functions to draw the sand gradient and the four
tide-wash water bands reacting to `fullness`. Sand specks, the wet-sand
persistence mark, edge foam threads, and bubbles are the remaining fidelity
gap, closed in ticket 05 — the mechanism (canvas ref + rAF loop + the same
pure math) doesn't change for those, it's just more draw calls per frame.

**Not independently verified in this environment:** live frame rate in an
actual browser tab — this sandbox has no headless browser. The `rAF`-driven
Canvas2D approach is a standard, well-understood pattern for this kind of
2D animation (no reason to expect it to struggle at the scene's complexity),
but frame rate on a real machine should be eyeballed once this runs in a
dev server (`npm run web`).
