import { createSelectableCatalog, type CatalogOption } from '@/lib/create-selectable-catalog';
import type { PhaseName } from '@/lib/session-engine';

export type VoiceGuideSoundId = 'voice-male' | 'voice-female';
export type GuideSoundId = VoiceGuideSoundId | 'vibrate' | 'none';

export const GUIDE_SOUND_OPTIONS: readonly CatalogOption<GuideSoundId>[] = [
  { id: 'voice-male', label: 'Voice (male)' },
  { id: 'voice-female', label: 'Voice (female)' },
  { id: 'vibrate', label: 'Vibrate' },
  { id: 'none', label: 'None' },
];

// Guide Sound's default is a voice cue, not 'none' — a first launch should
// still feel guided (see CONTEXT.md's Guide Sound entry).
export const DEFAULT_GUIDE_SOUND_ID: GuideSoundId = GUIDE_SOUND_OPTIONS[0].id;

export function isGuideSoundId(value: unknown): value is GuideSoundId {
  return typeof value === 'string' && GUIDE_SOUND_OPTIONS.some((option) => option.id === value);
}

export function isVoiceGuideSoundId(id: GuideSoundId): id is VoiceGuideSoundId {
  return id === 'voice-male' || id === 'voice-female';
}

export function hasPhaseChanged(prev: PhaseName | null, next: PhaseName): boolean {
  return prev !== next;
}

export type GuideSoundWord = 'inhale' | 'hold' | 'exhale';

// Both hold phases (lungs full or empty) speak the same "Hold" cue — the
// spoken word doesn't distinguish which hold, only the Breath HUD does.
export function wordForPhase(phase: PhaseName): GuideSoundWord {
  if (phase === 'inhale') return 'inhale';
  if (phase === 'exhale') return 'exhale';
  return 'hold';
}

export type VoiceAssetKey =
  | 'voice-male-inhale'
  | 'voice-male-hold'
  | 'voice-male-exhale'
  | 'voice-female-inhale'
  | 'voice-female-hold'
  | 'voice-female-exhale';

export function voiceAssetKeyFor(id: VoiceGuideSoundId, phase: PhaseName): VoiceAssetKey {
  return `${id}-${wordForPhase(phase)}`;
}

const guideSoundCatalog = createSelectableCatalog<GuideSoundId>(DEFAULT_GUIDE_SOUND_ID);

export const getGuideSoundId = guideSoundCatalog.getId;
export const setGuideSoundId = guideSoundCatalog.setId;
export const subscribeGuideSoundId = guideSoundCatalog.subscribe;
export const useGuideSound = guideSoundCatalog.useSelected;
