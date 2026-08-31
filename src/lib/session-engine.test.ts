import { computeSessionState, hasJustCompleted } from '@/lib/session-engine';
import { BOX_PATTERN, FOUR_SEVEN_EIGHT_PATTERN, EIGHT_EIGHT_PATTERN } from '@/lib/patterns';
import { customDurationsToPattern } from '@/lib/custom-pattern';

describe('computeSessionState — Box phase sequencing/durations', () => {
  it('starts in inhale at elapsed 0', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 0);
    expect(state.phase).toBe('inhale');
    expect(state.cycleIndex).toBe(0);
    expect(state.completed).toBe(false);
  });

  it('stays in inhale just before the 4s boundary', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 3999);
    expect(state.phase).toBe('inhale');
  });

  it('transitions to hold-full exactly at 4s', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 4000);
    expect(state.phase).toBe('hold-full');
  });

  it('transitions to exhale exactly at 8s', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 8000);
    expect(state.phase).toBe('exhale');
  });

  it('transitions to hold-empty exactly at 12s', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 12000);
    expect(state.phase).toBe('hold-empty');
  });
});

describe('computeSessionState — fullness at phase boundaries and midpoints', () => {
  it('is 0 at the start of inhale', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 0);
    expect(state.fullness).toBeCloseTo(0, 5);
  });

  it('is 0.5 at the midpoint of inhale', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 2000);
    expect(state.fullness).toBeCloseTo(0.5, 5);
  });

  it('is ~1 at the end of inhale', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 3999);
    expect(state.fullness).toBeCloseTo(1, 2);
  });

  it('is 1 throughout hold-full', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 4000).fullness).toBeCloseTo(1, 5);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 6000).fullness).toBeCloseTo(1, 5);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 7999).fullness).toBeCloseTo(1, 5);
  });

  it('is 0.5 at the midpoint of exhale', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 10000);
    expect(state.fullness).toBeCloseTo(0.5, 5);
  });

  it('is 0 throughout hold-empty', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 12000).fullness).toBeCloseTo(0, 5);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 15000).fullness).toBeCloseTo(0, 5);
  });
});

describe('computeSessionState — cycle counting across multiple cycles', () => {
  const sessionLength = { cycles: 3 };

  it('is cycleIndex 0 during the first cycle', () => {
    expect(computeSessionState(BOX_PATTERN, sessionLength, 0).cycleIndex).toBe(0);
    expect(computeSessionState(BOX_PATTERN, sessionLength, 15000).cycleIndex).toBe(0);
  });

  it('advances to cycleIndex 1 exactly at 16s and restarts the phase sequence', () => {
    const state = computeSessionState(BOX_PATTERN, sessionLength, 16000);
    expect(state.cycleIndex).toBe(1);
    expect(state.phase).toBe('inhale');
    expect(state.fullness).toBeCloseTo(0, 5);
  });

  it('advances to cycleIndex 2 exactly at 32s', () => {
    const state = computeSessionState(BOX_PATTERN, sessionLength, 32000);
    expect(state.cycleIndex).toBe(2);
    expect(state.phase).toBe('inhale');
  });

  it('stays in cycleIndex 2 near the very end, not yet completed', () => {
    const state = computeSessionState(BOX_PATTERN, sessionLength, 47999);
    expect(state.cycleIndex).toBe(2);
    expect(state.completed).toBe(false);
  });
});

describe('computeSessionState — completion detection at the target cycle count', () => {
  it('is not completed one millisecond before the target duration', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 15999);
    expect(state.completed).toBe(false);
  });

  it('is completed exactly at the target duration', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 16000);
    expect(state.completed).toBe(true);
  });

  it('stays completed and clamped for elapsed time beyond the target duration', () => {
    const state = computeSessionState(BOX_PATTERN, { cycles: 1 }, 60000);
    expect(state.completed).toBe(true);
    expect(state.cycleIndex).toBe(0);
    expect(state.phase).toBe('hold-empty');
    expect(state.secondsRemaining).toBe(0);
  });

  it('completes at the target duration across multiple cycles too', () => {
    const sessionLength = { cycles: 3 };
    expect(computeSessionState(BOX_PATTERN, sessionLength, 47999).completed).toBe(false);
    expect(computeSessionState(BOX_PATTERN, sessionLength, 48000).completed).toBe(true);
    const finalState = computeSessionState(BOX_PATTERN, sessionLength, 48000);
    expect(finalState.cycleIndex).toBe(2);
  });
});

