import { createSelectableCatalog } from '@/lib/create-selectable-catalog';
import { DEFAULT_PATTERN_ID, isPatternId, type PatternId } from '@/lib/patterns';

export type SelectedPatternId = PatternId | 'custom';

export function isSelectedPatternId(value: unknown): value is SelectedPatternId {
  return value === 'custom' || isPatternId(value);
}

const lastPatternCatalog = createSelectableCatalog<SelectedPatternId>(DEFAULT_PATTERN_ID);

export const getLastPatternId = lastPatternCatalog.getId;
export const setLastPatternId = lastPatternCatalog.setId;
export const subscribeLastPatternId = lastPatternCatalog.subscribe;
export const useLastPatternId = lastPatternCatalog.useSelected;
