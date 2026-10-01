import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  left: number;
  top: number;
  label: string;
  filled: boolean;
  selected: boolean;
  fillColor: string;
  /** Elapsed time of last plant/upgrade pulse for this pad (null = idle) */
  pulseAt: number | null;
  now: number;
  onPress: () => void;
};

/** Top-down plant disc — empty pads breathe softly until occupied. */
export function PadDisc({
  left,
  top,
  label,
  filled,
  selected,
  fillColor,
  pulseAt,
  now,
  onPress,
}: Props) {
  const breath = useSharedValue(1);
  const pop = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (filled || reduceMotion) {
      breath.value = withTiming(1, { duration: reduceMotion ? 0 : 200 });
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(breath);
  }, [filled, breath, reduceMotion]);

  useEffect(() => {
    if (pulseAt == null || now - pulseAt > 0.55) return;
    if (reduceMotion) {
      pop.value = 1;
      return;
    }
    pop.value = 1;
    pop.value = withSequence(
      withTiming(1.18, { duration: 140, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 280, easing: Easing.inOut(Easing.sin) }),
    );
  }, [pulseAt, now, pop, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: (selected ? 1.06 : breath.value) * pop.value }],
  }));

  const a11yLabel = filled
    ? `Planted thought ${label}${selected ? ', selected' : ''}`
    : `Empty pad ${label}. Double tap to plant.`;

  return (
    <Animated.View style={[{ position: 'absolute', left, top }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityState={{ selected }}
        hitSlop={TAP_SLOP}
        onPress={(e) => {
          e.stopPropagation?.();
          softHaptic(filled ? 'tap' : 'plant');
          onPress();
        }}
        style={[
          styles.pad,
          {
            borderColor: selected ? colors.brandDeep : filled ? 'rgba(255,255,255,0.7)' : colors.line,
            backgroundColor: filled ? fillColor : 'rgba(255,255,255,0.72)',
            borderWidth: selected ? 3 : 2,
          },
        ]}
      >
        <Text style={styles.padText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: MIN_TAP + 4,
    height: MIN_TAP + 4,
    borderRadius: (MIN_TAP + 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
  },
});
