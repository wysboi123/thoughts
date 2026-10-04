import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
  dawn?: boolean;
};

const TINT: Record<
  ToastKind,
  { bg: string; ink: string; label: string; accent: string }
> = {
  plant: {
    bg: 'rgba(107, 184, 154, 0.28)',
    ink: colors.brandDeep,
    label: 'Planted',
    accent: colors.affirmation,
  },
  upgrade: {
    bg: 'rgba(201, 168, 90, 0.28)',
    ink: colors.brandDeep,
    label: 'Deepened',
    accent: colors.gratitude,
  },
  sell: {
    bg: 'rgba(106, 158, 174, 0.24)',
    ink: colors.clarity,
    label: 'Sold',
    accent: colors.clarity,
  },
  info: {
    bg: 'rgba(255,255,255,0.55)',
    ink: colors.inkSoft,
    label: 'Note',
    accent: colors.calm,
  },
  warn: {
    bg: 'rgba(196, 120, 120, 0.22)',
    ink: colors.dangerSoft,
    label: 'Gentle',
    accent: colors.dangerSoft,
  },
  success: {
    bg: 'rgba(90, 158, 126, 0.28)',
    ink: colors.successSoft,
    label: 'Peace',
    accent: colors.successSoft,
  },
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
export function SoftActionToast({ message, kind, dawn }: Props) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(message ? 1 : 0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
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
        scale.value = 1;
        opacity.value = withDelay(2200, withTiming(0.55, { duration: 0 }));
      } else {
        opacity.value = 0;
        translateY.value = 8;
        scale.value = 0.94;
        opacity.value = withSequence(
          withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
          withDelay(1800, withTiming(0.72, { duration: 420, easing: Easing.inOut(Easing.quad) })),
        );
        translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
        scale.value = withSequence(
          withTiming(1.03, { duration: 180, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
        );
      }
    }
  }, [message, kind, opacity, translateY, scale, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
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
        style={[
          styles.chip,
          {
            backgroundColor: dawn ? 'rgba(255, 244, 220, 0.82)' : tint.bg,
            borderLeftColor: tint.accent,
          },
          style,
        ]}
      >
        <View style={[styles.badgePill, { backgroundColor: `${tint.accent}33` }]}>
          <Text style={[styles.badge, { color: tint.ink }]}>{tint.label}</Text>
        </View>
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
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    maxWidth: '96%',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
