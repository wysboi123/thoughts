import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  calm: number;
  clarity: number;
  waveLabel: string;
  dawn?: boolean;
  /** Calm is getting low — soft visual warn, never punitive copy */
  calmLow?: boolean;
};

function HudPill({
  label,
  value,
  accent,
  warn,
  index,
  reduceMotion,
}: {
  label: string;
  value: string;
  accent: string;
  warn?: boolean;
  index: number;
  reduceMotion: boolean;
}) {
  const enter = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      40 + index * 50,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
    );
  }, [enter, index, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 6 }],
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        { borderColor: `${accent}55`, backgroundColor: warn ? 'rgba(196,120,120,0.16)' : `${accent}18` },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${label} ${value}${warn ? ', calm is low' : ''}`}
    >
      <Text style={[styles.pillLabel, { color: warn ? colors.dangerSoft : accent }]}>{label}</Text>
      <Text style={[styles.pillValue, warn && styles.pillValueWarn]}>{value}</Text>
    </Animated.View>
  );
}

/** Soft mindscape HUD — Calm / Clarity / Wave pills. Metaphor meters only. */
export function SoftPlayHud({ calm, clarity, waveLabel, dawn, calmLow }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <View
      style={[styles.row, dawn ? styles.rowDawn : null]}
      accessibilityRole="summary"
      accessibilityLabel={`Calm ${calm}, Clarity ${clarity}, ${waveLabel}`}
    >
      <HudPill
        label="Calm"
        value={String(calm)}
        accent={colors.calm}
        warn={calmLow}
        index={0}
        reduceMotion={reduceMotion}
      />
      <HudPill
        label="Clarity"
        value={String(clarity)}
        accent={colors.clarity}
        index={1}
        reduceMotion={reduceMotion}
      />
      <HudPill
        label="Wave"
        value={waveLabel}
        accent={colors.brand}
        index={2}
        reduceMotion={reduceMotion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
    padding: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.7)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  pill: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  pillLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pillValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.brandDeep,
  },
  pillValueWarn: {
    color: colors.dangerSoft,
  },
});
