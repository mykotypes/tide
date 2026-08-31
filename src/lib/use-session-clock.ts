import { useEffect, useMemo, useRef, useState } from 'react';

import { computeSessionState, type EngineState, type Pattern, type SessionLength } from '@/lib/session-engine';

export function useSessionClock(
  pattern: Pattern,
  sessionLength: SessionLength,
  isRunning: boolean
): EngineState {
  const [elapsedMs, setElapsedMs] = useState(0);
  // elapsedMs banked from prior run segments (i.e. before the most recent
  // pause/resume), plus a wall-clock anchor for the segment in progress.
  // Recomputing from Date.now() every tick — rather than summing frame
  // deltas — means a stalled or coalesced rAF frame just delays the next
  // read instead of permanently losing the time it covered.
  const baseElapsedRef = useRef(0);
  const runStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const state = useMemo(
    () => computeSessionState(pattern, sessionLength, elapsedMs),
    [pattern, sessionLength, elapsedMs]
  );

  useEffect(() => {
    if (!isRunning || state.completed) return;

    runStartRef.current = Date.now();

    function tick() {
      setElapsedMs(baseElapsedRef.current + (Date.now() - runStartRef.current!));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      baseElapsedRef.current += Date.now() - runStartRef.current!;
      runStartRef.current = null;
    };
  }, [isRunning, state.completed]);

  return state;
}
