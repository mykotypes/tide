import {
  getSessionLengthBounds,
  clampCycles,
  formatDuration,
  durationLabelForCycles,
  formatCompletionSummary,
} from '@/lib/session-length';
import { BOX_PATTERN, FOUR_SEVEN_EIGHT_PATTERN, EIGHT_EIGHT_PATTERN } from '@/lib/patterns';
import type { Pattern } from '@/lib/session-engine';

describe('getSessionLengthBounds — fixed patterns', () => {
  it('bounds Box to 4-16 cycles', () => {
    expect(getSessionLengthBounds('box', BOX_PATTERN)).toEqual({ min: 4, max: 16 });
  });

  it('bounds 4-7-8 to 4-8 cycles', () => {
    expect(getSessionLengthBounds('4-7-8', FOUR_SEVEN_EIGHT_PATTERN)).toEqual({ min: 4, max: 8 });
  });

  it('bounds 8-8 to 4-16 cycles', () => {
    expect(getSessionLengthBounds('8-8', EIGHT_EIGHT_PATTERN)).toEqual({ min: 4, max: 16 });
  });
});

describe('getSessionLengthBounds — custom pattern, bounded by resulting duration', () => {
  it('derives min/max cycles from a ~1-10 minute duration window', () => {
    const twentySecondCycle: Pattern = [
      { name: 'inhale', durationSec: 10 },
      { name: 'exhale', durationSec: 10 },
    ];
    // 60s / 20s = 3 cycles minimum, 600s / 20s = 30 cycles maximum
    expect(getSessionLengthBounds('custom', twentySecondCycle)).toEqual({ min: 3, max: 30 });
  });

  it('never lets max fall below min, even for a very long per-cycle duration', () => {
    const longCycle: Pattern = [
      { name: 'inhale', durationSec: 30 },
      { name: 'hold-full', durationSec: 30 },
      { name: 'exhale', durationSec: 30 },
      { name: 'hold-empty', durationSec: 30 },
    ];
    const bounds = getSessionLengthBounds('custom', longCycle);
    expect(bounds.max).toBeGreaterThanOrEqual(bounds.min);
  });
});

describe('clampCycles', () => {
  const bounds = { min: 4, max: 16 };

  it('clamps below min up to min', () => {
    expect(clampCycles(1, bounds)).toBe(4);
  });

  it('clamps above max down to max', () => {
    expect(clampCycles(99, bounds)).toBe(16);
  });

  it('rounds fractional values', () => {
    expect(clampCycles(8.6, bounds)).toBe(9);
  });

  it('passes through values already in range', () => {
    expect(clampCycles(10, bounds)).toBe(10);
  });

  it('falls back to the minimum for non-finite input (e.g. a missing route param)', () => {
    expect(clampCycles(Number.NaN, bounds)).toBe(4);
    expect(clampCycles(Number(undefined), bounds)).toBe(4);
  });
});

describe('formatDuration', () => {
  it('formats whole minutes with :00 seconds', () => {
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats sub-minute durations with a leading 0', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
  });

  it('formats minutes and seconds together', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  it('rolls over into the next minute instead of showing 60 seconds', () => {
    expect(formatDuration(59.6)).toBe('1:00');
  });

  it('rounds to the nearest second', () => {
    expect(formatDuration(62.6)).toBe('1:03');
  });
});

describe('durationLabelForCycles', () => {
  it('multiplies cycles by the pattern cycle duration and formats it', () => {
    expect(durationLabelForCycles(4, BOX_PATTERN)).toBe('1:04');
    expect(durationLabelForCycles(8, FOUR_SEVEN_EIGHT_PATTERN)).toBe('2:32');
  });
});

describe('formatCompletionSummary', () => {
  it('combines the cycle count and duration label, e.g. "16 cycles · 4:32 done"', () => {
    expect(formatCompletionSummary(16, BOX_PATTERN)).toBe('16 cycles · 4:16 done');
    expect(formatCompletionSummary(8, FOUR_SEVEN_EIGHT_PATTERN)).toBe('8 cycles · 2:32 done');
  });

  it('singularizes "cycle" for a single-cycle session', () => {
    expect(formatCompletionSummary(1, BOX_PATTERN)).toBe('1 cycle · 0:16 done');
  });
});
