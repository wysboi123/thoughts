import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { softHaptic } from '../a11y/haptics';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { GAME } from '../game/config';
import { SOFT_GOAL_COPY, SOFT_GOAL_ORDER, SOFT_GOAL_TOTAL, softGoalsDone } from '../game/softGoals';
import type { GameState } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

type Props = {
  visible: boolean;
  state: GameState;
  onRetry: () => void;
  onClose: () => void;
};

/** Soft, ToS-safe win lines — metaphor only, no medical claims. */
const WIN_LINES = [
  'The path went quiet. Gentle work.',
  'Kindness held the line. Soft win.',
  'Noise settled. Peace stayed put.',
  'You planted calmly. The core is still.',
];

/** Soft lose / rest lines — never punitive, no medical framing. */
const LOSE_LINES = [
  'The core asked for a pause. That is allowed.',
  'Noise got loud — rest is part of the loop.',
  'A soft stop, not a failure. Plant again when ready.',
  'Calm dipped. The path will wait for you.',
];

const SPARKS = [
  { leftPct: 12, topPct: 8, size: 10, delay: 0, color: colors.affirmation },
  { leftPct: 78, topPct: 12, size: 8, delay: 120, color: colors.gratitude },
  { leftPct: 22, topPct: 72, size: 7, delay: 240, color: colors.clarity },
  { leftPct: 68, topPct: 68, size: 11, delay: 80, color: colors.humor },
  { leftPct: 48, topPct: 4, size: 6, delay: 180, color: colors.calm },
  { leftPct: 88, topPct: 42, size: 9, delay: 300, color: colors.affirmation },
];

/** Cooler, slower mist orbs for the gentle-rest card. */
const MIST_ORBS = [
  { leftPct: 10, topPct: 14, size: 14, delay: 0, color: colors.clarity },
  { leftPct: 74, topPct: 10, size: 11, delay: 160, color: colors.calm },
  { leftPct: 18, topPct: 70, size: 12, delay: 280, color: 'rgba(106, 158, 174, 0.55)' },
  { leftPct: 70, topPct: 66, size: 10, delay: 90, color: colors.clarity },
  { leftPct: 46, topPct: 6, size: 8, delay: 220, color: colors.calm },
];

