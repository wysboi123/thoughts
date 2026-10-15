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
        style={[
          styles.outerRim,
          outerStyle,
          {
            borderColor: stressed
              ? 'rgba(196, 120, 120, 0.35)'
              : themeDawn
                ? 'rgba(201, 168, 90, 0.35)'
                : 'rgba(107, 184, 154, 0.32)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cornerWash,
          {
            backgroundColor: stressed
              ? 'rgba(196, 120, 120, 0.12)'
              : themeDawn
                ? 'rgba(201, 168, 90, 0.12)'
                : 'rgba(107, 184, 154, 0.12)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cornerWashSoft,
          {
            backgroundColor: stressed
              ? 'rgba(196, 120, 120, 0.1)'
              : themeDawn
                ? 'rgba(201, 168, 90, 0.1)'
                : 'rgba(107, 184, 154, 0.1)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cornerWashAlt,
          {
            backgroundColor: stressed
              ? 'rgba(196, 120, 120, 0.08)'
              : themeDawn
                ? 'rgba(201, 168, 90, 0.08)'
                : 'rgba(106, 158, 174, 0.1)',
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.midHalo, midStyle, { backgroundColor: midColor }]}
      />
      <Animated.View
        style={[styles.halo, ringStyle, { backgroundColor: haloColor }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.coreOuterRing,
          {
            borderColor: stressed
              ? 'rgba(196, 120, 120, 0.28)'
              : themeDawn
                ? 'rgba(201, 168, 90, 0.28)'
                : 'rgba(107, 184, 154, 0.28)',
          },
        ]}
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
        <View
          pointerEvents="none"
          style={[
            styles.coreTopAccent,
            {
              backgroundColor: stressed
                ? colors.dangerSoft
                : themeDawn
                  ? '#C9A85A'
                  : colors.calm,
            },
          ]}
        />
        <View pointerEvents="none" style={styles.coreSheen} />
        <View
          pointerEvents="none"
          style={[
            styles.coreBottomGlow,
            {
              backgroundColor: stressed
                ? 'rgba(196, 120, 120, 0.26)'
                : themeDawn
                  ? 'rgba(201, 168, 90, 0.24)'
                  : 'rgba(107, 184, 154, 0.26)',
            },
          ]}
        />
        <View
          style={[
            styles.coreInner,
            stressed ? styles.coreInnerStressed : null,
            themeDawn && !stressed ? styles.coreInnerDawn : null,
          ]}
        >
          <View pointerEvents="none" style={styles.innerSheen} />
          <View
            pointerEvents="none"
            style={[
              styles.innerRing,
              {
                borderColor: stressed
                  ? 'rgba(196, 120, 120, 0.35)'
                  : themeDawn
                    ? 'rgba(201, 168, 90, 0.35)'
                    : 'rgba(91, 138, 122, 0.3)',
              },
            ]}
          />
          <View style={styles.statusWrap}>
            <View
              pointerEvents="none"
              style={[
                styles.statusHalo,
                {
                  backgroundColor: stressed
                    ? 'rgba(196, 120, 120, 0.28)'
                    : 'rgba(91, 138, 122, 0.22)',
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.statusRing,
                {
                  borderColor: stressed
                    ? 'rgba(196, 120, 120, 0.4)'
                    : 'rgba(91, 138, 122, 0.35)',
                },
              ]}
            />
            <View
              style={[
                styles.statusDot,
                { backgroundColor: stressed ? colors.dangerSoft : colors.calm },
              ]}
            />
          </View>
          <View style={styles.labelRow}>
            <View
              style={[
                styles.labelLead,
                {
                  backgroundColor: stressed
                    ? colors.dangerSoft
                    : themeDawn
                      ? '#C9A85A'
                      : colors.calm,
                },
              ]}
            />
            <Text style={[styles.coreLabel, stressed && styles.coreLabelStressed]}>Peace</Text>
          </View>
          <Text style={[styles.coreSub, stressed && styles.coreSubStressed]}>
            {stressed ? 'soft hold' : 'still'}
          </Text>
        </View>
      </View>
      {stressed ? (
        <View style={styles.warnChip} accessibilityElementsHidden>
          <View pointerEvents="none" style={styles.warnChipTopAccent} />
          <View pointerEvents="none" style={styles.chipSheen} />
          <View pointerEvents="none" style={styles.warnChipRing} />
          <View pointerEvents="none" style={styles.warnChipGlow} />
          <View style={styles.warnDot} />
          <Text style={styles.warnText}>calm soft</Text>
        </View>
      ) : (
        <View style={styles.holdChip} accessibilityElementsHidden>
          <View pointerEvents="none" style={styles.holdChipTopAccent} />
          <View pointerEvents="none" style={styles.chipSheen} />
          <View pointerEvents="none" style={styles.holdChipRing} />
          <View pointerEvents="none" style={styles.holdChipGlow} />
          <View style={styles.holdDot} />
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
  outerRim: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cornerWash: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    right: -14,
    top: -10,
  },
  cornerWashSoft: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    left: -12,
    bottom: -8,
  },
  cornerWashAlt: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    right: 18,
    bottom: -10,
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
  coreOuterRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    opacity: 0.85,
  },
  coreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    shadowOpacity: 0.54,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  coreTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
    zIndex: 2,
  },
  coreSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  coreBottomGlow: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 0,
    height: 18,
    borderRadius: 10,
    opacity: 0.88,
  },
  coreInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  innerRing: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 21,
    borderWidth: 1,
    opacity: 0.85,
  },
  coreInnerDawn: {
    backgroundColor: 'rgba(255, 248, 230, 0.7)',
  },
  coreInnerStressed: {
    backgroundColor: 'rgba(255, 236, 232, 0.7)',
  },
  statusWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  statusHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    opacity: 0.85,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelLead: {
    width: 2,
    height: 9,
    borderRadius: 1,
    opacity: 0.75,
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
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  warnChipTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.dangerSoft,
    opacity: 0.55,
    zIndex: 2,
  },
  warnChipRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(196, 120, 120, 0.28)',
    opacity: 0.85,
  },
  warnChipGlow: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(196, 120, 120, 0.35)',
    opacity: 0.75,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 184, 154, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(107, 184, 154, 0.28)',
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  holdChipTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.calm,
    opacity: 0.55,
    zIndex: 2,
  },
  holdChipRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(107, 184, 154, 0.28)',
    opacity: 0.85,
  },
  holdChipGlow: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(107, 184, 154, 0.35)',
    opacity: 0.75,
  },
  holdDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  chipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  holdText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    color: colors.brand,
    letterSpacing: 0.2,
  },
});
