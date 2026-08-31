export type PhaseName = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty';

export interface Phase {
  name: PhaseName;
  durationSec: number;
}

export type Pattern = readonly Phase[];

export interface SessionLength {
  cycles: number;
}

export interface EngineState {
  phase: PhaseName;
  fullness: number;
  secondsRemaining: number;
  sessionSecondsRemaining: number;
  cycleIndex: number;
  completed: boolean;
  // Continuous elapsed/duration within the current phase (0..1), unlike
  // secondsRemaining which is whole-second and only for display — this is
  // what the Breath HUD's hold arc sweeps from (see holdProgressFor).
  phaseProgress: number;
}

export function hasJustCompleted(prevCompleted: boolean, nextCompleted: boolean): boolean {
  return nextCompleted && !prevCompleted;
}

export function isHoldPhase(name: PhaseName): boolean {
  return name === 'hold-full' || name === 'hold-empty';
}

function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function fullnessFor(name: PhaseName, progress: number): number {
  switch (name) {
    case 'inhale':
      return easeInOutSine(progress);
    case 'exhale':
      return 1 - easeInOutSine(progress);
    case 'hold-full':
      return 1;
    case 'hold-empty':
      return 0;
  }
}

export function cycleDurationSec(pattern: Pattern): number {
  return pattern.reduce((sum, phase) => sum + phase.durationSec, 0);
}

function phaseStateAt(pattern: Pattern, tSec: number): { phase: Phase; elapsed: number; progress: number } {
  let acc = 0;
  for (const phase of pattern) {
    if (tSec < acc + phase.durationSec) {
      const elapsed = tSec - acc;
      return { phase, elapsed, progress: elapsed / phase.durationSec };
    }
    acc += phase.durationSec;
  }
  const last = pattern[pattern.length - 1];
  return { phase: last, elapsed: last.durationSec, progress: 1 };
}

export function computeSessionState(
  pattern: Pattern,
  sessionLength: SessionLength,
  elapsedMs: number
): EngineState {
  const elapsedSec = elapsedMs / 1000;
  const cycleSec = cycleDurationSec(pattern);
  const totalSec = cycleSec * sessionLength.cycles;
  const completed = elapsedSec >= totalSec;
  const clampedElapsedSec = Math.min(elapsedSec, totalSec);

  let cycleIndex = Math.floor(clampedElapsedSec / cycleSec);
  if (cycleIndex >= sessionLength.cycles) cycleIndex = sessionLength.cycles - 1;

  const tInCycle = clampedElapsedSec - cycleIndex * cycleSec;
  const { phase, elapsed, progress } = phaseStateAt(pattern, tInCycle);
  const fullness = fullnessFor(phase.name, progress);
  const secondsRemaining = completed ? 0 : Math.max(1, Math.ceil(phase.durationSec - elapsed));
  const sessionSecondsRemaining = completed ? 0 : Math.ceil(totalSec - clampedElapsedSec);

  return { phase: phase.name, fullness, secondsRemaining, sessionSecondsRemaining, cycleIndex, completed, phaseProgress: progress };
}
