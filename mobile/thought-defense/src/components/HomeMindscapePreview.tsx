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

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      core.value = 1;
      padPulse.value = 0.7;
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
  }, [core, enter, padPulse, reduceMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 12 }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: core.value }],
  }));
  const emptyPadStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + padPulse.value * 0.45,
  }));

  return (
    <Animated.View
      style={[styles.wrap, wrapStyle]}
      accessible
      accessibilityLabel="Soft mindscape preview: path, plant pads, and Peace Core"
    >
      <View
        style={[
          styles.path,
          dawn ? { backgroundColor: '#E8C9A0' } : null,
        ]}
      />
      <View
        style={[
          styles.pathBend,
          dawn ? { backgroundColor: '#E8C9A0' } : null,
        ]}
      />
      <Animated.View style={[styles.pad, styles.padEmpty, emptyPadStyle]} />
      <View
        style={[
          styles.pad,
          styles.padAffirm,
          lantern ? { borderColor: LANTERN_RIM.Affirmation } : null,
        ]}
      />
      <View
        style={[
          styles.pad,
          styles.padGratitude,
          lantern ? { borderColor: LANTERN_RIM.Gratitude } : null,
        ]}
      />
      <View
        style={[
          styles.pad,
          styles.padHumor,
          lantern ? { borderColor: LANTERN_RIM.Humor } : null,
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
        <Text style={styles.coreLabel}>Peace</Text>
      </View>
      <Text style={styles.caption}>
        {dawn || lantern
          ? `plan view · ${dawn && lantern ? 'Dawn + Lantern' : dawn ? 'Dawn Path' : 'Lantern'} looks`
          : 'plan view · plant kindness · hold Peace'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 22,
    height: 132,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderWidth: 1,
    borderColor: colors.line,
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
  pad: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  padEmpty: {
    left: 48,
    top: 36,
    backgroundColor: 'rgba(90, 126, 116, 0.18)',
    borderColor: colors.calm,
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
  coreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.brandDeep,
    letterSpacing: 0.2,
  },
  caption: {
    position: 'absolute',
    left: 16,
    bottom: 10,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
});
