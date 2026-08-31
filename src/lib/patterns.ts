import type { Pattern } from '@/lib/session-engine';

export const BOX_PATTERN: Pattern = [
  { name: 'inhale', durationSec: 4 },
  { name: 'hold-full', durationSec: 4 },
  { name: 'exhale', durationSec: 4 },
  { name: 'hold-empty', durationSec: 4 },
];

export const FOUR_SEVEN_EIGHT_PATTERN: Pattern = [
  { name: 'inhale', durationSec: 4 },
  { name: 'hold-full', durationSec: 7 },
  { name: 'exhale', durationSec: 8 },
];

export const EIGHT_EIGHT_PATTERN: Pattern = [
  { name: 'inhale', durationSec: 8 },
  { name: 'exhale', durationSec: 8 },
];

export type PatternId = 'box' | '4-7-8' | '8-8';

export interface PatternCatalogEntry {
  id: PatternId;
  title: string;
  description: string;
  phases: Pattern;
}

export const PATTERN_CATALOG: readonly PatternCatalogEntry[] = [
  {
    id: 'box',
    title: 'Box',
    description: 'Inhale, hold, exhale, hold — four equal counts of four seconds each.',
    phases: BOX_PATTERN,
  },
  {
    id: '4-7-8',
    title: '4-7-8',
    description: 'Inhale for four, hold for seven, exhale slowly for eight.',
    phases: FOUR_SEVEN_EIGHT_PATTERN,
  },
  {
    id: '8-8',
    title: '8-8',
    description: 'A steady inhale and exhale of eight seconds each, with no holds.',
    phases: EIGHT_EIGHT_PATTERN,
  },
];

export function getPatternById(id: PatternId): PatternCatalogEntry {
  const entry = PATTERN_CATALOG.find((p) => p.id === id);
  if (!entry) throw new Error(`Unknown pattern id: ${id}`);
  return entry;
}

export function isPatternId(value: unknown): value is PatternId {
  return typeof value === 'string' && PATTERN_CATALOG.some((p) => p.id === value);
}

export const DEFAULT_PATTERN_ID: PatternId = 'box';
