import { View } from 'react-native';
import Slider from '@react-native-community/slider';

import { Text } from '@/components/ui/text';
import type { SessionLengthBounds } from '@/lib/session-length';

export interface SessionLengthSliderProps {
  cycles: number;
  bounds: SessionLengthBounds;
  durationLabel: string;
  onChangeCycles: (cycles: number) => void;
}

export function SessionLengthSlider({ cycles, bounds, durationLabel, onChangeCycles }: SessionLengthSliderProps) {
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text variant="small" className="text-muted-foreground uppercase">
          Session length
        </Text>
        <Text variant="small" className="text-muted-foreground">
          {durationLabel}
        </Text>
      </View>
      <Slider
        minimumValue={bounds.min}
        maximumValue={bounds.max}
        step={1}
        value={cycles}
        onValueChange={onChangeCycles}
        accessibilityLabel="Session length in cycles"
      />
    </View>
  );
}
