import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export interface SessionSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SessionSettingsSheet({ visible, onClose, children }: SessionSettingsSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* max-h-[85%] must sit here, on the direct child of the backdrop's
            definite-height Pressable — a percentage height on a deeper
            descendant (e.g. on Card below) can't resolve, since this
            touch-blocking wrapper itself has no explicit height. Card then
            uses flex-shrink (like the ScrollView inside it) to actually fit
            the space this caps, rather than a second percentage height. */}
        <Pressable className="max-h-[85%]">
          <Card className="flex-shrink gap-4 rounded-b-none pb-0">
            <CardHeader>
              <CardTitle>Session settings</CardTitle>
            </CardHeader>
            <ScrollView className="flex-shrink" contentContainerClassName="gap-4 pb-2" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            <Button size="lg" onPress={onClose} className="mx-6 mb-8 mt-2">
              <Text>Done</Text>
            </Button>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
