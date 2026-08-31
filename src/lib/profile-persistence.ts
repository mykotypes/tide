import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAmbientSoundId, isAmbientSoundId, setAmbientSoundId, subscribeAmbientSoundId } from '@/lib/ambient-sound';
import {
  clampDuration,
  getCustomDurations,
  setCustomDurations,
  subscribeCustomDurations,
  type CustomDurations,
} from '@/lib/custom-pattern';
import { getGuideSoundId, isGuideSoundId, setGuideSoundId, subscribeGuideSoundId } from '@/lib/guide-sound';
import {
  getLastPatternId,
  isSelectedPatternId,
  setLastPatternId,
  subscribeLastPatternId,
  type SelectedPatternId,
} from '@/lib/last-pattern';
import { PATTERN_CATALOG } from '@/lib/patterns';
import { getCyclesForPattern, setCyclesForPattern, subscribeCyclesByPattern } from '@/lib/session-length';
import { getSceneId, isSceneId, setSceneId, subscribeSceneId } from '@/lib/scene';

// On-device persistence for the Profile (issue 12): last-used Pattern,
// Session Length per Pattern, Custom slot durations, Ambient Sound, Guide
// Sound, and Scene. Each setting already lives in its own module store
// (scene.ts, ambient-sound.ts, etc); this module is just the AsyncStorage
// glue that reads them into a single blob on change and replays that blob
// back into the stores on the next launch.
const STORAGE_KEY = 'tide.profile.v1';

const ALL_PATTERN_IDS: readonly SelectedPatternId[] = [...PATTERN_CATALOG.map((entry) => entry.id), 'custom'];

interface PersistedProfile {
  patternId: SelectedPatternId;
  cyclesByPattern: Partial<Record<SelectedPatternId, number>>;
  customDurations: CustomDurations;
  ambientSoundId: string;
  guideSoundId: string;
  sceneId: string;
}

function currentProfile(): PersistedProfile {
  const cyclesByPattern: Partial<Record<SelectedPatternId, number>> = {};
  for (const patternId of ALL_PATTERN_IDS) {
    const cycles = getCyclesForPattern(patternId);
    if (cycles !== undefined) cyclesByPattern[patternId] = cycles;
  }

  return {
    patternId: getLastPatternId(),
    cyclesByPattern,
    customDurations: getCustomDurations(),
    ambientSoundId: getAmbientSoundId(),
    guideSoundId: getGuideSoundId(),
    sceneId: getSceneId(),
  };
}

function persistNow(): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile())).catch(() => {});
}

function applyProfile(profile: Partial<PersistedProfile>): void {
  if (isSelectedPatternId(profile.patternId)) setLastPatternId(profile.patternId);
  if (isSceneId(profile.sceneId)) setSceneId(profile.sceneId);
  if (isAmbientSoundId(profile.ambientSoundId)) setAmbientSoundId(profile.ambientSoundId);
  if (isGuideSoundId(profile.guideSoundId)) setGuideSoundId(profile.guideSoundId);

  if (profile.customDurations && typeof profile.customDurations === 'object') {
    const durations = profile.customDurations;
    setCustomDurations({
      inhale: clampDuration(durations.inhale, 'inhale'),
      holdFull: clampDuration(durations.holdFull, 'holdFull'),
      exhale: clampDuration(durations.exhale, 'exhale'),
      holdEmpty: clampDuration(durations.holdEmpty, 'holdEmpty'),
    });
  }

  if (profile.cyclesByPattern && typeof profile.cyclesByPattern === 'object') {
    for (const [patternId, cycles] of Object.entries(profile.cyclesByPattern)) {
      if (isSelectedPatternId(patternId) && typeof cycles === 'number') setCyclesForPattern(patternId, cycles);
    }
  }
}

// Reads the stored Profile (if any) and replays it into the module stores.
// A missing or unparsable blob is first launch — every store simply keeps
// its own built-in default (Session Length already defaults to each
// Pattern's minimum via session-length.ts).
export async function hydrateProfile(): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  if (typeof parsed !== 'object' || parsed === null) return;

  applyProfile(parsed as Partial<PersistedProfile>);
}

// Subscribes to every persisted store and writes the merged Profile to
// AsyncStorage on any change. Call once, after hydrateProfile() resolves,
// so hydration itself doesn't trigger redundant writes.
export function startProfilePersistence(): () => void {
  const unsubscribers = [
    subscribeLastPatternId(persistNow),
    subscribeCyclesByPattern(persistNow),
    subscribeCustomDurations(persistNow),
    subscribeAmbientSoundId(persistNow),
    subscribeGuideSoundId(persistNow),
    subscribeSceneId(persistNow),
  ];
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}
