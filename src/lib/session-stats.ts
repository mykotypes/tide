import type { SessionRecord } from '@/lib/session-record';

// Derived fresh from the Session Record log on every read (issue 18) — no
// separate cached stats store, so these always reflect the latest log.
export interface SessionAggregates {
  totalSessions: number;
  totalDurationSec: number;
  totalCycles: number;
}

export function aggregateSessionRecords(records: readonly SessionRecord[]): SessionAggregates {
  return records.reduce<SessionAggregates>(
    (acc, record) => ({
      totalSessions: acc.totalSessions + 1,
      totalDurationSec: acc.totalDurationSec + record.durationSec,
      totalCycles: acc.totalCycles + record.cyclesCompleted,
    }),
    { totalSessions: 0, totalDurationSec: 0, totalCycles: 0 }
  );
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

// Consecutive calendar days (local device time) with at least one Session
// Record, counting backward from today. If no session has run yet today,
// today still counts as long as yesterday had one — the streak isn't
// broken until a full day passes with zero sessions (CONTEXT.md's
// Statistics entry).
export function currentStreakDays(records: readonly SessionRecord[], now: Date = new Date()): number {
  const days = new Set(records.map((record) => localDayKey(new Date(record.timestampMs))));
  if (days.size === 0) return 0;

  const hasToday = days.has(localDayKey(now));
  if (!hasToday && !days.has(localDayKey(addDays(now, -1)))) return 0;

  let streak = 0;
  let cursor = hasToday ? now : addDays(now, -1);
  if (!hasToday) streak = 1;

  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
