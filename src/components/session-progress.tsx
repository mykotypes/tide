import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatDuration } from '@/lib/session-length';

export interface SessionProgressProps {
  cycles: number;
  cycleIndex: number;
  sessionSecondsRemaining: number;
}

export function SessionProgress({ cycles, cycleIndex, sessionSecondsRemaining }: SessionProgressProps) {
  return (
    <View className="items-center gap-2">
      <View className="flex-row flex-wrap justify-center gap-1.5">
        {Array.from({ length: cycles }, (_, index) => (
          <View
            key={index}
            className={index <= cycleIndex ? 'bg-foreground' : 'bg-muted'}
            style={{ width: 16, height: 4, borderRadius: 2 }}
          />
        ))}
      </View>
      <Text variant="muted">{formatDuration(sessionSecondsRemaining)}</Text>
    </View>
  );
}
