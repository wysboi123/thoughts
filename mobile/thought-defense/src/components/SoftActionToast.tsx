import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { softHaptic } from '../a11y/haptics';
import { useReducedMotion } from '../a11y/useReducedMotion';
import type { ToastKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  message: string | null;
  kind: ToastKind | null;
};

const TINT: Record<ToastKind, { bg: string; ink: string; label: string }> = {
  plant: { bg: 'rgba(107, 184, 154, 0.28)', ink: colors.brandDeep, label: 'Planted' },
  upgrade: { bg: 'rgba(201, 168, 90, 0.28)', ink: colors.brandDeep, label: 'Deepened' },
  sell: { bg: 'rgba(106, 158, 174, 0.24)', ink: colors.clarity, label: 'Sold' },
  info: { bg: 'rgba(255,255,255,0.55)', ink: colors.inkSoft, label: 'Note' },
  warn: { bg: 'rgba(196, 120, 120, 0.22)', ink: colors.dangerSoft, label: 'Gentle' },
  success: { bg: 'rgba(90, 158, 126, 0.28)', ink: colors.successSoft, label: 'Peace' },
};

const HAPTIC: Partial<Record<ToastKind, 'plant' | 'clear' | 'warn' | 'tap'>> = {
  plant: 'plant',
  upgrade: 'clear',
  sell: 'tap',
  warn: 'warn',
  success: 'clear',
};

/**
 * Soft tinted toast chip for plant / upgrade / sell feedback.
 * Complements (does not replace) FirstRunTipChip coaching.
 */
export function SoftActionToast({ message, kind }: Props) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(message ? 1 : 0);
  const translateY = useSharedValue(0);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!message || !kind) {
      opacity.value = withTiming(0, { duration: reduceMotion ? 0 : 180 });
      return;
    }
    const key = `${kind}:${message}`;
    if (lastKey.current !== key) {
      lastKey.current = key;
      const hap = HAPTIC[kind];
      if (hap) softHaptic(hap);
      if (reduceMotion) {
        opacity.value = 1;
        translateY.value = 0;
      } else {
        opacity.value = 0;
        translateY.value = 6;
        opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
        translateY.value = withSequence(
          withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 10 }),
        );
      }
    }
  }, [message, kind, opacity, translateY, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) {
    return <View style={styles.slot} />;
  }

  const tint = TINT[kind ?? 'info'];

  return (
    <View style={styles.slot}>
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
        style={[styles.chip, { backgroundColor: tint.bg }, style]}
      >
        <Text style={[styles.badge, { color: tint.ink }]}>{tint.label}</Text>
        <Text style={[styles.text, { color: tint.ink }]} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    marginTop: 6,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    maxWidth: '96%',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    flexShrink: 1,
  },
});
