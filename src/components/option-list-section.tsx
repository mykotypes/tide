import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Text } from '@/components/ui/text';
import type { CatalogOption } from '@/lib/create-selectable-catalog';
import { useTheme } from '@/lib/theme';

export interface OptionListSectionProps<Id extends string> {
  title: string;
  options: readonly CatalogOption<Id>[];
  selectedId: Id;
  onSelect: (id: Id) => void;
}

export function OptionListSection<Id extends string>({
  title,
  options,
  selectedId,
  onSelect,
}: OptionListSectionProps<Id>) {
  const theme = useTheme();

  return (
    <View className="gap-1 px-6">
      <Text variant="small" className="text-muted-foreground uppercase">
        {title}
      </Text>
      {options.map((option) => (
        <Pressable
          key={option.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: option.id === selectedId }}
          onPress={() => onSelect(option.id)}
          className="flex-row items-center justify-between rounded-md px-3 py-3 active:bg-accent"
        >
          <Text>{option.label}</Text>
          {option.id === selectedId ? <Icon name="check" size={18} color={theme.foreground} /> : null}
        </Pressable>
      ))}
    </View>
  );
}
