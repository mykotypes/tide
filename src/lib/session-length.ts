import { useMemo } from 'react';

import { createKeyedModuleStore } from '@/lib/create-module-store';
import type { PatternId } from '@/lib/patterns';
import { cycleDurationSec, type Pattern } from '@/lib/session-engine';
import { useResyncedState } from '@/lib/use-resynced-state';

export interface SessionLengthBounds {
  min: number;
  max: number;
}

const FIXED_BOUNDS: Record<PatternId, SessionLengthBounds> = {
  box: { min: 4, max: 16 },
  '4-7-8': { min: 4, max: 8 },
  '8-8': { min: 4, max: 16 },
};

const CUSTOM_MIN_DURATION_SEC = 60;
const CUSTOM_MAX_DURATION_SEC = 600;

export function getSessionLengthBounds(patternId: PatternId | 'custom', phases: Pattern): SessionLengthBounds {
  if (patternId === 'custom') {
    const cycleSec = cycleDurationSec(phases);
    const min = Math.ceil(CUSTOM_MIN_DURATION_SEC / cycleSec);
    const max = Math.max(min, Math.floor(CUSTOM_MAX_DURATION_SEC / cycleSec));
    return { min, max };
  }
  return FIXED_BOUNDS[patternId];
}

export function clampCycles(cycles: number, bounds: SessionLengthBounds): number {
  if (!Number.isFinite(cycles)) return bounds.min;
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(cycles)));
}

export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded - minutes * 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function durationLabelForCycles(cycles: number, phases: Pattern): string {
  return formatDuration(cycles * cycleDurationSec(phases));
}

export function formatCompletionSummary(cycles: number, phases: Pattern): string {
  const cycleWord = cycles === 1 ? 'cycle' : 'cycles';
  return `${cycles} ${cycleWord} · ${durationLabelForCycles(cycles, phases)} done`;
}

const cyclesByPatternId = createKeyedModuleStore<string, number>();

export const getCyclesForPattern = cyclesByPatternId.get;
export const setCyclesForPattern = cyclesByPatternId.set;
export const subscribeCyclesByPattern = cyclesByPatternId.subscribe;

export function useSessionLength(
  patternId: PatternId | 'custom',
  phases: Pattern
): { cycles: number; bounds: SessionLengthBounds; setCycles: (cycles: number) => void } {
  const bounds = useMemo(() => getSessionLengthBounds(patternId, phases), [patternId, phases]);

  // A given hook call site always uses a fixed patternId (one per Pattern
  // Picker card), so the only way bounds change here is the Custom card's
  // durations being edited.
  const [cycles, setCyclesState] = useResyncedState(
    bounds,
    () => clampCycles(cyclesByPatternId.get(patternId) ?? bounds.min, bounds),
    (a, b) => a.min === b.min && a.max === b.max
  );

  function setCycles(next: number) {
    const clamped = clampCycles(next, bounds);
    cyclesByPatternId.set(patternId, clamped);
    setCyclesState(clamped);
  }

  return { cycles, bounds, setCycles };
}