function SoftSpark({
  leftPct,
  topPct,
  size,
  delay,
  color,
  reduceMotion,
  slow,
}: {
  leftPct: number;
  topPct: number;
  size: number;
  delay: number;
  color: string;
  reduceMotion: boolean;
  slow?: boolean;
}) {
  const pulse = useSharedValue(reduceMotion ? 0.45 : 0);
  const up = slow ? 1400 : 900;
  const down = slow ? 1400 : 900;

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.45;
      return;
    }
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: up, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.22, { duration: down, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, pulse, reduceMotion, up, down]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value * (slow ? 0.5 : 0.75),
    transform: [{ scale: 0.7 + pulse.value * 0.55 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.spark,
        {
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function loseLead(peakWave: number): string {
  if (peakWave >= 6) {
    return 'You reached the late path — soft goals still count. Rest, then try again gently.';
  }
  if (peakWave >= 3) {
    return 'Mid-path rest. Soft goals still count — plant again when you are ready.';
  }
  return 'An early pause is fine. Soft goals still count.';
}

export function WaveResultModal({ visible, state, onRetry, onClose }: Props) {
  const won = state.phase === 'won';
  const done = softGoalsDone(state.softGoals);
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(0);
  const halo = useSharedValue(0.35);
  const lineIndex = state.thoughtsCleared + state.peakWaveReached;
  const winLine = WIN_LINES[lineIndex % WIN_LINES.length] ?? WIN_LINES[0];
  const loseLine = LOSE_LINES[lineIndex % LOSE_LINES.length] ?? LOSE_LINES[0];

  useEffect(() => {
    if (!visible) {
      enter.value = 0;
      return;
    }
    if (won) softHaptic('clear');
    else softHaptic('tap');
    if (reduceMotion) {
      enter.value = 1;
      halo.value = won ? 0.55 : 0.4;
      return;
    }
    enter.value = 0;
    enter.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    if (won) {
      halo.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      // Slower, cooler breath for gentle rest — not a “fail” flash.
      halo.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.28, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
  }, [visible, won, reduceMotion, enter, halo]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * (reduceMotion ? 0 : 16) },
      { scale: 0.96 + enter.value * 0.04 },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * (won ? 0.55 : 0.42),
    transform: [{ scale: 0.92 + halo.value * 0.12 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.halo, won ? styles.haloWon : styles.haloLost, haloStyle]}
          pointerEvents="none"
        />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[styles.card, won ? styles.cardWon : styles.cardLost, cardStyle]}
          >
            {won && !reduceMotion
              ? SPARKS.map((s, i) => (
                  <SoftSpark key={`w-${i}`} {...s} reduceMotion={reduceMotion} />
                ))
              : null}
            {!won && !reduceMotion
              ? MIST_ORBS.map((s, i) => (
                  <SoftSpark key={`l-${i}`} {...s} reduceMotion={reduceMotion} slow />
                ))
              : null}
            {won ? (
              <View style={styles.badge} accessibilityRole="text">
                <Text style={styles.badgeText}>Soft win</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeLost]} accessibilityRole="text">
                <Text style={[styles.badgeText, styles.badgeTextLost]}>Gentle rest</Text>
              </View>
            )}
            <Text style={styles.title}>{won ? 'Peace held' : 'Soft pause'}</Text>
            <Text style={[styles.flavorLine, !won && styles.flavorLineLost]}>
              {won ? winLine : loseLine}
            </Text>
            <Text style={styles.lead}>
              {won
                ? 'The noise grew quiet. Soft goals for this run:'
                : loseLead(state.peakWaveReached)}
            </Text>
            <Text style={styles.count}>
              {done}/{SOFT_GOAL_TOTAL} soft goals · {state.thoughtsCleared} thoughts cleared · peak
              wave {state.peakWaveReached}/{GAME.waveCount}
            </Text>
            {SOFT_GOAL_ORDER.map((id) => (
              <View key={id} style={styles.row}>
                <Text style={styles.check}>{state.softGoals[id] ? '✓' : '○'}</Text>
                <Text style={[styles.goal, !state.softGoals[id] && styles.goalOpen]}>
                  {SOFT_GOAL_COPY[id].title}
                </Text>
              </View>
            ))}
            <View style={styles.actions}>
              <SoftButton
                label={won ? 'Play again' : 'Try again gently'}
                onPress={onRetry}
                accessibilityHint={
                  won
                    ? 'Starts a fresh mindscape run'
                    : 'Starts again with a soft reset — no penalty'
                }
              />
              <SoftButton
                label="Soft goals journal"
                variant="soft"
                onPress={() => {
                  onClose();
                  router.push('/goals');
                }}
              />
              <SoftButton label="Home" variant="ghost" onPress={() => router.replace('/')} />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 51, 58, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  haloWon: {
    backgroundColor: colors.affirmation,
  },
  haloLost: {
    backgroundColor: colors.clarity,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.mistBottom,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    overflow: 'hidden',
  },
  cardWon: {
    borderColor: 'rgba(107, 184, 154, 0.45)',
    backgroundColor: '#EEF6F2',
  },
  cardLost: {
    borderColor: 'rgba(106, 158, 174, 0.4)',
    backgroundColor: '#EEF3F5',
  },
  spark: {
    position: 'absolute',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 184, 154, 0.22)',
    marginBottom: 2,
  },
  badgeLost: {
    backgroundColor: 'rgba(106, 158, 174, 0.22)',
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
    letterSpacing: 0.3,
  },
  badgeTextLost: {
    color: colors.clarity,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.brandDeep,
  },
  flavorLine: {
    fontFamily: fonts.displaySoft,
    fontSize: 16,
    color: colors.calm,
    marginBottom: 2,
  },
  flavorLineLost: {
    color: colors.clarity,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  count: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.calm,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  check: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.brand, width: 20 },
  goal: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, flex: 1 },
  goalOpen: { color: colors.inkSoft },
  actions: { gap: 8, marginTop: 12 },
});
