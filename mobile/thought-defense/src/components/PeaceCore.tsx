import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  left: number;
  top: number;
  themeDawn?: boolean;
  stressed?: boolean;
};

/** Top-down Peace Core with soft halo breath. Metaphor only — not a health meter. */
export function PeaceCore({ left, top, themeDawn, stressed }: Props) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.55);
  const outer = useSharedValue(0.4);
  const enter = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      glow.value = stressed ? 0.7 : 0.65;
      outer.value = stressed ? 0.55 : 0.45;
      enter.value = 1;
      return;
    }
    enter.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    const breath = stressed ? 700 : 1600;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: breath, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: breath, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(stressed ? 0.95 : 0.85, {
          duration: stressed ? 900 : 1800,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(stressed ? 0.5 : 0.45, {
          duration: stressed ? 900 : 1800,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
    outer.value = withRepeat(
      withSequence(
        withTiming(stressed ? 0.7 : 0.58, {
          duration: stressed ? 1100 : 2200,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(stressed ? 0.32 : 0.28, {
          duration: stressed ? 1100 : 2200,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(glow);
      cancelAnimation(outer);
    };
  }, [pulse, glow, outer, enter, stressed, reduceMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.92 + enter.value * 0.08 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + glow.value * 0.4,
  }));

  const outerStyle = useAnimatedStyle(() => ({
    opacity: outer.value * (stressed ? 0.55 : 0.42),
    transform: [{ scale: 0.95 + outer.value * 0.12 }],
  }));

  const haloColor = stressed
    ? 'rgba(196, 120, 120, 0.45)'
    : themeDawn
      ? colors.coreGlow
      : colors.core;
  const outerColor = stressed
    ? 'rgba(196, 120, 120, 0.28)'
    : themeDawn
      ? 'rgba(255, 220, 150, 0.4)'
      : 'rgba(107, 184, 154, 0.35)';

  return (
    <Animated.View
      style={[styles.wrap, { left, top }, wrapStyle]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        stressed ? 'Peace Core, calm is low — soft warn only' : 'Peace Core, holding gently'
      }
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.outerHalo, outerStyle, { backgroundColor: outerColor }]}
      />
      <Animated.View
        style={[styles.halo, ringStyle, { backgroundColor: haloColor }]}
      />
      <View
        style={[
          styles.coreRing,
          {
            backgroundColor: themeDawn ? colors.coreGlow : colors.core,
            borderColor: stressed
              ? colors.dangerSoft
              : themeDawn
                ? 'rgba(255, 236, 190, 0.95)'
                : 'rgba(255,255,255,0.75)',
            borderWidth: stressed ? 2.5 : 2,
          },
        ]}
      >
        <View
          style={[
            styles.coreInner,
            stressed ? styles.coreInnerStressed : null,
            themeDawn && !stressed ? styles.coreInnerDawn : null,
          ]}
        >
          <Text style={[styles.coreLabel, stressed && styles.coreLabelStressed]}>Peace</Text>
          <Text style={[styles.coreSub, stressed && styles.coreSubStressed]}>
            {stressed ? 'soft hold' : 'still'}
          </Text>
        </View>
      </View>
      {stressed ? (
        <View style={styles.warnChip} accessibilityElementsHidden>
          <Text style={styles.warnText}>calm low</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerHalo: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  halo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  coreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  coreInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreInnerDawn: {
    backgroundColor: 'rgba(255, 248, 230, 0.7)',
  },
  coreInnerStressed: {
    backgroundColor: 'rgba(255, 236, 232, 0.7)',
  },
  coreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brandDeep,
  },
  coreLabelStressed: {
    color: colors.dangerSoft,
  },
  coreSub: {
    fontFamily: fonts.body,
    fontSize: 8,
    color: colors.inkSoft,
    marginTop: -1,
  },
  coreSubStressed: {
    color: colors.dangerSoft,
  },
  warnChip: {
    position: 'absolute',
    bottom: -14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(196, 120, 120, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196, 120, 120, 0.35)',
  },
  warnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    color: colors.dangerSoft,
    letterSpacing: 0.2,
  },
});
