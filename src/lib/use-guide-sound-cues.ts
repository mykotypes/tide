import { useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import type { GuideSoundId, VoiceAssetKey } from '@/lib/guide-sound';
import { hasPhaseChanged, isVoiceGuideSoundId, voiceAssetKeyFor } from '@/lib/guide-sound';
import type { EngineState, PhaseName } from '@/lib/session-engine';

// The Record<VoiceAssetKey, ...> return type makes a missing or misspelled
// key a compile error, so this is the single place the 6 voice assets are listed.
function useVoicePlayers(): Record<VoiceAssetKey, ReturnType<typeof useAudioPlayer>> {
  return {
    'voice-male-inhale': useAudioPlayer(require('../../assets/audio/voice-male-inhale.wav')),
    'voice-male-hold': useAudioPlayer(require('../../assets/audio/voice-male-hold.wav')),
    'voice-male-exhale': useAudioPlayer(require('../../assets/audio/voice-male-exhale.wav')),
    'voice-female-inhale': useAudioPlayer(require('../../assets/audio/voice-female-inhale.wav')),
    'voice-female-hold': useAudioPlayer(require('../../assets/audio/voice-female-hold.wav')),
    'voice-female-exhale': useAudioPlayer(require('../../assets/audio/voice-female-exhale.wav')),
  };
}

export function useGuideSoundCues(state: EngineState, guideSoundId: GuideSoundId, soundEnabled: boolean): void {
  const players = useVoicePlayers();
  const lastPhaseRef = useRef<PhaseName | null>(null);

  useEffect(() => {
    const changed = hasPhaseChanged(lastPhaseRef.current, state.phase);
    lastPhaseRef.current = state.phase;
    if (!changed || !soundEnabled) return;

    if (isVoiceGuideSoundId(guideSoundId)) {
      const player = players[voiceAssetKeyFor(guideSoundId, state.phase)];
      player.seekTo(0).then(() => player.play());
    } else if (guideSoundId === 'vibrate') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // 'none' fires no cue at all.
    // `players` is a new object each render, but useAudioPlayer's individual
    // player instances are stable for the component's lifetime, so closing
    // over a fresh `players` on every dep change (not every render) is fine.
  }, [state.phase, guideSoundId, soundEnabled, players]);

  useEffect(() => {
    if (soundEnabled) return;
    // Immediately stop an in-flight cue on mute, rather than letting it play
    // out — a spoken word finishing after tapping mute would read as broken.
    for (const player of Object.values(players)) player.pause();
  }, [soundEnabled, players]);
}
