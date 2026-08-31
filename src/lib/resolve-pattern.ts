import { customDurationsToPattern, getCustomDurations } from '@/lib/custom-pattern';
import { DEFAULT_PATTERN_ID, getPatternById, isPatternId, type PatternId } from '@/lib/patterns';
import type { Pattern } from '@/lib/session-engine';

export function resolvePatternId(id: unknown): PatternId | 'custom' {
  if (id === 'custom') return 'custom';
  return isPatternId(id) ? id : DEFAULT_PATTERN_ID;
}

export function resolvePatternPhases(id: unknown): Pattern {
  const resolvedId = resolvePatternId(id);
  return resolvedId === 'custom' ? customDurationsToPattern(getCustomDurations()) : getPatternById(resolvedId).phases;
}
