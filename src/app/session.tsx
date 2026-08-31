import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreathHUD } from '@/components/breath-hud';
import { Icon } from '@/components/icon';
import { OptionListSection } from '@/components/option-list-section';
import { SessionCompletion } from '@/components/session-completion';
import { SessionPauseOverlay } from '@/components/session-pause-overlay';
import { SessionProgress } from '@/components/session-progress';
import { SessionSettingsSheet } from '@/components/session-settings-sheet';
import { ShoreScene } from '@/components/shore-scene';
import { Button } from '@/components/ui/button';
import { AMBIENT_SOUND_OPTIONS, disablesGuideSound, useAmbientSound, type AmbientSoundId } from '@/lib/ambient-sound';
import type { CatalogOption } from '@/lib/create-selectable-catalog';
import { GUIDE_SOUND_OPTIONS, useGuideSound, type GuideSoundId } from '@/lib/guide-sound';
import { PATTERN_CATALOG, type PatternId } from '@/lib/patterns';
import { resolvePatternId, resolvePatternPhases } from '@/lib/resolve-pattern';
import { SCENE_OPTIONS, useScene, type SceneId } from '@/lib/scene';
import { clampCycles, formatCompletionSummary, getCyclesForPattern, getSessionLengthBounds } from '@/lib/session-length';
import type { Pattern } from '@/lib/session-engine';
import { useTheme } from '@/lib/theme';
import { useAmbientSoundPlayer } from '@/lib/use-ambient-sound-player';
import { useCompletionHaptics } from '@/lib/use-completion-haptics';
import { useGuideSoundCues } from '@/lib/use-guide-sound-cues';
import { useSessionClock } from '@/lib/use-session-clock';

// Ticket 06: the mid-session settings sheet and the Pattern Picker's
// Customize sheet now both let the user actually change Scene, Ambient
// Sound, and Guide Sound (persisted via ticket 01's Profile). Session
// Record logging (ticket 07) still isn't wired.
//
// Switching Pattern mid-session discards in-progress breathing, so it's
// confirmed first — react-native-web's Alert.alert is a no-op stub, so
// this uses window.confirm directly rather than Alert (native app's
// choice, per ADR/issue 14).
const COMPLETION_DISPLAY_MS = 2500;

const PATTERN_OPTIONS: readonly CatalogOption<PatternId | 'custom'>[] = [
  ...PATTERN_CATALOG.map((entry) => ({ id: entry.id, label: entry.title })),
  { id: 'custom', label: 'Custom' },
];

interface SessionRunnerProps {
  patternId: PatternId | 'custom';
  phases: Pattern;
  cycles: number;
  sceneId: SceneId;
  ambientSoundId: AmbientSoundId;
  guideSoundId: GuideSoundId;
  guideSoundDisabled: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

function SessionRunner({
  patternId,
  phases,
  cycles,
  sceneId,
  ambientSoundId,
  guideSoundId,
  guideSoundDisabled,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onClose,
}: SessionRunnerProps) {
  const theme = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const sessionLength = useMemo(() => ({ cycles }), [cycles]);
  const state = useSessionClock(phases, sessionLength, !isPaused);
  const soundActive = soundEnabled && !isPaused;
  useGuideSoundCues(state, guideSoundId, soundActive && !guideSoundDisabled);
  useAmbientSoundPlayer(ambientSoundId, soundActive, state.fullness);
  useCompletionHaptics(state.completed, soundEnabled);

  useEffect(() => {
    if (!state.completed) return;
    const timer = setTimeout(() => router.replace('/'), COMPLETION_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [state.completed]);

  return (
    <>
      {sceneId === 'shore' ? <ShoreScene fullness={state.fullness} style={StyleSheet.absoluteFill} /> : null}

      <View className="flex-row items-center justify-between px-4 pt-6">
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          accessibilityState={{ selected: soundEnabled }}
          onPress={onToggleSound}
        >
          <Icon name={soundEnabled ? 'volume' : 'volume-off'} size={20} color={theme.foreground} />
        </Button>

        <View className="flex-row gap-1">
          <Button variant="ghost" size="icon" accessibilityLabel="Session settings" onPress={onOpenSettings}>
            <Icon name="sliders" size={20} color={theme.foreground} />
          </Button>
          <Button variant="ghost" size="icon" accessibilityLabel="Close session" onPress={onClose}>
            <Icon name="close" size={20} color={theme.foreground} />
          </Button>
        </View>
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

      {isPaused ? <SessionPauseOverlay onResume={() => setIsPaused(false)} onExit={onClose} /> : null}
    </>
  );
}

export default function SessionScreen() {
  const { pattern: patternParam, cycles: cyclesParam } = useLocalSearchParams<{
    pattern?: string;
    cycles?: string;
  }>();
  const initialPatternId = useMemo(() => resolvePatternId(patternParam), [patternParam]);
  const [selectedPatternId, setSelectedPatternId] = useState<PatternId | 'custom'>(initialPatternId);

  const phases = useMemo(() => resolvePatternPhases(selectedPatternId), [selectedPatternId]);
  const bounds = useMemo(() => getSessionLengthBounds(selectedPatternId, phases), [selectedPatternId, phases]);
  const cycles = useMemo(() => {
    if (selectedPatternId === initialPatternId) return clampCycles(Number(cyclesParam), bounds);
    return clampCycles(getCyclesForPattern(selectedPatternId) ?? bounds.min, bounds);
  }, [selectedPatternId, initialPatternId, cyclesParam, bounds]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [sceneId, selectScene] = useScene();
  const [ambientSoundId, selectAmbientSound] = useAmbientSound();
  const [guideSoundId, selectGuideSound] = useGuideSound();
  const guideSoundDisabled = disablesGuideSound(ambientSoundId);

  function requestPatternSwitch(nextPatternId: PatternId | 'custom') {
    if (nextPatternId === selectedPatternId) return;
    const nextTitle = PATTERN_OPTIONS.find((option) => option.id === nextPatternId)?.label ?? 'the new Pattern';
    if (window.confirm(`Switch to ${nextTitle}? Your progress on this session will be lost.`)) {
      setSelectedPatternId(nextPatternId);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SessionRunner
        key={selectedPatternId}
        patternId={selectedPatternId}
        phases={phases}
        cycles={cycles}
        sceneId={sceneId}
        ambientSoundId={ambientSoundId}
        guideSoundId={guideSoundId}
        guideSoundDisabled={guideSoundDisabled}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenSettings={() => setSettingsVisible(true)}
        onClose={() => router.back()}
      />

      <SessionSettingsSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)}>
        <OptionListSection title="Pattern" options={PATTERN_OPTIONS} selectedId={selectedPatternId} onSelect={requestPatternSwitch} />
        <OptionListSection title="Scene" options={SCENE_OPTIONS} selectedId={sceneId} onSelect={selectScene} />
        <OptionListSection
          title="Ambient Sound"
          options={AMBIENT_SOUND_OPTIONS}
          selectedId={ambientSoundId}
          onSelect={selectAmbientSound}
        />
        {guideSoundDisabled ? null : (
          <OptionListSection
            title="Guide Sound"
            options={GUIDE_SOUND_OPTIONS}
            selectedId={guideSoundId}
            onSelect={selectGuideSound}
          />
        )}
      </SessionSettingsSheet>
    </SafeAreaView>
  );
}