describe('computeSessionState — phaseProgress (continuous, unlike whole-second secondsRemaining)', () => {
  it('is 0 at the start of a phase', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 4000).phaseProgress).toBeCloseTo(0, 5);
  });

  it('is fractional mid-phase, not tied to whole seconds', () => {
    // 0.5s into a 4s hold-full.
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 4500).phaseProgress).toBeCloseTo(0.125, 5);
  });

  it('changes continuously between two elapsed times sharing the same secondsRemaining notch', () => {
    const early = computeSessionState(BOX_PATTERN, { cycles: 1 }, 4100);
    const late = computeSessionState(BOX_PATTERN, { cycles: 1 }, 4900);
    expect(early.secondsRemaining).toBe(late.secondsRemaining);
    expect(late.phaseProgress).toBeGreaterThan(early.phaseProgress);
    expect(early.phaseProgress).toBeCloseTo(0.025, 5);
    expect(late.phaseProgress).toBeCloseTo(0.225, 5);
  });

  it('is ~1 just before a phase ends', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 7999).phaseProgress).toBeCloseTo(1, 2);
  });

  it('resets to 0 exactly at a phase boundary', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 8000).phaseProgress).toBeCloseTo(0, 5);
  });

  it('tracks non-hold phases too, since it is generic rather than hold-specific', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 2000).phaseProgress).toBeCloseTo(0.5, 5);
  });
});

describe('computeSessionState — secondsRemaining', () => {
  it('counts down within a phase without ever showing 0 while running', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 0).secondsRemaining).toBe(4);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 3000).secondsRemaining).toBe(1);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 3999).secondsRemaining).toBe(1);
  });
});

describe('computeSessionState — sessionSecondsRemaining', () => {
  it('starts at the full session duration', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 0).sessionSecondsRemaining).toBe(16);
  });

  it('counts down across cycle boundaries, not just within the current phase', () => {
    const sessionLength = { cycles: 3 };
    expect(computeSessionState(BOX_PATTERN, sessionLength, 0).sessionSecondsRemaining).toBe(48);
    expect(computeSessionState(BOX_PATTERN, sessionLength, 16000).sessionSecondsRemaining).toBe(32);
    expect(computeSessionState(BOX_PATTERN, sessionLength, 32000).sessionSecondsRemaining).toBe(16);
  });

  it('is 0 once completed', () => {
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 16000).sessionSecondsRemaining).toBe(0);
    expect(computeSessionState(BOX_PATTERN, { cycles: 1 }, 60000).sessionSecondsRemaining).toBe(0);
  });
});

describe('computeSessionState — 4-7-8 has only one hold phase', () => {
  it('sequences inhale(4) -> hold-full(7) -> exhale(8), skipping hold-empty entirely', () => {
    expect(computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 0).phase).toBe('inhale');
    expect(computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 4000).phase).toBe('hold-full');
    expect(computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 11000).phase).toBe('exhale');
  });

  it('never reports hold-empty for this pattern, even clamped at completion', () => {
    const state = computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 19000);
    expect(state.completed).toBe(true);
    expect(state.phase).toBe('exhale');
    expect(state.fullness).toBeCloseTo(0, 5);
  });

  it('completes at exactly 19s for a single cycle (4+7+8)', () => {
    expect(computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 18999).completed).toBe(false);
    expect(computeSessionState(FOUR_SEVEN_EIGHT_PATTERN, { cycles: 1 }, 19000).completed).toBe(true);
  });
});

describe('computeSessionState — 8-8 has no hold phases at all', () => {
  it('sequences inhale(8) -> exhale(8), never entering a hold phase', () => {
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 0).phase).toBe('inhale');
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 7999).phase).toBe('inhale');
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 8000).phase).toBe('exhale');
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 15999).phase).toBe('exhale');
  });

  it('completes at exactly 16s for a single cycle (8+8)', () => {
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 15999).completed).toBe(false);
    expect(computeSessionState(EIGHT_EIGHT_PATTERN, { cycles: 1 }, 16000).completed).toBe(true);
  });
});

describe('hasJustCompleted', () => {
  it('is true on the transition from not-completed to completed', () => {
    expect(hasJustCompleted(false, true)).toBe(true);
  });

  it('is false while still not completed', () => {
    expect(hasJustCompleted(false, false)).toBe(false);
  });

  it('is false once already completed (no re-trigger on subsequent ticks)', () => {
    expect(hasJustCompleted(true, true)).toBe(false);
  });

  it('is false on the (impossible in practice) completed-to-not-completed transition', () => {
    expect(hasJustCompleted(true, false)).toBe(false);
  });
});

describe('computeSessionState — Custom pattern with only the second hold present', () => {
  const pattern = customDurationsToPattern({ inhale: 5, holdFull: 0, exhale: 6, holdEmpty: 2 });

  it('sequences inhale(5) -> exhale(6) -> hold-empty(2), skipping hold-full entirely', () => {
    expect(computeSessionState(pattern, { cycles: 1 }, 0).phase).toBe('inhale');
    expect(computeSessionState(pattern, { cycles: 1 }, 5000).phase).toBe('exhale');
    expect(computeSessionState(pattern, { cycles: 1 }, 11000).phase).toBe('hold-empty');
  });

  it('completes at exactly 13s for a single cycle (5+6+2)', () => {
    expect(computeSessionState(pattern, { cycles: 1 }, 12999).completed).toBe(false);
    expect(computeSessionState(pattern, { cycles: 1 }, 13000).completed).toBe(true);
  });
});
