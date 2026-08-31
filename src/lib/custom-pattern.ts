import { useState } from 'react';

import { createModuleStore } from '@/lib/create-module-store';
import type { Pattern } from '@/lib/session-engine';

export interface CustomDurations {
  inhale: number;
  holdFull: number;
  exhale: number;
  holdEmpty: number;
}

export const DEFAULT_CUSTOM_DURATIONS: CustomDurations = {
  inhale: 4,
  holdFull: 4,
  exhale: 6,
  holdEmpty: 0,
};

const NON_OMISSIBLE_FIELDS = new Set<keyof CustomDurations>(['inhale', 'exhale']);
const MAX_DURATION_SEC = 30;

export function clampDuration(value: number, field: keyof CustomDurations): number {
  const min = NON_OMISSIBLE_FIELDS.has(field) ? 1 : 0;
  if (!Number.isFinite(value)) return min;
  return Math.min(MAX_DURATION_SEC, Math.max(min, Math.round(value)));
}

export function customDurationsToPattern(durations: CustomDurations): Pattern {
  const phases: Pattern[number][] = [{ name: 'inhale', durationSec: durations.inhale }];
  if (durations.holdFull > 0) phases.push({ name: 'hold-full', durationSec: durations.holdFull });
  phases.push({ name: 'exhale', durationSec: durations.exhale });
  if (durations.holdEmpty > 0) phases.push({ name: 'hold-empty', durationSec: durations.holdEmpty });
  return phases;
}

const customDurationsStore = createModuleStore<CustomDurations>({ ...DEFAULT_CUSTOM_DURATIONS });

export function getCustomDurations(): CustomDurations {
  return customDurationsStore.get();
}

export function setCustomDurations(durations: CustomDurations): void {
  customDurationsStore.set(durations);
}

export const subscribeCustomDurations = customDurationsStore.subscribe;

export function useCustomDurations(): [
  CustomDurations,
  (field: keyof CustomDurations, rawValue: number) => void,
] {
  const [durations, setDurations] = useState<CustomDurations>(getCustomDurations());

  function updateDuration(field: keyof CustomDurations, rawValue: number) {
    setDurations((prev) => {
      const next = { ...prev, [field]: clampDuration(rawValue, field) };
      setCustomDurations(next);
      return next;
    });
  }

  return [durations, updateDuration];
}
