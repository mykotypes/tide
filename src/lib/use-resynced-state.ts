import { useState } from 'react';

export function useResyncedState<Trigger, Value>(
  trigger: Trigger,
  computeValue: () => Value,
  isEqual: (a: Trigger, b: Trigger) => boolean = Object.is
): [Value, (value: Value) => void] {
  const [value, setValue] = useState(computeValue);
  const [lastTrigger, setLastTrigger] = useState(trigger);

  // Adjust state during render, not an effect, so a change to `trigger`
  // is reflected in the same commit rather than flashing the stale value.
  if (!isEqual(trigger, lastTrigger)) {
    setLastTrigger(trigger);
    setValue(computeValue());
  }

  return [value, setValue];
}
