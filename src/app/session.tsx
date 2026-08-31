import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreathHUD } from '@/components/breath-hud';
import { Icon } from '@/components/icon';
import { SessionCompletion } from '@/components/session-completion';
import { SessionPauseOverlay } from '@/components/session-pause-overlay';
import { SessionProgress } from '@/components/session-progress';
import { ShoreScene } from '@/components/shore-scene';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { disablesGuideSound, useAmbientSound } from '@/lib/ambient-sound';
import { useGuideSound } from '@/lib/guide-sound';
import { clampCycles, formatCompletionSummary, getSessionLengthBounds } from '@/lib/session-length';
import { resolvePatternId, resolvePatternPhases } from '@/lib/resolve-pattern';
import { useScene } from '@/lib/scene';
import { useTheme } from '@/lib/theme';
import { useAmbientSoundPlayer } from '@/lib/use-ambient-sound-player';
import { useCompletionHaptics } from '@/lib/use-completion-haptics';
import { useGuideSoundCues } from '@/lib/use-guide-sound-cues';
import { useSessionClock } from '@/lib/use-session-clock';

// Ticket 03: Ambient Sound and Guide Sound now play through a session using
// expo-audio/expo-haptics' own web implementations (navigator.vibrate
// fallback for Vibrate). There's no picker UI to change them from this
// screen yet (that's ticket 06) — they read whatever is already persisted
// in the Profile (ticket 01's hydrateProfile). Scene, the settings sheet,
// mid-session Pattern switching, and Session Record logging are still not
// wired — see tickets 05, 06, 07.

export default function SessionScreen() {
  const { pattern: patternParam, cycles: cyclesParam } = useLocalSearchParams<{
    pattern?: string;
    cycles?: string;
  }>();
  const theme = useTheme();
  const patternId = useMemo(() => resolvePatternId(patternParam), [patternParam]);
  const phases = useMemo(() => resolvePatternPhases(patternId), [patternId]);
  const bounds = useMemo(() => getSessionLengthBounds(patternId, phases), [patternId, phases]);
  const cycles = useMemo(() => clampCycles(Number(cyclesParam), bounds), [cyclesParam, bounds]);

  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const sessionLength = useMemo(() => ({ cycles }), [cycles]);
  const state = useSessionClock(phases, sessionLength, !isPaused);

  const [sceneId] = useScene();
  const [ambientSoundId] = useAmbientSound();
  const [guideSoundId] = useGuideSound();
  const guideSoundDisabled = disablesGuideSound(ambientSoundId);
  const soundActive = soundEnabled && !isPaused;
  useGuideSoundCues(state, guideSoundId, soundActive && !guideSoundDisabled);
  useAmbientSoundPlayer(ambientSoundId, soundActive, state.fullness);
  useCompletionHaptics(state.completed, soundEnabled);

  useEffect(() => {
    if (!state.completed) return;
    const timer = setTimeout(() => router.replace('/'), 2500);
    return () => clearTimeout(timer);
  }, [state.completed]);

  function handleClose() {
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {sceneId === 'shore' ? <ShoreScene fullness={state.fullness} style={StyleSheet.absoluteFill} /> : null}

      <View className="flex-row items-center justify-between px-4 pt-6">
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          accessibilityState={{ selected: soundEnabled }}
          onPress={() => setSoundEnabled((prev) => !prev)}
        >
          <Icon name="check" size={18} color={soundEnabled ? theme.foreground : theme.mutedForeground} />
        </Button>

        <Button variant="ghost" size="icon" accessibilityLabel="Close session" onPress={handleClose}>
          <Text className="text-xl">×</Text>
        </Button>
      </View>

      <Pressable
        className="flex-1 items-center justify-center gap-8 px-6"
        disabled={state.completed}
        onPress={() => setIsPaused(true)}
      >
        {state.completed ? (
          <SessionCompletion summary={formatCompletionSummary(cycles, phases)} />
        ) : (
          <>
            <BreathHUD state={state} />
            <SessionProgress cycles={cycles} cycleIndex={state.cycleIndex} sessionSecondsRemaining={state.sessionSecondsRemaining} />
          </>
        )}
      </Pressable>

      {isPaused ? <SessionPauseOverlay onResume={() => setIsPaused(false)} onExit={handleClose} /> : null}
    </SafeAreaView>
  );
}
