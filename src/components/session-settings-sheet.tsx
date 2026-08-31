import type { ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export interface SessionSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SessionSettingsSheet({ visible, onClose, children }: SessionSettingsSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable>
          <Card className="gap-4 rounded-b-none pb-8">
            <CardHeader>
              <CardTitle>Session settings</CardTitle>
            </CardHeader>
            {children}
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
