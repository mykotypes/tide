import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PatternId } from '@/lib/patterns';
import { cycleDurationSec, type Pattern } from '@/lib/session-engine';

// Append-only local log of every session run (issue 13), prepping the
// ground for future stats/streaks even though no UI reads it yet. Ambient
// Sound and Guide Sound are deliberately excluded — presentation choices,
// not stats-relevant (CONTEXT.md's Profile / Account entry).
export interface SessionRecord {
  timestampMs: number;
  patternId: PatternId | 'custom';
  cyclesCompleted: number;
  durationSec: number;
}

const STORAGE_KEY = 'tide.session-records.v1';

// "Resulting duration" is derived from cycles completed rather than
// wall-clock elapsed time, so a session closed mid-cycle attributes only
// its full cycles to the duration.
export function buildSessionRecord(
  patternId: PatternId | 'custom',
  cyclesCompleted: number,
  phases: Pattern,
  timestampMs: number = Date.now()
): SessionRecord {
  return { timestampMs, patternId, cyclesCompleted, durationSec: cyclesCompleted * cycleDurationSec(phases) };
}

async function readRecords(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function logSessionRecord(record: SessionRecord): Promise<void> {
  const records = await readRecords();
  records.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// No UI surfaces these yet (out of scope for issue 13) — exported for
// tests and for the future stats/streaks UI to read from.
export const getSessionRecords = readRecords;
