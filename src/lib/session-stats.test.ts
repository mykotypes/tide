import { BOX_PATTERN } from '@/lib/patterns';
import { buildSessionRecord } from '@/lib/session-record';
import { aggregateSessionRecords, currentStreakDays } from '@/lib/session-stats';

// Noon on a fixed day, well clear of any DST boundary — the exact day
// doesn't matter, only its distance (in whole days) from the fixture
// timestamps below.
const TODAY = new Date(2026, 0, 15, 12, 0, 0);

function daysAgoMs(days: number, hour = 9): number {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

describe('aggregateSessionRecords', () => {
  it('is all zeros for an empty log', () => {
    expect(aggregateSessionRecords([])).toEqual({ totalSessions: 0, totalDurationSec: 0, totalCycles: 0 });
  });

  it('sums sessions, duration, and cycles across records', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0)),
      buildSessionRecord('4-7-8', 2, BOX_PATTERN, daysAgoMs(1)),
      buildSessionRecord('custom', 1, BOX_PATTERN, daysAgoMs(2)),
    ];

    expect(aggregateSessionRecords(records)).toEqual({
      totalSessions: 3,
      totalDurationSec: 4 * 16 + 2 * 16 + 1 * 16, // BOX_PATTERN cycle is 16s
      totalCycles: 7,
    });
  });

  it('counts a partial (0-cycle) session as one session with 0 duration/cycles', () => {
    const records = [buildSessionRecord('box', 0, BOX_PATTERN, daysAgoMs(0))];
    expect(aggregateSessionRecords(records)).toEqual({ totalSessions: 1, totalDurationSec: 0, totalCycles: 0 });
  });
});

describe('currentStreakDays', () => {
  it('is 0 for an empty log', () => {
    expect(currentStreakDays([], TODAY)).toBe(0);
  });

  it('is 1 when the only record is from today', () => {
    const records = [buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0))];
    expect(currentStreakDays(records, TODAY)).toBe(1);
  });

  it('counts multiple sessions on the same day once', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0, 8)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0, 20)),
    ];
    expect(currentStreakDays(records, TODAY)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(1)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(2)),
    ];
    expect(currentStreakDays(records, TODAY)).toBe(3);
  });

  it('stops at the first gap looking backward from today', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(0)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(1)),
      // gap at 2 days ago
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(3)),
    ];
    expect(currentStreakDays(records, TODAY)).toBe(2);
  });

  it('still counts today when no session has run yet today, as long as yesterday had one', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(1)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(2)),
    ];
    expect(currentStreakDays(records, TODAY)).toBe(3);
  });

  it('is broken (0) once a full day passes with no session', () => {
    const records = [
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(2)),
      buildSessionRecord('box', 4, BOX_PATTERN, daysAgoMs(3)),
    ];
    expect(currentStreakDays(records, TODAY)).toBe(0);
  });
});
