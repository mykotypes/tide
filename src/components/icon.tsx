import Svg, { Path } from 'react-native-svg';

// Web-safe stand-in for the native app's expo-symbols (SF Symbols) icons —
// SF Symbols have no browser renderer, so this app draws the handful of
// glyphs it needs directly with react-native-svg (already a dependency,
// already web-friendly), instead of pulling in an icon font/library.
export type IconName = 'chevron-left' | 'chevron-right' | 'chevron-down' | 'check' | 'chart-bar';

const PATHS: Record<IconName, string> = {
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-down': 'M6 9l6 6 6-6',
  check: 'M5 13l4 4L19 7',
  'chart-bar': 'M4 20V10M10 20V4M16 20v-7',
};

export interface IconProps {
  name: IconName;
  size?: number;
  color: string;
}

export function Icon({ name, size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={PATHS[name]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
