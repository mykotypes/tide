import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export interface SessionPauseOverlayProps {
  onResume: () => void;
  onExit: () => void;
}

export function SessionPauseOverlay({ onResume, onExit }: SessionPauseOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center gap-8 bg-black/70 px-8">
      <Text variant="h3" className="text-white">
        Paused
      </Text>
      <View className="w-full gap-3">
        <Button size="lg" onPress={onResume}>
          <Text>Resume</Text>
        </Button>
        <Button size="lg" variant="destructive" onPress={onExit}>
          <Text>End session</Text>
        </Button>
      </View>
    </View>
  );
}
