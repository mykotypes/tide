import {
  AMBIENT_SOUND_OPTIONS,
  DEFAULT_AMBIENT_SOUND_ID,
  disablesGuideSound,
  isAmbientSoundId,
  oceanVolumeForFullness,
  shouldPlayAmbientSound,
} from '@/lib/ambient-sound';

describe('AMBIENT_SOUND_OPTIONS', () => {
  it('contains Rain, None/Silence, and Ocean, in that order', () => {
    expect(AMBIENT_SOUND_OPTIONS.map((o) => o.id)).toEqual(['rain', 'none', 'ocean']);
  });

  it('each option has a non-empty label', () => {
    for (const option of AMBIENT_SOUND_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it('defaults to None, so a session never auto-plays audio unprompted', () => {
    expect(DEFAULT_AMBIENT_SOUND_ID).toBe('none');
  });
});

describe('isAmbientSoundId', () => {
  it('is true for each known id', () => {
    expect(isAmbientSoundId('rain')).toBe(true);
    expect(isAmbientSoundId('none')).toBe(true);
    expect(isAmbientSoundId('ocean')).toBe(true);
  });

  it('is false for unknown values', () => {
    expect(isAmbientSoundId('thunder')).toBe(false);
    expect(isAmbientSoundId(undefined)).toBe(false);
  });
});

describe('shouldPlayAmbientSound', () => {
  it('is true for rain', () => {
    expect(shouldPlayAmbientSound('rain')).toBe(true);
  });

  it('is true for ocean', () => {
    expect(shouldPlayAmbientSound('ocean')).toBe(true);
  });

  it('is false for none', () => {
    expect(shouldPlayAmbientSound('none')).toBe(false);
  });
});

describe('disablesGuideSound', () => {
  it('is true only for ocean', () => {
    expect(disablesGuideSound('ocean')).toBe(true);
    expect(disablesGuideSound('rain')).toBe(false);
    expect(disablesGuideSound('none')).toBe(false);
  });
});

describe('oceanVolumeForFullness', () => {
  it('is at its minimum at empty lungs (fullness 0)', () => {
    expect(oceanVolumeForFullness(0)).toBeCloseTo(0.25);
  });

  it('is at its maximum at full lungs (fullness 1)', () => {
    expect(oceanVolumeForFullness(1)).toBeCloseTo(0.9);
  });

  it('increases monotonically with fullness', () => {
    expect(oceanVolumeForFullness(0.25)).toBeLessThan(oceanVolumeForFullness(0.75));
  });

  it('clamps out-of-range fullness values', () => {
    expect(oceanVolumeForFullness(-1)).toBeCloseTo(0.25);
    expect(oceanVolumeForFullness(2)).toBeCloseTo(0.9);
  });
});
