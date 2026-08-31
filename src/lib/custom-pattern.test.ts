import {
  DEFAULT_CUSTOM_DURATIONS,
  clampDuration,
  customDurationsToPattern,
  getCustomDurations,
  setCustomDurations,
} from '@/lib/custom-pattern';

describe('customDurationsToPattern', () => {
  it('includes all four phases when both holds are positive', () => {
    expect(customDurationsToPattern({ inhale: 5, holdFull: 3, exhale: 6, holdEmpty: 2 })).toEqual([
      { name: 'inhale', durationSec: 5 },
      { name: 'hold-full', durationSec: 3 },
      { name: 'exhale', durationSec: 6 },
      { name: 'hold-empty', durationSec: 2 },
    ]);
  });

  it('omits hold-full when its duration is 0', () => {
    expect(customDurationsToPattern({ inhale: 5, holdFull: 0, exhale: 6, holdEmpty: 2 })).toEqual([
      { name: 'inhale', durationSec: 5 },
      { name: 'exhale', durationSec: 6 },
      { name: 'hold-empty', durationSec: 2 },
    ]);
  });

  it('omits hold-empty when its duration is 0', () => {
    expect(customDurationsToPattern({ inhale: 5, holdFull: 3, exhale: 6, holdEmpty: 0 })).toEqual([
      { name: 'inhale', durationSec: 5 },
      { name: 'hold-full', durationSec: 3 },
      { name: 'exhale', durationSec: 6 },
    ]);
  });

  it('omits both holds when both are 0, leaving just inhale/exhale', () => {
    expect(customDurationsToPattern({ inhale: 5, holdFull: 0, exhale: 6, holdEmpty: 0 })).toEqual([
      { name: 'inhale', durationSec: 5 },
      { name: 'exhale', durationSec: 6 },
    ]);
  });
});

describe('clampDuration', () => {
  it('clamps inhale/exhale to a minimum of 1', () => {
    expect(clampDuration(0, 'inhale')).toBe(1);
    expect(clampDuration(-5, 'exhale')).toBe(1);
  });

  it('allows hold durations down to 0', () => {
    expect(clampDuration(0, 'holdFull')).toBe(0);
    expect(clampDuration(-5, 'holdEmpty')).toBe(0);
  });

  it('clamps every field to a maximum of 30', () => {
    expect(clampDuration(99, 'inhale')).toBe(30);
    expect(clampDuration(99, 'holdFull')).toBe(30);
  });

  it('rounds fractional input to the nearest whole second', () => {
    expect(clampDuration(4.6, 'inhale')).toBe(5);
  });

  it('falls back to 1 (inhale/exhale) or 0 (holds) for non-finite input', () => {
    expect(clampDuration(Number.NaN, 'inhale')).toBe(1);
    expect(clampDuration(Number.NaN, 'holdFull')).toBe(0);
  });
});

describe('custom pattern store', () => {
  it('defaults to DEFAULT_CUSTOM_DURATIONS before anything is set', () => {
    expect(getCustomDurations()).toEqual(DEFAULT_CUSTOM_DURATIONS);
  });

  it('remembers the last durations written to it', () => {
    setCustomDurations({ inhale: 7, holdFull: 2, exhale: 9, holdEmpty: 1 });
    expect(getCustomDurations()).toEqual({ inhale: 7, holdFull: 2, exhale: 9, holdEmpty: 1 });

    setCustomDurations({ inhale: 3, holdFull: 0, exhale: 5, holdEmpty: 0 });
    expect(getCustomDurations()).toEqual({ inhale: 3, holdFull: 0, exhale: 5, holdEmpty: 0 });
  });
});
