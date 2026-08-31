import {
  GUIDE_SOUND_OPTIONS,
  DEFAULT_GUIDE_SOUND_ID,
  hasPhaseChanged,
  isGuideSoundId,
  isVoiceGuideSoundId,
  voiceAssetKeyFor,
  wordForPhase,
} from '@/lib/guide-sound';

describe('GUIDE_SOUND_OPTIONS', () => {
  it('contains exactly the four v2 options, in catalog order', () => {
    expect(GUIDE_SOUND_OPTIONS.map((o) => o.id)).toEqual(['voice-male', 'voice-female', 'vibrate', 'none']);
  });

  it('each option has a non-empty label', () => {
    for (const option of GUIDE_SOUND_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it('defaults to the first catalog option', () => {
    expect(DEFAULT_GUIDE_SOUND_ID).toBe('voice-male');
  });
});

describe('isGuideSoundId', () => {
  it('is true for each known id', () => {
    for (const option of GUIDE_SOUND_OPTIONS) {
      expect(isGuideSoundId(option.id)).toBe(true);
    }
  });

  it('is false for unknown values, including the old v1 catalog', () => {
    expect(isGuideSoundId('not-a-real-id')).toBe(false);
    expect(isGuideSoundId(undefined)).toBe(false);
    expect(isGuideSoundId('chime')).toBe(false);
    expect(isGuideSoundId('rising-falling-pitch')).toBe(false);
  });
});

describe('isVoiceGuideSoundId', () => {
  it('is true for the two voice ids', () => {
    expect(isVoiceGuideSoundId('voice-male')).toBe(true);
    expect(isVoiceGuideSoundId('voice-female')).toBe(true);
  });

  it('is false for vibrate and none', () => {
    expect(isVoiceGuideSoundId('vibrate')).toBe(false);
    expect(isVoiceGuideSoundId('none')).toBe(false);
  });
});

describe('hasPhaseChanged', () => {
  it('is true the first time a phase is observed (prev is null)', () => {
    expect(hasPhaseChanged(null, 'inhale')).toBe(true);
  });

  it('is true when the phase differs from the previous one', () => {
    expect(hasPhaseChanged('inhale', 'hold-full')).toBe(true);
  });

  it('is false when the phase is unchanged', () => {
    expect(hasPhaseChanged('inhale', 'inhale')).toBe(false);
  });
});

describe('wordForPhase', () => {
  it('speaks "inhale" for the inhale phase', () => {
    expect(wordForPhase('inhale')).toBe('inhale');
  });

  it('speaks "exhale" for the exhale phase', () => {
    expect(wordForPhase('exhale')).toBe('exhale');
  });

  it('speaks "hold" for either hold phase', () => {
    expect(wordForPhase('hold-full')).toBe('hold');
    expect(wordForPhase('hold-empty')).toBe('hold');
  });
});

describe('voiceAssetKeyFor', () => {
  it('combines the voice id with the phase word', () => {
    expect(voiceAssetKeyFor('voice-male', 'inhale')).toBe('voice-male-inhale');
    expect(voiceAssetKeyFor('voice-male', 'hold-full')).toBe('voice-male-hold');
    expect(voiceAssetKeyFor('voice-male', 'hold-empty')).toBe('voice-male-hold');
    expect(voiceAssetKeyFor('voice-male', 'exhale')).toBe('voice-male-exhale');
    expect(voiceAssetKeyFor('voice-female', 'inhale')).toBe('voice-female-inhale');
    expect(voiceAssetKeyFor('voice-female', 'hold-full')).toBe('voice-female-hold');
    expect(voiceAssetKeyFor('voice-female', 'hold-empty')).toBe('voice-female-hold');
    expect(voiceAssetKeyFor('voice-female', 'exhale')).toBe('voice-female-exhale');
  });
});
