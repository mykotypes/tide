import AsyncStorage from '@react-native-async-storage/async-storage';

import { BOX_PATTERN } from '@/lib/patterns';
import { buildSessionRecord, getSessionRecords, logSessionRecord } from '@/lib/session-record';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('buildSessionRecord', () => {
  it('derives duration from cycles completed, not the full target', () => {
    // BOX_PATTERN is 4+4+4+4 = 16s per cycle.
    const record = buildSessionRecord('box', 2, BOX_PATTERN, 1000);
    expect(record).toEqual({ timestampMs: 1000, patternId: 'box', cyclesCompleted: 2, durationSec: 32 });
  });

  it('is 0 duration for a session closed before any cycle finished', () => {
    const record = buildSessionRecord('box', 0, BOX_PATTERN, 1000);
    expect(record.durationSec).toBe(0);
  });

  it('defaults the timestamp to now when omitted', () => {
    const before = Date.now();
    const record = buildSessionRecord('box', 1, BOX_PATTERN);
    expect(record.timestampMs).toBeGreaterThanOrEqual(before);
  });
});

describe('logSessionRecord / getSessionRecords', () => {
  it('starts empty', async () => {
    expect(await getSessionRecords()).toEqual([]);
  });

  it('appends records in order, keeping earlier ones', async () => {
    const first = buildSessionRecord('box', 4, BOX_PATTERN, 1000);
    const second = buildSessionRecord('custom', 1, BOX_PATTERN, 2000);

    await logSessionRecord(first);
    await logSessionRecord(second);

    expect(await getSessionRecords()).toEqual([first, second]);
  });

  it('logs a partial session (cycles completed less than target) rather than dropping it', async () => {
    const partial = buildSessionRecord('4-7-8', 1, BOX_PATTERN, 1000);
    await logSessionRecord(partial);

    const records = await getSessionRecords();
    expect(records).toHaveLength(1);
    expect(records[0].cyclesCompleted).toBe(1);
  });
});
