import {
  BOX_PATTERN,
  FOUR_SEVEN_EIGHT_PATTERN,
  EIGHT_EIGHT_PATTERN,
  PATTERN_CATALOG,
  getPatternById,
  isPatternId,
} from '@/lib/patterns';

describe('pattern definitions', () => {
  it('Box is inhale 4 / hold 4 / exhale 4 / hold 4', () => {
    expect(BOX_PATTERN).toEqual([
      { name: 'inhale', durationSec: 4 },
      { name: 'hold-full', durationSec: 4 },
      { name: 'exhale', durationSec: 4 },
      { name: 'hold-empty', durationSec: 4 },
    ]);
  });

  it('4-7-8 is inhale 4 / hold 7 / exhale 8, with no second hold', () => {
    expect(FOUR_SEVEN_EIGHT_PATTERN).toEqual([
      { name: 'inhale', durationSec: 4 },
      { name: 'hold-full', durationSec: 7 },
      { name: 'exhale', durationSec: 8 },
    ]);
  });

  it('8-8 is inhale 8 / exhale 8, with no holds', () => {
    expect(EIGHT_EIGHT_PATTERN).toEqual([
      { name: 'inhale', durationSec: 8 },
      { name: 'exhale', durationSec: 8 },
    ]);
  });
});

describe('PATTERN_CATALOG / getPatternById', () => {
  it('contains exactly Box, 4-7-8, 8-8, in that order, each with a title and description', () => {
    expect(PATTERN_CATALOG.map((p) => p.id)).toEqual(['box', '4-7-8', '8-8']);
    for (const entry of PATTERN_CATALOG) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it('looks up the matching phases for a known id', () => {
    expect(getPatternById('box').phases).toBe(BOX_PATTERN);
    expect(getPatternById('4-7-8').phases).toBe(FOUR_SEVEN_EIGHT_PATTERN);
    expect(getPatternById('8-8').phases).toBe(EIGHT_EIGHT_PATTERN);
  });

  it('throws for an unknown id', () => {
    expect(() => getPatternById('not-a-real-id' as never)).toThrow();
  });
});

describe('isPatternId', () => {
  it('is true for each known pattern id', () => {
    expect(isPatternId('box')).toBe(true);
    expect(isPatternId('4-7-8')).toBe(true);
    expect(isPatternId('8-8')).toBe(true);
  });

  it('is false for unknown strings, undefined, arrays, and other non-string values', () => {
    expect(isPatternId('not-a-real-id')).toBe(false);
    expect(isPatternId(undefined)).toBe(false);
    expect(isPatternId(['box'])).toBe(false);
    expect(isPatternId(42)).toBe(false);
  });
});
