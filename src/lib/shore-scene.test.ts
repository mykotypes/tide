import { bandBaseY, FOAM_BAND, nextWetBaseY, shoreEdgeY } from './shore-scene';

describe('bandBaseY', () => {
  it('returns the low baseline at fullness 0 (tide fully out)', () => {
    expect(bandBaseY(1000, FOAM_BAND, 0)).toBeCloseTo(1000 * FOAM_BAND.low);
  });

  it('returns the high baseline at fullness 1 (tide fully in)', () => {
    expect(bandBaseY(1000, FOAM_BAND, 1)).toBeCloseTo(1000 * FOAM_BAND.high);
  });

  it('interpolates linearly at fullness 0.5', () => {
    const expected = 1000 * ((FOAM_BAND.low + FOAM_BAND.high) / 2);
    expect(bandBaseY(1000, FOAM_BAND, 0.5)).toBeCloseTo(expected);
  });
});

describe('shoreEdgeY', () => {
  it('equals the base line when x, t, and seed are all 0 (all sine terms vanish)', () => {
    expect(shoreEdgeY(0, 500, 0, 0)).toBe(500);
  });

  it('offsets the base line by the sum of the three sine octaves', () => {
    const base = 500;
    const x = 40;
    const t = 1200;
    const seed = 2;
    const expected =
      base +
      14 * Math.sin(x / 92 + t * 0.00035 + seed) +
      7 * Math.sin(x / 46 - t * 0.00022 + seed * 2.3) +
      3.5 * Math.sin(x / 24 + t * 0.0005 + seed * 4.1);
    expect(shoreEdgeY(x, base, t, seed)).toBeCloseTo(expected);
  });
});

describe('nextWetBaseY', () => {
  it('jumps up instantly when the wash reaches higher (smaller y) than the current mark', () => {
    expect(nextWetBaseY(600, 400, 0.5)).toBe(400);
  });

  it('holds steady when dtS is 0', () => {
    expect(nextWetBaseY(600, 700, 0)).toBe(600);
  });

  it('relaxes toward the receding wash line over time, without overshooting it', () => {
    const result = nextWetBaseY(400, 700, 0.5);
    expect(result).toBeGreaterThan(400);
    expect(result).toBeLessThan(700);
  });

  it('fully catches up to the wash line once enough time has passed', () => {
    expect(nextWetBaseY(400, 700, 100)).toBeCloseTo(700);
  });
});
