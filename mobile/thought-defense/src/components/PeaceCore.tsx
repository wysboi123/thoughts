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
  const mid = useSharedValue(0.5);
  const enter = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      glow.value = stressed ? 0.7 : 0.65;
      outer.value = stressed ? 0.55 : 0.45;
      mid.value = stressed ? 0.6 : 0.5;
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
    mid.value = withRepeat(
      withSequence(
        withTiming(stressed ? 0.75 : 0.62, {
          duration: stressed ? 1000 : 2000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(stressed ? 0.38 : 0.35, {
          duration: stressed ? 1000 : 2000,
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
      cancelAnimation(mid);
    };
  }, [pulse, glow, outer, mid, enter, stressed, reduceMotion]);

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

  const midStyle = useAnimatedStyle(() => ({
    opacity: mid.value * (stressed ? 0.5 : 0.38),
    transform: [{ scale: 0.97 + mid.value * 0.08 }],
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
  const midColor = stressed
    ? 'rgba(196, 120, 120, 0.22)'
    : themeDawn
      ? 'rgba(255, 230, 170, 0.32)'
      : 'rgba(107, 184, 154, 0.28)';

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
        pointerEvents="none"
        style={[styles.midHalo, midStyle, { backgroundColor: midColor }]}
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
            shadowColor: stressed ? colors.dangerSoft : themeDawn ? '#C9A85A' : colors.core,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.coreSheen} />
        <View
          style={[
            styles.coreInner,
            stressed ? styles.coreInnerStressed : null,
            themeDawn && !stressed ? styles.coreInnerDawn : null,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: stressed ? colors.dangerSoft : colors.calm },
            ]}
          />
          <Text style={[styles.coreLabel, stressed && styles.coreLabelStressed]}>Peace</Text>
          <Text style={[styles.coreSub, stressed && styles.coreSubStressed]}>
            {stressed ? 'soft hold' : 'still'}
          </Text>
        </View>
      </View>
      {stressed ? (
        <View style={styles.warnChip} accessibilityElementsHidden>
          <View style={styles.warnDot} />
          <Text style={styles.warnText}>calm soft</Text>
        </View>
      ) : (
        <View style={styles.holdChip} accessibilityElementsHidden>
          <Text style={styles.holdText}>holding gently</Text>
        </View>
      )}
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
    width: 118,
    height: 118,
    borderRadius: 59,
  },
  midHalo: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
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
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  coreSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.22)',
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
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginBottom: 1,
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
    bottom: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(196, 120, 120, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196, 120, 120, 0.35)',
  },
  warnDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.dangerSoft,
  },
  warnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    color: colors.dangerSoft,
    letterSpacing: 0.2,
  },
  holdChip: {
    position: 'absolute',
    bottom: -16,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 184, 154, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(107, 184, 154, 0.28)',
  },
  holdText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    color: colors.brand,
    letterSpacing: 0.2,
  },
});
