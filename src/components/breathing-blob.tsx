import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { PATTERN_PICKER_COLORS } from '@/lib/pattern-picker-palette';

// The Pattern Picker's mascot: one abstract "breathing companion" silhouette
// per pattern (not a literal animal), sized and shaped by `shape`. It
// visibly breathes via a slow idle scale so the illustration reinforces the
// app's one job.
export type BlobShape = 'round' | 'teardrop' | 'boxy' | 'knobbed';

const EYE_POSITIONS: Record<BlobShape, { left: number; right: number; y: number }> = {
  round: { left: 48, right: 72, y: 58 },
  teardrop: { left: 47, right: 71, y: 60 },
  boxy: { left: 46, right: 74, y: 52 },
  knobbed: { left: 48, right: 72, y: 60 },
};

function Body({ shape, ink }: { shape: BlobShape; ink: string }) {
  switch (shape) {
    case 'round':
      return <Circle cx={60} cy={65} r={38} fill={ink} />;
    case 'teardrop':
      return <Path d="M60,18 C84,18 94,52 89,74 C84,98 36,98 31,74 C26,52 36,18 60,18 Z" fill={ink} />;
    case 'boxy':
      return <Rect x={24} y={28} width={72} height={66} rx={24} ry={24} fill={ink} />;
    case 'knobbed':
      return (
        <>
          <Rect x={57} y={12} width={6} height={16} fill={ink} />
          <Circle cx={60} cy={10} r={7} fill={ink} />
          <Circle cx={60} cy={65} r={36} fill={ink} />
        </>
      );
  }
}

function Legs({ shape, ink }: { shape: BlobShape; ink: string }) {
  if (shape === 'knobbed') return null;
  return (
    <>
      <Ellipse cx={44} cy={101} rx={8} ry={4} fill={ink} />
      <Ellipse cx={76} cy={101} rx={8} ry={4} fill={ink} />
    </>
  );
}

function Eyes({ shape, ink, paper }: { shape: BlobShape; ink: string; paper: string }) {
  const { left, right, y } = EYE_POSITIONS[shape];
  return (
    <>
      <Circle cx={left} cy={y} r={6.5} fill={paper} />
      <Circle cx={left + 2} cy={y} r={2.75} fill={ink} />
      <Circle cx={right} cy={y} r={6.5} fill={paper} />
      <Circle cx={right - 2} cy={y} r={2.75} fill={ink} />
    </>
  );
}

export interface BreathingBlobProps {
  shape: BlobShape;
  size?: number;
  animated?: boolean;
}

export function BreathingBlob({ shape, size = 96, animated = true }: BreathingBlobProps) {
  const ink = PATTERN_PICKER_COLORS.charcoal;
  const paper = PATTERN_PICKER_COLORS.cream;
  const shadow = PATTERN_PICKER_COLORS.creamMuted;

  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;
    scale.value = withRepeat(withTiming(1.07, { duration: 1900 }), -1, true);
  }, [animated, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, animated ? style : undefined]}>
      <Svg width={size} height={size} viewBox="0 0 120 110">
        <Ellipse cx={60} cy={104} rx={30} ry={4} fill={shadow} opacity={0.6} />
        <Legs shape={shape} ink={ink} />
        <Body shape={shape} ink={ink} />
        <Eyes shape={shape} ink={ink} paper={paper} />
      </Svg>
    </Animated.View>
  );
}

export const BLOB_SHAPE_BY_PATTERN: Record<string, BlobShape> = {
  box: 'boxy',
  '4-7-8': 'teardrop',
  '8-8': 'round',
  custom: 'knobbed',
};
