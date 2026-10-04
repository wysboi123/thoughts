import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { GameState, SoftGoalId } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

type Props = {
  visible: boolean;
  state: GameState;
  onRetry: () => void;
  onClose: () => void;
  /** Dawn Atmosphere look — soft card tint only */
  dawn?: boolean;
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

const GOAL_ACCENTS: Record<SoftGoalId, string> = {
  plant_three: colors.affirmation,
  clear_wave_one: colors.clarity,
  upgrade_once: colors.gratitude,
  reach_wave_three: colors.calm,
  plant_all_kinds: colors.humor,
  reach_wave_six: colors.brand,
  keep_calm: colors.successSoft,
};

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

function SoftGoalRow({
  id,
  done,
  index,
  reduceMotion,
  visible,
}: {
  id: SoftGoalId;
  done: boolean;
  index: number;
  reduceMotion: boolean;
  visible: boolean;
}) {
  const enter = useSharedValue(reduceMotion || !visible ? 1 : 0);
  const accent = GOAL_ACCENTS[id];

  useEffect(() => {
    if (!visible) {
      enter.value = 0;
      return;
    }
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      180 + index * 45,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
    );
  }, [visible, enter, index, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateX: (1 - enter.value) * (reduceMotion ? 0 : 8) }],
  }));

  return (
    <Animated.View
      style={[
        styles.goalRow,
        {
          borderLeftColor: accent,
          backgroundColor: done ? `${accent}18` : 'rgba(255,255,255,0.35)',
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${SOFT_GOAL_COPY[id].title}${done ? ', done' : ', open'}`}
    >
      <View style={[styles.goalDot, { backgroundColor: accent }]} />
      <Text style={[styles.check, done && { color: accent }]}>{done ? '✓' : '○'}</Text>
      <Text style={[styles.goal, !done && styles.goalOpen]} numberOfLines={1}>
        {SOFT_GOAL_COPY[id].title}
      </Text>
    </Animated.View>
  );
}

function StatPill({
  label,
  value,
  accent,
  index,
  reduceMotion,
  visible,
}: {
  label: string;
  value: string;
  accent: string;
  index: number;
  reduceMotion: boolean;
  visible: boolean;
}) {
  const enter = useSharedValue(reduceMotion || !visible ? 1 : 0);

  useEffect(() => {
    if (!visible) {
      enter.value = 0;
      return;
    }
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      80 + index * 40,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
  }, [visible, enter, index, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 6 }],
  }));

  return (
    <Animated.View
      style={[
        styles.statPill,
        { borderColor: `${accent}55`, backgroundColor: `${accent}16` },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${label} ${value}`}
    >
      <Text style={[styles.statLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
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

export function WaveResultModal({ visible, state, onRetry, onClose, dawn }: Props) {
  const won = state.phase === 'won';
  const done = softGoalsDone(state.softGoals);
  const progressPct = Math.round((done / SOFT_GOAL_TOTAL) * 100);
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(0);
  const halo = useSharedValue(0.35);
  const bar = useSharedValue(0);
  const lineIndex = state.thoughtsCleared + state.peakWaveReached;
  const winLine = WIN_LINES[lineIndex % WIN_LINES.length] ?? WIN_LINES[0];
  const loseLine = LOSE_LINES[lineIndex % LOSE_LINES.length] ?? LOSE_LINES[0];

  useEffect(() => {
    if (!visible) {
      enter.value = 0;
      bar.value = 0;
      return;
    }
    if (won) softHaptic('clear');
    else softHaptic('tap');
    if (reduceMotion) {
      enter.value = 1;
      bar.value = progressPct / 100;
      halo.value = won ? 0.55 : 0.4;
      return;
    }
    enter.value = 0;
    enter.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    bar.value = 0;
    bar.value = withDelay(
      220,
      withTiming(progressPct / 100, { duration: 640, easing: Easing.out(Easing.cubic) }),
    );
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
  }, [visible, won, reduceMotion, enter, halo, bar, progressPct]);

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

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, bar.value * 100)}%` as `${number}%`,
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
            style={[
              styles.card,
              won ? styles.cardWon : styles.cardLost,
              dawn ? styles.cardDawn : null,
              cardStyle,
            ]}
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
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {won ? (
                <View style={[styles.badge, styles.badgeWonAccent]} accessibilityRole="text">
                  <Text style={styles.badgeText}>Soft win</Text>
                </View>
              ) : (
                <View
                  style={[styles.badge, styles.badgeLost, styles.badgeLostAccent]}
                  accessibilityRole="text"
                >
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

              <View style={styles.statRow}>
                <StatPill
                  label="Cleared"
                  value={String(state.thoughtsCleared)}
                  accent={colors.affirmation}
                  index={0}
                  reduceMotion={reduceMotion}
                  visible={visible}
                />
                <StatPill
                  label="Peak"
                  value={`${state.peakWaveReached}/${GAME.waveCount}`}
                  accent={colors.brand}
                  index={1}
                  reduceMotion={reduceMotion}
                  visible={visible}
                />
                <StatPill
                  label="Goals"
                  value={`${done}/${SOFT_GOAL_TOTAL}`}
                  accent={won ? colors.gratitude : colors.clarity}
                  index={2}
                  reduceMotion={reduceMotion}
                  visible={visible}
                />
              </View>

              <View
                style={styles.progressBlock}
                accessibilityRole="summary"
                accessibilityLabel={`${done} of ${SOFT_GOAL_TOTAL} soft goals, ${progressPct} percent`}
              >
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>
                    Soft goals · {done}/{SOFT_GOAL_TOTAL}
                  </Text>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
                <View style={styles.track} accessibilityElementsHidden>
                  <Animated.View
                    style={[
                      styles.fill,
                      {
                        backgroundColor: won ? colors.affirmation : colors.clarity,
                      },
                      barStyle,
                    ]}
                  />
                </View>
              </View>

              {SOFT_GOAL_ORDER.map((id, i) => (
                <SoftGoalRow
                  key={id}
                  id={id}
                  done={!!state.softGoals[id]}
                  index={i}
                  reduceMotion={reduceMotion}
                  visible={visible}
                />
              ))}

              <View style={styles.comfortStrip} accessibilityRole="summary">
                <Text style={styles.comfortTitle}>Metaphor only</Text>
                <Text style={styles.comfortBody}>
                  Soft goals and rest lines are gentle session aims — not therapy, diagnosis, or
                  treatment.
                </Text>
              </View>

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
            </ScrollView>
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
    padding: 18,
    backgroundColor: colors.mistBottom,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  cardWon: {
    borderColor: 'rgba(107, 184, 154, 0.45)',
    backgroundColor: '#EEF6F2',
  },
  cardLost: {
    borderColor: 'rgba(106, 158, 174, 0.4)',
    backgroundColor: '#EEF3F5',
  },
  cardDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.92)',
    borderColor: 'rgba(232, 201, 160, 0.55)',
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
    borderLeftWidth: 3,
    borderLeftColor: colors.affirmation,
  },
  badgeWonAccent: {
    borderLeftColor: colors.affirmation,
  },
  badgeLost: {
    backgroundColor: 'rgba(106, 158, 174, 0.22)',
  },
  badgeLostAccent: {
    borderLeftColor: colors.clarity,
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
  statRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 1,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  statValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  progressBlock: {
    gap: 6,
    marginBottom: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.calm,
  },
  progressPct: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(36,51,58,0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  check: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.brand, width: 18 },
  goal: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, flex: 1 },
  goalOpen: { color: colors.inkSoft },
  comfortStrip: {
    marginTop: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 2,
  },
  comfortTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  actions: { gap: 8, marginTop: 8 },
});
