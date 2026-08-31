import Svg, { Path } from 'react-native-svg';

// Web-safe stand-in for the native app's expo-symbols (SF Symbols) icons —
// SF Symbols have no browser renderer, so this app draws the handful of
// glyphs it needs directly with react-native-svg (already a dependency,
// already web-friendly), instead of pulling in an icon font/library.
export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'check'
  | 'chart-bar'
  | 'sliders'
  | 'volume'
  | 'volume-off'
  | 'close';

const PATHS: Record<IconName, string> = {
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-down': 'M6 9l6 6 6-6',
  check: 'M5 13l4 4L19 7',
  'chart-bar': 'M4 20V10M10 20V4M16 20v-7',
  sliders: 'M4 6h10M4 12h16M4 18h7M14 4v4M20 9v6M11 16v4',
  volume: 'M4 9v6h4l5 5V4L8 9H4zM16.5 8.5a5 5 0 010 7',
  'volume-off': 'M4 9v6h4l5 5V4L8 9H4zM16 9l5 6M21 9l-5 6',
  close: 'M6 6l12 12M18 6L6 18',
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
