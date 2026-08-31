import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export interface SessionCompletionProps {
  summary: string;
}

export function SessionCompletion({ summary }: SessionCompletionProps) {
  return (
    <View className="items-center justify-center gap-2">
      <Text variant="h3">Session complete</Text>
      <Text variant="muted">{summary}</Text>
    </View>
  );
}
