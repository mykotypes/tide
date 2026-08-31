import { createSelectableCatalog, type CatalogOption } from '@/lib/create-selectable-catalog';

export type AmbientSoundId = 'rain' | 'none' | 'ocean';

export const AMBIENT_SOUND_OPTIONS: readonly CatalogOption<AmbientSoundId>[] = [
  { id: 'rain', label: 'Rain' },
  { id: 'none', label: 'None/Silence' },
  { id: 'ocean', label: 'Ocean' },
];

// Distinct from Guide Sound's default: Ambient Sound has a real "off"
// catalog entry, so a session shouldn't auto-play audio the user never
// asked for. Guide Sound has no such entry, so it defaults to cueing.
export const DEFAULT_AMBIENT_SOUND_ID: AmbientSoundId = 'none';

export function isAmbientSoundId(value: unknown): value is AmbientSoundId {
  return typeof value === 'string' && AMBIENT_SOUND_OPTIONS.some((option) => option.id === value);
}

export function shouldPlayAmbientSound(id: AmbientSoundId): boolean {
  return id !== 'none';
}

// Ocean already marks phase changes by swelling/receding, so a Guide Sound
// cue on top would be redundant (CONTEXT.md's Ambient Sound entry).
export function disablesGuideSound(id: AmbientSoundId): boolean {
  return id === 'ocean';
}

const OCEAN_MIN_VOLUME = 0.25;
const OCEAN_MAX_VOLUME = 0.9;

// Ocean's wash swells/recedes by tracking the engine's fullness value
// directly: quietest at empty lungs, loudest at full lungs, ramping
// smoothly through inhale/exhale in between (mirrors the reactive-ocean
// prototype's breath-synced wash, minus its extra velocity/energy layer —
// not needed to satisfy "tracks the fullness value").
export function oceanVolumeForFullness(fullness: number): number {
  const clamped = Math.min(1, Math.max(0, fullness));
  return OCEAN_MIN_VOLUME + (OCEAN_MAX_VOLUME - OCEAN_MIN_VOLUME) * clamped;
}

const ambientSoundCatalog = createSelectableCatalog<AmbientSoundId>(DEFAULT_AMBIENT_SOUND_ID);

export const getAmbientSoundId = ambientSoundCatalog.getId;
export const setAmbientSoundId = ambientSoundCatalog.setId;
export const subscribeAmbientSoundId = ambientSoundCatalog.subscribe;
export const useAmbientSound = ambientSoundCatalog.useSelected;
