import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { LANTERN_RIM } from '../iap/cosmetics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  dawn?: boolean;
  lantern?: boolean;
};

/** Soft home vignette — path strip, plant discs, Peace Core breath. Visual only. */
export function HomeMindscapePreview({ dawn, lantern }: Props) {
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const core = useSharedValue(1);
  const padPulse = useSharedValue(0.55);
  const walker = useSharedValue(0);
  const mist = useSharedValue(0.4);
  const pathGlow = useSharedValue(0.35);

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      core.value = 1;
      padPulse.value = 0.7;
      walker.value = 0.45;
      mist.value = 0.5;
      pathGlow.value = 0.45;
      return;
    }
    enter.value = withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) });
    core.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    padPulse.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
    walker.value = withDelay(
      400,
      withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    mist.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    pathGlow.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.28, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [core, enter, padPulse, walker, mist, pathGlow, reduceMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 12 }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: core.value }],
  }));
  const emptyPadStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + padPulse.value * 0.45,
    transform: [{ scale: 0.92 + padPulse.value * 0.12 }],
  }));
  const mistStyle = useAnimatedStyle(() => ({
    opacity: mist.value * (dawn ? 0.55 : 0.4),
  }));
  const pathGlowStyle = useAnimatedStyle(() => ({
    opacity: pathGlow.value * (dawn ? 0.5 : 0.4),
  }));
  const walkerStyle = useAnimatedStyle(() => {
    // Soft thought drifts along the L-path: down then right.
    const t = walker.value;
    const down = Math.min(1, t / 0.55);
    const across = Math.max(0, (t - 0.55) / 0.45);
    const x = 22 + across * 95;
    const y = 32 + down * 58;
    const mid = 1 - Math.abs(t - 0.5) * 2;
    return {
      left: x,
      top: y,
      opacity: 0.4 + mid * 0.45,
      transform: [{ scale: 0.85 + mid * 0.2 }],
    };
  });
  const walkerTrailStyle = useAnimatedStyle(() => {
    const t = Math.max(0, walker.value - 0.08);
    const down = Math.min(1, t / 0.55);
    const across = Math.max(0, (t - 0.55) / 0.45);
    return {
      left: 22 + across * 95,
      top: 32 + down * 58,
      opacity: 0.22,
    };
  });

  const lookLabel =
    dawn && lantern ? 'Dawn + Lantern' : dawn ? 'Dawn Path' : lantern ? 'Lantern' : null;

  return (
    <Animated.View
      style={[styles.wrap, dawn ? styles.wrapDawn : null, wrapStyle]}
      accessible
      accessibilityLabel="Soft mindscape preview: path, plant pads, and Peace Core"
    >
      <View pointerEvents="none" style={styles.accentBar} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.mistWash,
          mistStyle,
          { backgroundColor: dawn ? 'rgba(232, 201, 160, 0.35)' : 'rgba(107, 184, 154, 0.28)' },
        ]}
      />
      <View style={[styles.ground, dawn ? styles.groundDawn : null]} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pathGlow,
          pathGlowStyle,
          { backgroundColor: dawn ? 'rgba(232, 201, 160, 0.35)' : 'rgba(91, 138, 122, 0.28)' },
        ]}
      />
      <View style={[styles.path, dawn ? { backgroundColor: '#E8C9A0' } : null]} />
      <View style={[styles.pathBend, dawn ? { backgroundColor: '#E8C9A0' } : null]} />
      {!reduceMotion ? (
        <>
          <Animated.View pointerEvents="none" style={[styles.walkerTrail, walkerTrailStyle]} />
          <Animated.View pointerEvents="none" style={[styles.walker, walkerStyle]} />
        </>
      ) : null}
      <Animated.View
        style={[
          styles.pad,
          styles.padEmpty,
          dawn ? styles.padEmptyDawn : null,
          emptyPadStyle,
        ]}
      >
        <Text style={styles.padPlus}>+</Text>
      </Animated.View>
      <View
        style={[
          styles.pad,
          styles.padAffirm,
          lantern ? { borderColor: LANTERN_RIM.Affirmation, borderWidth: 2.5 } : null,
        ]}
      />
      <View
        style={[
          styles.pad,
          styles.padGratitude,
          lantern ? { borderColor: LANTERN_RIM.Gratitude, borderWidth: 2.5 } : null,
        ]}
      />
      <View
        style={[
          styles.pad,
          styles.padHumor,
          lantern ? { borderColor: LANTERN_RIM.Humor, borderWidth: 2.5 } : null,
        ]}
      />
      <Animated.View
        style={[
          styles.coreOuter,
          coreStyle,
          dawn ? { backgroundColor: 'rgba(255, 220, 150, 0.35)' } : null,
        ]}
      />
      <Animated.View
        style={[
          styles.coreHalo,
          coreStyle,
          dawn ? { backgroundColor: 'rgba(255, 220, 150, 0.55)' } : null,
        ]}
      />
      <View style={[styles.core, dawn ? { backgroundColor: colors.coreGlow } : null]}>
        <View style={styles.coreDot} />
        <Text style={styles.coreLabel}>Peace</Text>
        <Text style={styles.coreSub}>still</Text>
      </View>
      {lookLabel ? (
        <View style={[styles.lookChip, dawn ? styles.lookChipDawn : null]}>
          <View style={[styles.lookDot, dawn ? styles.lookDotDawn : null]} />
          <Text style={styles.lookChipText}>{lookLabel}</Text>
        </View>
      ) : null}
      <View style={styles.captionChip}>
        <Text style={styles.caption}>
          {lookLabel
            ? `plan view · ${lookLabel} looks`
            : 'plan view · plant kindness · hold Peace'}
        </Text>
        <Text style={styles.captionMeta}>metaphor only</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 22,
    height: 148,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#243A34',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  wrapDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.55)',
    borderColor: 'rgba(232, 201, 160, 0.45)',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brand,
    opacity: 0.45,
  },
  mistWash: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -30,
    right: -20,
  },
  ground: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 18,
    bottom: 36,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 138, 122, 0.1)',
  },
  groundDawn: {
    backgroundColor: 'rgba(232, 201, 160, 0.16)',
  },
  pathGlow: {
    position: 'absolute',
    left: 12,
    top: 22,
    width: 30,
    height: 92,
    borderRadius: 14,
  },
  path: {
    position: 'absolute',
    left: 18,
    top: 28,
    width: 18,
    height: 78,
    borderRadius: 10,
    backgroundColor: colors.path,
  },
  pathBend: {
    position: 'absolute',
    left: 18,
    top: 88,
    width: 118,
    height: 16,
    borderRadius: 10,
    backgroundColor: colors.path,
  },
  walkerTrail: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(176, 140, 110, 0.35)',
  },
  walker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.worry,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  pad: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padEmpty: {
    left: 48,
    top: 36,
    backgroundColor: 'rgba(90, 126, 116, 0.18)',
    borderColor: colors.calm,
  },
  padEmptyDawn: {
    backgroundColor: 'rgba(232, 201, 160, 0.28)',
    borderColor: 'rgba(200, 170, 120, 0.7)',
  },
  padPlus: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.calm,
  },
  padAffirm: {
    left: 48,
    top: 64,
    backgroundColor: colors.affirmation,
  },
  padGratitude: {
    left: 92,
    top: 78,
    backgroundColor: colors.gratitude,
  },
  padHumor: {
    left: 128,
    top: 78,
    backgroundColor: colors.humor,
  },
  coreOuter: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(107, 184, 154, 0.22)',
  },
  coreHalo: {
    position: 'absolute',
    right: 28,
    top: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 232, 168, 0.45)',
  },
  core: {
    position: 'absolute',
    right: 36,
    top: 36,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.core,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  coreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.calm,
    marginBottom: 1,
  },
  coreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.brandDeep,
    letterSpacing: 0.2,
  },
  coreSub: {
    fontFamily: fonts.body,
    fontSize: 7,
    color: colors.inkSoft,
    marginTop: -1,
  },
  lookChip: {
    position: 'absolute',
    top: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  lookChipDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.85)',
    borderColor: 'rgba(232, 201, 160, 0.5)',
  },
  lookDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  lookDotDawn: {
    backgroundColor: '#C9A85A',
  },
  lookChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.brandDeep,
  },
  captionChip: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    flexShrink: 1,
  },
  captionMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.clarity,
  },
});
