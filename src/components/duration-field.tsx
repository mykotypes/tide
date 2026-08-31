import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useResyncedState } from '@/lib/use-resynced-state';

export interface DurationFieldProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
}

export function DurationField({ label, value, onChangeValue }: DurationFieldProps) {
  // Re-syncs the text buffer when the parent clamps `value` mid-edit (e.g. typing
  // past the max), without flashing the unclamped text the user just typed.
  const [text, setText] = useResyncedState(value, () => String(value));

  return (
    <View className="flex-1 items-center gap-1">
      <Text variant="small" className="text-muted-foreground uppercase">
        {label}
      </Text>
      <Input
        value={text}
        onChangeText={(next) => {
          setText(next);
          const parsed = Number.parseFloat(next);
          if (Number.isFinite(parsed)) onChangeValue(parsed);
        }}
        onBlur={() => setText(String(value))}
        keyboardType="number-pad"
        className="w-full text-center"
      />
    </View>
  );
}
