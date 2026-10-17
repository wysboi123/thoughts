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
  const warnPulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      40 + index * 50,
      withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }),
    );
  }, [enter, index, reduceMotion]);

  useEffect(() => {
    if (!warn || reduceMotion) {
      warnPulse.value = 1;
      return;
    }
    warnPulse.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [warn, warnPulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 6 },
      { scale: 0.96 + enter.value * 0.04 },
    ],
  }));

  const warnDotStyle = useAnimatedStyle(() => ({
    opacity: warn ? warnPulse.value : 1,
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        {
          borderColor: warn ? `${colors.dangerSoft}66` : `${accent}55`,
          backgroundColor: warn ? 'rgba(196,120,120,0.16)' : `${accent}18`,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${label} ${value}${warn ? ', calm is soft — take a breath' : ''}`}
    >
      <View pointerEvents="none" style={[styles.pillSheen, { backgroundColor: `${accent}14` }]} />
      <View
        pointerEvents="none"
        style={[styles.pillGlow, { backgroundColor: warn ? `${colors.dangerSoft}22` : `${accent}18` }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.pillRing,
          { borderColor: warn ? `${colors.dangerSoft}33` : `${accent}28` },
        ]}
      />
      <View style={styles.pillTop}>
        <Animated.View
          style={[
            styles.pillDot,
            { backgroundColor: warn ? colors.dangerSoft : accent },
            warnDotStyle,
          ]}
        />
        <Text style={[styles.pillLabel, { color: warn ? colors.dangerSoft : accent }]}>{label}</Text>
      </View>
      <Text style={[styles.pillValue, warn && styles.pillValueWarn]}>{value}</Text>
      <View
        pointerEvents="none"
        style={[
          styles.pillUnderline,
          { backgroundColor: warn ? `${colors.dangerSoft}55` : `${accent}44` },
        ]}
      />
    </Animated.View>
  );
}

/** Soft mindscape HUD — Calm / Clarity / Wave pills. Metaphor meters only. */
export function SoftPlayHud({ calm, clarity, waveLabel, dawn, calmLow }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <View
      style={[styles.wrap, dawn ? styles.wrapDawn : null]}
      accessibilityRole="summary"
      accessibilityLabel={`Calm ${calm}, Clarity ${clarity}, ${waveLabel}${
        calmLow ? ', calm is soft' : ''
      }`}
    >
      <View
        pointerEvents="none"
        style={[styles.accentBar, dawn ? styles.accentBarDawn : null]}
      />
      <View pointerEvents="none" style={styles.topSheen} />
      <View
        pointerEvents="none"
        style={[
          styles.cornerOrb,
          { backgroundColor: dawn ? 'rgba(201,168,90,0.12)' : `${colors.brand}12` },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bottomWash,
          { backgroundColor: dawn ? 'rgba(201,168,90,0.1)' : `${colors.brand}0C` },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.sideWash,
          { backgroundColor: dawn ? 'rgba(201,168,90,0.09)' : `${colors.brand}0A` },
        ]}
      />
      <View style={styles.row}>
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
      <View style={styles.footer} accessibilityRole="text">
        <View
          style={[
            styles.footerBadge,
            dawn
              ? { backgroundColor: 'rgba(201,168,90,0.14)', borderColor: 'rgba(201,168,90,0.32)' }
              : { backgroundColor: `${colors.brand}14`, borderColor: `${colors.brand}33` },
          ]}
        >
          <View pointerEvents="none" style={styles.chipSheen} />
          <View
            pointerEvents="none"
            style={[
              styles.footerGlow,
              {
                backgroundColor: dawn
                  ? 'rgba(201,168,90,0.22)'
                  : `${colors.brand}22`,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.footerWash,
              {
                backgroundColor: dawn
                  ? 'rgba(201,168,90,0.1)'
                  : `${colors.brand}10`,
              },
            ]}
          />
          <View style={[styles.footerDot, dawn ? styles.footerDotDawn : null]} />
          <Text style={styles.footerLabel}>Mindscape meters</Text>
        </View>
        {calmLow ? (
          <View style={styles.softChip}>
            <View pointerEvents="none" style={styles.softChipSheen} />
            <View
              pointerEvents="none"
              style={[styles.footerGlow, { backgroundColor: 'rgba(196,120,120,0.25)' }]}
            />
            <View
              pointerEvents="none"
              style={[styles.footerWash, { backgroundColor: 'rgba(196,120,120,0.12)' }]}
            />
            <View style={styles.softChipDot} />
            <Text style={styles.softChipLabel}>Calm soft — breathe</Text>
          </View>
        ) : (
          <View style={styles.hintChip}>
            <View pointerEvents="none" style={styles.chipSheen} />
            <View
              pointerEvents="none"
              style={[
                styles.footerGlow,
                {
                  backgroundColor: dawn
                    ? 'rgba(201,168,90,0.18)'
                    : `${colors.brand}18`,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.footerWash,
                {
                  backgroundColor: dawn
                    ? 'rgba(201,168,90,0.08)'
                    : `${colors.brand}0C`,
                },
              ]}
            />
            <Text style={styles.footerHint}>Metaphor only · not medical</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    padding: 8,
    paddingTop: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  wrapDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.7)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brand,
    opacity: 0.45,
    zIndex: 2,
  },
  accentBarDawn: {
    backgroundColor: '#C9A85A',
    opacity: 0.55,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cornerOrb: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    right: -18,
    top: 28,
  },
  bottomWash: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 4,
    height: 28,
    borderRadius: 14,
  },
  sideWash: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    left: 0,
    width: 16,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  chipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
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
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pillSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  pillGlow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 0,
    height: 10,
    borderRadius: 8,
    opacity: 0.7,
  },
  pillRing: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 11,
    borderWidth: 1,
    opacity: 0.85,
  },
  pillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  pillUnderline: {
    width: 18,
    height: 2,
    borderRadius: 2,
    marginTop: 2,
    opacity: 0.85,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 2,
    gap: 8,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerGlow: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 0,
    height: 4,
    borderRadius: 3,
  },
  footerWash: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 1,
    height: 5,
    borderRadius: 3,
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.brand,
    opacity: 0.65,
  },
  footerDotDawn: {
    backgroundColor: '#C9A85A',
  },
  footerLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.inkSoft,
    letterSpacing: 0.2,
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(36,58,52,0.1)',
    overflow: 'hidden',
  },
  footerHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
    opacity: 0.85,
  },
  softChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(196,120,120,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(196,120,120,0.28)',
    overflow: 'hidden',
  },
  softChipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  softChipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.dangerSoft,
  },
  softChipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.dangerSoft,
  },
});
