import { resolvePatternId, resolvePatternPhases } from '@/lib/resolve-pattern';
import { BOX_PATTERN, FOUR_SEVEN_EIGHT_PATTERN } from '@/lib/patterns';
import { setCustomDurations, customDurationsToPattern } from '@/lib/custom-pattern';

describe('resolvePatternId', () => {
  it('resolves a known fixed-catalog id as-is', () => {
    expect(resolvePatternId('4-7-8')).toBe('4-7-8');
  });

  it('resolves "custom" as-is', () => {
    expect(resolvePatternId('custom')).toBe('custom');
  });

  it('falls back to Box for a missing or unknown id', () => {
    expect(resolvePatternId(undefined)).toBe('box');
    expect(resolvePatternId('not-a-real-id')).toBe('box');
  });
});

describe('resolvePatternPhases', () => {
  it('resolves a known fixed-catalog id to its phases', () => {
    expect(resolvePatternPhases('4-7-8')).toBe(FOUR_SEVEN_EIGHT_PATTERN);
  });

  it('falls back to Box for a missing or unknown id', () => {
    expect(resolvePatternPhases(undefined)).toBe(BOX_PATTERN);
    expect(resolvePatternPhases('not-a-real-id')).toBe(BOX_PATTERN);
  });

  it('resolves "custom" to the current custom durations, not the fixed catalog', () => {
    setCustomDurations({ inhale: 9, holdFull: 1, exhale: 5, holdEmpty: 0 });
    expect(resolvePatternPhases('custom')).toEqual(
      customDurationsToPattern({ inhale: 9, holdFull: 1, exhale: 5, holdEmpty: 0 })
    );
  });
});
