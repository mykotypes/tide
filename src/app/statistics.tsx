import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getSessionRecords } from '@/lib/session-record';
import { aggregateSessionRecords, currentStreakDays, type SessionAggregates } from '@/lib/session-stats';
import { useTheme } from '@/lib/theme';

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-border flex-row items-center justify-between border-b py-4">
      <Text variant="muted">{label}</Text>
      <Text className="text-xl font-bold">{value}</Text>
    </View>
  );
}

export default function StatisticsScreen() {
  const theme = useTheme();
  const [aggregates, setAggregates] = useState<SessionAggregates | null>(null);
  const [streakDays, setStreakDays] = useState(0);

  // Recomputed on every focus, straight from the Session Record log — no
  // separate cached stats store, so a session logged elsewhere in the app
  // is always reflected the next time this screen is shown.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getSessionRecords().then((records) => {
        if (cancelled) return;
        setAggregates(aggregateSessionRecords(records));
        setStreakDays(currentStreakDays(records));
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const hasRecords = aggregates !== null && aggregates.totalSessions > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-1 px-4 pt-6">
        <Button variant="ghost" size="icon" accessibilityLabel="Back" onPress={() => router.back()}>
          <Icon name="chevron-left" size={20} color={theme.foreground} />
        </Button>
        <Text className="text-xl font-extrabold">Statistics</Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        {!aggregates ? null : hasRecords ? (
          <View>
            <StatRow label="Total sessions" value={String(aggregates.totalSessions)} />
            <StatRow label="Current streak" value={`${streakDays} ${streakDays === 1 ? 'day' : 'days'}`} />
            <StatRow label="Total minutes" value={String(Math.round(aggregates.totalDurationSec / 60))} />
            <StatRow label="Total cycles" value={String(aggregates.totalCycles)} />
          </View>
        ) : (
          <Text variant="muted" className="pt-8 text-center">
            No sessions yet — your stats will show up here after your first breathing session.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
