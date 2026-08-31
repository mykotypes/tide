import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Text } from '@/components/ui/text';
import { AMBIENT_SOUND_OPTIONS, disablesGuideSound, useAmbientSound } from '@/lib/ambient-sound';
import { GUIDE_SOUND_OPTIONS, useGuideSound } from '@/lib/guide-sound';
import { PATTERN_PICKER_COLORS as C } from '@/lib/pattern-picker-palette';
import { SCENE_OPTIONS, useScene } from '@/lib/scene';

// The Pattern Picker's settings menu: Scene, Ambient Sound, and Guide Sound
// (global, session-independent settings — see CONTEXT.md's Pattern Picker
// entry) behind a single "Customize" sheet. Session Length and Custom's
// duration fields stay inline on the carousel card since they're
// per-pattern, not global — see ADR 0002. Unlike the native app, there's no
// "Statistics" row here — ticket 07 gives Statistics its own icon on the
// Pattern Picker's header instead (the one explicit web-adaptation the
// port asked for).
export interface PatternPickerSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-3">
      <Text style={{ color: C.charcoal }}>{label}</Text>
      {selected ? <Icon name="check" size={18} color={C.coral} /> : null}
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mt-4 text-xs font-bold uppercase tracking-wide" style={{ color: C.charcoalMuted }}>
      {children}
    </Text>
  );
}

export function PatternPickerSettingsSheet({ visible, onClose }: PatternPickerSettingsSheetProps) {
  const [sceneId, selectScene] = useScene();
  const [ambientId, selectAmbient] = useAmbientSound();
  const [guideSoundId, selectGuideSound] = useGuideSound();
  const guideSoundDisabled = disablesGuideSound(ambientId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* Capped below the viewport height (max-h-[85%]) with the option
            list scrollable below, so Done always stays reachable even when
            Scene + Ambient + Guide Sound together overflow a short phone
            screen. */}
        <Pressable style={{ backgroundColor: C.cream }} className="max-h-[85%] rounded-t-3xl">
          <View style={{ backgroundColor: C.creamMuted }} className="mb-2 mt-4 h-1 w-10 self-center rounded-full" />
          <Text className="px-6 text-xl font-extrabold" style={{ color: C.charcoal }}>
            Customize
          </Text>

          <ScrollView className="flex-shrink" contentContainerClassName="gap-1 px-6 pb-2 pt-2" showsVerticalScrollIndicator={false}>
            <SectionLabel>Scene</SectionLabel>
            {SCENE_OPTIONS.map((opt) => (
              <OptionRow key={opt.id} label={opt.label} selected={opt.id === sceneId} onPress={() => selectScene(opt.id)} />
            ))}

            <SectionLabel>Ambient sound</SectionLabel>
            {AMBIENT_SOUND_OPTIONS.map((opt) => (
              <OptionRow
                key={opt.id}
                label={opt.label}
                selected={opt.id === ambientId}
                onPress={() => selectAmbient(opt.id)}
              />
            ))}

            {guideSoundDisabled ? null : (
              <>
                <SectionLabel>Guide sound</SectionLabel>
                {GUIDE_SOUND_OPTIONS.map((opt) => (
                  <OptionRow
                    key={opt.id}
                    label={opt.label}
                    selected={opt.id === guideSoundId}
                    onPress={() => selectGuideSound(opt.id)}
                  />
                ))}
              </>
            )}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={{ backgroundColor: C.charcoal }}
            className="mx-6 mb-10 mt-2 items-center rounded-full py-4"
          >
            <Text className="font-bold" style={{ color: C.cream }}>
              Done
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
