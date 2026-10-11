import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  /** Lantern Towers pack / Pass — soft rim glow only */
  lantern?: boolean;
  lanternRim?: string;
  /** Dawn Path look — warmer empty-pad aura */
  dawn?: boolean;
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
  lantern,
  lanternRim,
  dawn,
  pulseAt,
  now,
  onPress,
}: Props) {
  const breath = useSharedValue(1);
  const aura = useSharedValue(0.35);
  const outerAura = useSharedValue(0.22);
  const pop = useSharedValue(1);
  const enter = useSharedValue(0);
  const selectPulse = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
  }, [enter, reduceMotion]);

  useEffect(() => {
    if (filled || reduceMotion) {
      breath.value = withTiming(1, { duration: reduceMotion ? 0 : 200 });
      aura.value = withTiming(filled ? 0.2 : 0.4, { duration: reduceMotion ? 0 : 200 });
      outerAura.value = withTiming(filled ? 0.1 : 0.25, { duration: reduceMotion ? 0 : 200 });
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
    aura.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.28, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    outerAura.value = withRepeat(
      withSequence(
        withTiming(0.42, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.16, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(breath);
      cancelAnimation(aura);
      cancelAnimation(outerAura);
    };
  }, [filled, breath, aura, outerAura, reduceMotion]);

  useEffect(() => {
    if (!selected || reduceMotion) {
      selectPulse.value = 1;
      return;
    }
    selectPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(selectPulse);
  }, [selected, selectPulse, reduceMotion]);

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
    opacity: enter.value,
    transform: [
      {
        scale:
          (selected ? selectPulse.value * 1.04 : breath.value) * pop.value * (0.94 + enter.value * 0.06),
      },
    ],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: filled ? 0 : aura.value * (dawn ? 0.55 : 0.45),
    transform: [{ scale: 0.95 + aura.value * 0.2 }],
  }));

  const outerAuraStyle = useAnimatedStyle(() => ({
    opacity: filled ? 0 : outerAura.value * (dawn ? 0.5 : 0.4),
    transform: [{ scale: 0.92 + outerAura.value * 0.22 }],
  }));

  const selectRingStyle = useAnimatedStyle(() => ({
    opacity: selected ? 0.55 + (selectPulse.value - 1) * 4 : 0,
    transform: [{ scale: selectPulse.value }],
  }));

  const a11yLabel = filled
    ? `Planted thought ${label}${selected ? ', selected' : ''}`
    : `Empty pad ${label}. Double tap to plant.`;

  const auraColor = dawn ? 'rgba(232, 201, 160, 0.55)' : 'rgba(91, 138, 122, 0.4)';
  const outerAuraColor = dawn ? 'rgba(232, 201, 160, 0.28)' : 'rgba(91, 138, 122, 0.22)';

  return (
    <Animated.View style={[{ position: 'absolute', left, top }, style]}>
      {!filled ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[styles.outerAura, { backgroundColor: outerAuraColor }, outerAuraStyle]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.outerAuraRim,
              outerAuraStyle,
              {
                borderColor: dawn
                  ? 'rgba(200, 170, 120, 0.35)'
                  : 'rgba(91, 138, 122, 0.3)',
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.aura, { backgroundColor: auraColor }, auraStyle]}
          />
        </>
      ) : null}
      {selected ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selectRing,
            selectRingStyle,
            { backgroundColor: `${colors.brand}12` },
          ]}
        />
      ) : null}
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
            borderColor: selected
              ? colors.brandDeep
              : lantern && filled && lanternRim
                ? lanternRim
                : filled
                  ? 'rgba(255,255,255,0.7)'
                  : dawn
                    ? 'rgba(200, 170, 120, 0.55)'
                    : colors.line,
            backgroundColor: filled
              ? fillColor
              : dawn
                ? 'rgba(255,248,235,0.78)'
                : 'rgba(255,255,255,0.72)',
            borderWidth: selected ? 3 : lantern && filled ? 2.5 : 2,
            shadowColor:
              lantern && filled
                ? lanternRim ?? '#E8D48A'
                : selected
                  ? colors.brand
                  : 'transparent',
            shadowOpacity: lantern && filled ? 0.55 : selected ? 0.25 : 0,
            shadowRadius: lantern && filled ? 8 : selected ? 6 : 0,
            shadowOffset: { width: 0, height: 0 },
            elevation: lantern && filled ? 3 : selected ? 2 : 0,
          },
        ]}
      >
        {filled ? (
          <View
            pointerEvents="none"
            style={[styles.filledAccent, { backgroundColor: 'rgba(255,255,255,0.5)' }]}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[
              styles.emptyAccent,
              { backgroundColor: dawn ? 'rgba(200,170,120,0.55)' : colors.calm },
            ]}
          />
        )}
        {!filled ? (
          <View pointerEvents="none" style={styles.emptySheen} />
        ) : (
          <View
            pointerEvents="none"
            style={[styles.filledGlow, { backgroundColor: `${fillColor}55` }]}
          />
        )}
        {filled ? <View style={styles.innerSheen} pointerEvents="none" /> : null}
        {lantern && filled ? <Text style={styles.lanternDot}>✦</Text> : null}
        <Text style={[styles.padText, !filled && styles.padTextEmpty]}>{label}</Text>
        {!filled ? (
          <View style={styles.plantChip}>
            <View pointerEvents="none" style={styles.plantChipSheen} />
            <View
              style={[
                styles.plantDot,
                { backgroundColor: dawn ? 'rgba(200,170,120,0.9)' : colors.calm },
              ]}
            />
            <Text style={styles.plantHint}>plant</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const PAD = MIN_TAP + 4;

const styles = StyleSheet.create({
  outerAura: {
    position: 'absolute',
    width: PAD + 22,
    height: PAD + 22,
    borderRadius: (PAD + 22) / 2,
    left: -11,
    top: -11,
  },
  outerAuraRim: {
    position: 'absolute',
    width: PAD + 26,
    height: PAD + 26,
    borderRadius: (PAD + 26) / 2,
    left: -13,
    top: -13,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  aura: {
    position: 'absolute',
    width: PAD + 14,
    height: PAD + 14,
    borderRadius: (PAD + 14) / 2,
    left: -7,
    top: -7,
  },
  selectRing: {
    position: 'absolute',
    width: PAD + 10,
    height: PAD + 10,
    borderRadius: (PAD + 10) / 2,
    left: -5,
    top: -5,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  pad: {
    width: PAD,
    height: PAD,
    borderRadius: PAD / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.55,
  },
  filledAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.7,
  },
  emptySheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  filledGlow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 2,
    height: 10,
    borderRadius: 8,
    opacity: 0.55,
  },
  innerSheen: {
    position: 'absolute',
    top: 3,
    left: 6,
    width: PAD * 0.45,
    height: PAD * 0.28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  lanternDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 8,
    color: 'rgba(255,248,220,0.95)',
  },
  padText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
  },
  padTextEmpty: {
    fontSize: 15,
    color: colors.calm,
    marginTop: -2,
  },
  plantChip: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(36,51,58,0.08)',
  },
  plantChipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  plantDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  plantHint: {
    fontFamily: fonts.body,
    fontSize: 7,
    color: colors.inkSoft,
    letterSpacing: 0.3,
  },
});
