import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { isHoldPhase, type EngineState, type PhaseName } from '@/lib/session-engine';

const VIEW_SIZE = 240;
const CENTER = VIEW_SIZE / 2;
const HALO_RADIUS = 104;
const DISC_MIN = 56;
const DISC_MAX = 100;
const ARC_GAP = 8;
const HOLD_ARC_COLOR = '#f08279';

function phaseLabel(name: PhaseName): string {
  switch (name) {
    case 'inhale':
      return 'Inhale';
    case 'exhale':
      return 'Exhale';
    case 'hold-full':
    case 'hold-empty':
      return 'Hold';
  }
}

function holdProgressFor(state: EngineState): number {
  if (!isHoldPhase(state.phase)) return 0;
  return Math.min(1, Math.max(0, state.phaseProgress));
}

export interface BreathHUDProps {
  state: EngineState;
}

export function BreathHUD({ state }: BreathHUDProps) {
  const theme = useTheme();

  const discRadius = DISC_MIN + (DISC_MAX - DISC_MIN) * state.fullness;
  const isHold = isHoldPhase(state.phase);
  const arcRadius = discRadius + ARC_GAP;
  const circumference = 2 * Math.PI * arcRadius;
  const holdProgress = holdProgressFor(state);
  const dashOffset = circumference * (1 - holdProgress);

  return (
    <View className="items-center justify-center gap-3">
      <Svg width={VIEW_SIZE} height={VIEW_SIZE} viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}>
        <Circle cx={CENTER} cy={CENTER} r={HALO_RADIUS} fill={theme.muted} />
        <Circle cx={CENTER} cy={CENTER} r={discRadius} fill={theme.foreground} />
        {isHold ? (
          <G rotation={-90} origin={`${CENTER}, ${CENTER}`}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={arcRadius}
              fill="none"
              stroke={HOLD_ARC_COLOR}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </G>
        ) : null}
      </Svg>

      <View className="items-center gap-1">
        <Text variant="large">{phaseLabel(state.phase)}</Text>
        <Text variant="muted">{state.secondsRemaining}</Text>
      </View>
    </View>
  );
}
