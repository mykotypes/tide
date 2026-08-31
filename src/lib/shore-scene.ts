// Pure math for the Shore scene's tide-wash animation, ported from
// tide-breathing.html (see spec.md). No RN/Skia/Reanimated dependency so it
// can be unit tested directly — src/components/shore-scene.tsx is the thin
// Canvas consumer.

export interface Band {
  low: number;
  high: number;
  seed: number;
  color: string;
}

// Baseline y as a fraction of canvas height at fullness 0 (`low`, tide fully
// out) and fullness 1 (`high`, tide fully in) — foam leads the wash in,
// deeper water barely moves.
export const BANDS: readonly Band[] = [
  { low: 0.86, high: 0.3, seed: 1.3, color: '#fdfdfa' }, // foam
  { low: 0.9, high: 0.46, seed: 3.1, color: '#b5e3f2' }, // pale
  { low: 0.94, high: 0.62, seed: 5.4, color: '#7fd0ec' }, // mid
  { low: 0.97, high: 0.77, seed: 7.9, color: '#3cb7e0' }, // deep
];
export const FOAM_BAND = BANDS[0];
export const PALE_BAND = BANDS[1];
export const THREAD_BANDS = [BANDS[2], BANDS[3]];

// How quickly the wet-sand mark dries back toward the current wash line
// once the tide recedes (jumps up instantly, relaxes slowly) — matches the
// prototype's wetBase easing rate.
export const WET_DRY_RATE = 0.14;

export function bandBaseY(height: number, band: Band, fullness: number): number {
  'worklet';
  return height * (band.low - (band.low - band.high) * fullness);
}

// Organic scalloped edge: three sine octaves drifting at different rates.
export function shoreEdgeY(x: number, base: number, t: number, seed: number): number {
  'worklet';
  return (
    base +
    14 * Math.sin(x / 92 + t * 0.00035 + seed) +
    7 * Math.sin(x / 46 - t * 0.00022 + seed * 2.3) +
    3.5 * Math.sin(x / 24 + t * 0.0005 + seed * 4.1)
  );
}

// One step of the wet-sand mark's easing: jumps up instantly when the wash
// reaches higher than the current mark, otherwise relaxes toward it at
// WET_DRY_RATE over dtS seconds.
export function nextWetBaseY(currentWetBaseY: number, foamY: number, dtS: number): number {
  'worklet';
  if (foamY < currentWetBaseY) return foamY;
  if (dtS <= 0) return currentWetBaseY;
  return currentWetBaseY + (foamY - currentWetBaseY) * Math.min(1, dtS * WET_DRY_RATE);
}
