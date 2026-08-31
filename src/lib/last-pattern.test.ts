import { DEFAULT_PATTERN_ID } from '@/lib/patterns';
import { getLastPatternId, isSelectedPatternId, setLastPatternId } from '@/lib/last-pattern';

describe('last pattern store', () => {
  it('defaults to DEFAULT_PATTERN_ID', () => {
    expect(getLastPatternId()).toBe(DEFAULT_PATTERN_ID);
  });

  it('remembers the last pattern id written to it, including custom', () => {
    setLastPatternId('4-7-8');
    expect(getLastPatternId()).toBe('4-7-8');

    setLastPatternId('custom');
    expect(getLastPatternId()).toBe('custom');
  });
});

describe('isSelectedPatternId', () => {
  it('is true for catalog ids and custom', () => {
    expect(isSelectedPatternId('box')).toBe(true);
    expect(isSelectedPatternId('4-7-8')).toBe(true);
    expect(isSelectedPatternId('8-8')).toBe(true);
    expect(isSelectedPatternId('custom')).toBe(true);
  });

  it('is false for unknown values', () => {
    expect(isSelectedPatternId('waves')).toBe(false);
    expect(isSelectedPatternId(undefined)).toBe(false);
  });
});
