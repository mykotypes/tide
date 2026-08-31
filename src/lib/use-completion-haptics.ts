import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

import { hasJustCompleted } from '@/lib/session-engine';

export function useCompletionHaptics(completed: boolean, soundEnabled: boolean): void {
  const prevCompletedRef = useRef(false);

  useEffect(() => {
    const justCompleted = hasJustCompleted(prevCompletedRef.current, completed);
    prevCompletedRef.current = completed;
    if (!justCompleted || !soundEnabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [completed, soundEnabled]);
}
