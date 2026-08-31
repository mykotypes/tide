import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BLOB_SHAPE_BY_PATTERN, BreathingBlob } from '@/components/breathing-blob';
import { DurationField } from '@/components/duration-field';
import { Icon } from '@/components/icon';
import { PatternPickerSettingsSheet } from '@/components/pattern-picker-settings-sheet';
import { SessionLengthSlider } from '@/components/session-length-slider';
import { Text } from '@/components/ui/text';
import { customDurationsToPattern, useCustomDurations, type CustomDurations } from '@/lib/custom-pattern';
import { useLastPatternId } from '@/lib/last-pattern';
import { PATTERN_PICKER_COLORS as C } from '@/lib/pattern-picker-palette';
import { PATTERN_CATALOG, type PatternId } from '@/lib/patterns';
import type { Pattern } from '@/lib/session-engine';
import { durationLabelForCycles, useSessionLength } from '@/lib/session-length';

// Ported from the native Pattern Picker (ADR 0002: carousel structure,
// cream/charcoal/coral palette). This ticket (01) only proves the toolchain
// and the picker UI in a browser — Start and Customize are inert here;
// Start is wired to a real session in ticket 02, Customize gets its sheet
// back in ticket 06.

const CUSTOM_DURATION_FIELDS: { field: keyof CustomDurations; label: string }[] = [
  { field: 'inhale', label: 'Inhale' },
  { field: 'holdFull', label: 'Hold' },
  { field: 'exhale', label: 'Exhale' },
  { field: 'holdEmpty', label: 'Hold' },
];

type Slide = { id: PatternId | 'custom'; title: string; description: string; phases: Pattern };

function PresetControls({ entry, onCycles }: { entry: Slide; onCycles: (cycles: number) => void }) {
  const { cycles, bounds, setCycles } = useSessionLength(entry.id as PatternId, entry.phases);
  const durationLabel = durationLabelForCycles(cycles, entry.phases);

  useEffect(() => {
    onCycles(cycles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, entry.phases]);

  return <SessionLengthSlider cycles={cycles} bounds={bounds} durationLabel={durationLabel} onChangeCycles={setCycles} />;
}

function CustomControls({ onCycles }: { onCycles: (cycles: number) => void }) {
  const [customDurations, updateCustomDuration] = useCustomDurations();
  const customPhases: Pattern = useMemo(() => customDurationsToPattern(customDurations), [customDurations]);
  const { cycles, bounds, setCycles } = useSessionLength('custom', customPhases);
  const durationLabel = durationLabelForCycles(cycles, customPhases);

  useEffect(() => {
    onCycles(cycles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, customPhases]);

  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        {CUSTOM_DURATION_FIELDS.map(({ field, label }) => (
          <DurationField
            key={field}
            label={label}
            value={customDurations[field]}
            onChangeValue={(v) => updateCustomDuration(field, v)}
          />
        ))}
      </View>
      <SessionLengthSlider cycles={cycles} bounds={bounds} durationLabel={durationLabel} onChangeCycles={setCycles} />
    </View>
  );
}

export default function PatternPicker() {
  const slides: Slide[] = useMemo(
    () => [
      ...PATTERN_CATALOG.map((e) => ({ id: e.id, title: e.title, description: e.description, phases: e.phases })),
      { id: 'custom' as const, title: 'Custom', description: 'Set your own durations.', phases: [] },
    ],
    []
  );
  const [lastPatternId, setLastPatternId] = useLastPatternId();
  const [index, setIndex] = useState(() => Math.max(0, slides.findIndex((s) => s.id === lastPatternId)));
  const [cycles, setCycles] = useState(4);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const slide = slides[index];

  function go(delta: number) {
    setIndex((i) => {
      const next = (i + delta + slides.length) % slides.length;
      setLastPatternId(slides[next].id);
      return next;
    });
  }

  return (
    <SafeAreaView style={{ backgroundColor: C.cream }} className="flex-1">
      <View className="flex-1 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold tracking-tight" style={{ color: C.charcoal }}>
            Tide
          </Text>
          <View className="flex-row items-center gap-4">
            {/* Web adaptation: Statistics gets its own icon on the initial
                screen instead of living inside the Customize sheet. */}
            <Pressable
              onPress={() => router.push('/statistics')}
              className="h-8 w-8 items-center justify-center"
              accessibilityLabel="Statistics"
            >
              <Icon name="chart-bar" size={18} color={C.charcoal} />
            </Pressable>
            <Pressable
              onPress={() => setSettingsVisible(true)}
              className="flex-row items-center gap-1 py-2"
              accessibilityLabel="Customize"
            >
              <Text className="font-semibold" style={{ color: C.charcoal }}>
                Customize
              </Text>
              <Icon name="chevron-down" size={14} color={C.charcoal} />
            </Pressable>
          </View>
        </View>

        <View className="flex-1 items-center justify-center gap-4">
          <View className="flex-row items-center gap-6">
            <Pressable
              onPress={() => go(-1)}
              className="h-10 w-10 items-center justify-center"
              accessibilityLabel="Previous pattern"
            >
              <Icon name="chevron-left" size={22} color={C.charcoal} />
            </Pressable>
            <BreathingBlob shape={BLOB_SHAPE_BY_PATTERN[slide.id]} size={140} />
            <Pressable
              onPress={() => go(1)}
              className="h-10 w-10 items-center justify-center"
              accessibilityLabel="Next pattern"
            >
              <Icon name="chevron-right" size={22} color={C.charcoal} />
            </Pressable>
          </View>

          <Text className="text-3xl font-extrabold" style={{ color: C.charcoal }}>
            {slide.title}
          </Text>
          <Text className="max-w-[280px] text-center" style={{ color: C.charcoalMuted }}>
            {slide.description}
          </Text>

          <View className="flex-row gap-2">
            {slides.map((s, i) => (
              <View
                key={s.id}
                style={{ backgroundColor: i === index ? C.coral : C.creamMuted }}
                className="h-2 w-2 rounded-full"
              />
            ))}
          </View>
        </View>

        <View className="gap-4">
          {slide.id === 'custom' ? <CustomControls onCycles={setCycles} /> : <PresetControls entry={slide} onCycles={setCycles} />}

          <Link href={{ pathname: '/session', params: { pattern: slide.id, cycles: String(cycles) } }} asChild>
            <Pressable style={{ backgroundColor: C.coral }} className="items-center rounded-full py-4 active:opacity-80">
              <Text className="font-bold" style={{ color: C.charcoal }}>
                Start
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <PatternPickerSettingsSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </SafeAreaView>
  );
}
