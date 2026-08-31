// Pattern Picker's own palette — cream/charcoal/coral, deliberately not the
// shared shadcn tokens in src/lib/theme.ts (see ADR 0002). Coral is reserved
// for the primary action and selection-state indicators only; everything
// else stays cream/charcoal.
export const PATTERN_PICKER_COLORS = {
  cream: '#F1E9DE',
  creamMuted: '#B9AC97',
  charcoal: '#2B2624',
  charcoalMuted: '#9C948B',
  coral: '#E2604C',
} as const;
