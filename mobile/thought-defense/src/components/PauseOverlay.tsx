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
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

type Props = {
  visible: boolean;
  waveLabel: string;
  calm?: number;
  clarity?: number;
  softGoalsDone?: number;
  softGoalsTotal?: number;
  phaseLabel?: string;
  dawn?: boolean;
  onResume: () => void;
};

/** Mid-run soft pause — freezes the mindscape without medical framing. */
export function PauseOverlay({
  visible,
  waveLabel,
  calm,
  clarity,
  softGoalsDone = 0,
  softGoalsTotal = 0,
  phaseLabel,
  dawn,
  onResume,
}: Props) {
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const breath = useSharedValue(1);
  const bar = useSharedValue(0);
  const pillA = useSharedValue(reduceMotion ? 1 : 0);
  const pillB = useSharedValue(reduceMotion ? 1 : 0);
  const calmLow = calm != null && calm <= 10;

  const progressPct =
    softGoalsTotal > 0 ? Math.round((softGoalsDone / softGoalsTotal) * 100) : 0;

  useEffect(() => {
    if (!visible) {
      enter.value = reduceMotion ? 1 : 0;
      bar.value = 0;
      pillA.value = 0;
      pillB.value = 0;
      return;
    }
    if (reduceMotion) {
      enter.value = 1;
      breath.value = 1;
      bar.value = progressPct / 100;
      pillA.value = 1;
      pillB.value = 1;
      return;
    }
    enter.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
    breath.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.94, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    bar.value = 0;
    bar.value = withDelay(
      200,
      withTiming(progressPct / 100, { duration: 560, easing: Easing.out(Easing.cubic) }),
    );
    pillA.value = withDelay(
      80,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
    pillB.value = withDelay(
      140,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
  }, [visible, enter, breath, bar, pillA, pillB, reduceMotion, progressPct]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.96 + enter.value * 0.04 }, { translateY: (1 - enter.value) * 10 }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: 0.35 + (breath.value - 0.94) * 0.8,
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: enter.value * 0.5,
    transform: [{ scale: 0.9 + enter.value * 0.12 }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, bar.value * 100)}%` as `${number}%`,
  }));

  const pillAStyle = useAnimatedStyle(() => ({
    opacity: pillA.value,
    transform: [{ translateY: (1 - pillA.value) * 6 }],
  }));

  const pillBStyle = useAnimatedStyle(() => ({
    opacity: pillB.value,
    transform: [{ translateY: (1 - pillB.value) * 6 }],
  }));

  const resume = () => {
    softHaptic('tap');
    onResume();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resume}>
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Resume mindscape"
        onPress={resume}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.halo, dawn ? styles.haloDawn : null, haloStyle]}
        />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.card, dawn ? styles.cardDawn : null, cardStyle]}>
            <View style={[styles.accentBar, dawn ? styles.accentBarDawn : null]} />
            <Animated.View
              pointerEvents="none"
              style={[styles.breathOrb, dawn ? styles.breathOrbDawn : null, orbStyle]}
            />
            <View style={styles.eyebrowRow}>
              <View style={[styles.eyebrowBadge, dawn ? styles.eyebrowBadgeDawn : null]}>
                <Text style={styles.eyebrow}>Mindscape paused</Text>
              </View>
              {calmLow ? (
                <View style={styles.calmWarnChip} accessibilityRole="text">
                  <Text style={styles.calmWarnText}>calm soft</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>Take a breath</Text>
            <Text style={styles.lead}>
              The path holds still. Planting, upgrades, and soft goals wait exactly where you left
              them. Metaphor only — not therapy.
            </Text>

            {phaseLabel ? (
              <View
                style={[styles.phaseChip, dawn ? styles.phaseChipDawn : null]}
                accessibilityRole="text"
              >
                <Text style={[styles.phaseText, dawn ? styles.phaseTextDawn : null]}>
                  {phaseLabel}
                </Text>
              </View>
            ) : null}

            <Text style={styles.meta}>{waveLabel}</Text>
            {calm != null && clarity != null ? (
              <View style={styles.snapshotRow} accessibilityRole="summary">
                <Animated.View
                  style={[
                    styles.snapshotPill,
                    calmLow ? styles.snapshotCalmLow : null,
                    pillAStyle,
                  ]}
                >
                  <Text
                    style={[styles.snapshotLabel, calmLow ? styles.snapshotLabelWarn : null]}
                  >
                    Calm
                  </Text>
                  <Text
                    style={[styles.snapshotValue, calmLow ? styles.snapshotValueWarn : null]}
                  >
                    {calm}
                  </Text>
                </Animated.View>
                <Animated.View
                  style={[styles.snapshotPill, styles.snapshotClarity, pillBStyle]}
                >
                  <Text style={styles.snapshotLabel}>Clarity</Text>
                  <Text style={styles.snapshotValue}>{clarity}</Text>
                </Animated.View>
              </View>
            ) : null}

            {softGoalsTotal > 0 ? (
              <View style={styles.goalsStrip} accessibilityRole="summary">
                <View style={styles.goalsRow}>
                  <Text style={styles.goalsLabel}>
                    Soft goals {softGoalsDone}/{softGoalsTotal}
                  </Text>
                  <Text style={styles.goalsPct}>{progressPct}%</Text>
                </View>
                <View style={styles.track}>
                  <Animated.View
                    style={[
                      styles.fill,
                      dawn ? styles.fillDawn : null,
                      barStyle,
                    ]}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.comfortStrip} accessibilityRole="summary">
              <Text style={styles.comfortTitle}>Pause is part of the loop</Text>
              <Text style={styles.comfortBody}>
                Soft rest mid-run — no penalty. Resume when the mindscape feels ready.
              </Text>
            </View>

            <View style={styles.actions}>
              <SoftButton label="Resume" onPress={resume} />
              <SoftButton
                label="Soft goals journal"
                variant="soft"
                onPress={() => {
                  softHaptic('tap');
                  router.push('/goals');
                }}
              />
              <SoftButton
                label="Leave mindscape"
                variant="ghost"
                onPress={() => {
                  softHaptic('tap');
                  router.replace('/');
                }}
              />
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
    backgroundColor: 'rgba(36, 51, 58, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(91, 138, 122, 0.28)',
  },
  haloDawn: {
    backgroundColor: 'rgba(232, 201, 160, 0.35)',
  },
  card: {
    borderRadius: 24,
    padding: 22,
    paddingLeft: 26,
    backgroundColor: colors.mistBottom,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    overflow: 'hidden',
  },
  cardDawn: {
    backgroundColor: '#F3E8D6',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },
  accentBarDawn: {
    backgroundColor: colors.gratitude,
  },
  breathOrb: {
    position: 'absolute',
    top: -28,
    right: -18,
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: 'rgba(91, 138, 122, 0.28)',
  },
  breathOrbDawn: {
    backgroundColor: 'rgba(255, 220, 150, 0.45)',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(91, 138, 122, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.28)',
  },
  eyebrowBadgeDawn: {
    backgroundColor: 'rgba(201, 168, 90, 0.18)',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.calm,
    textTransform: 'uppercase',
  },
  calmWarnChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(196, 120, 120, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(196, 120, 120, 0.3)',
  },
  calmWarnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.dangerSoft,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.brandDeep,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  phaseChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 158, 174, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(106, 158, 174, 0.28)',
  },
  phaseChipDawn: {
    backgroundColor: 'rgba(201, 168, 90, 0.16)',
    borderColor: 'rgba(201, 168, 90, 0.32)',
  },
  phaseText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.clarity,
  },
  phaseTextDawn: {
    color: colors.gratitude,
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clarity,
    marginBottom: 2,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  snapshotPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(91, 138, 122, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.22)',
  },
  snapshotCalmLow: {
    backgroundColor: 'rgba(196, 120, 120, 0.14)',
    borderColor: 'rgba(196, 120, 120, 0.3)',
  },
  snapshotClarity: {
    backgroundColor: 'rgba(106, 158, 174, 0.14)',
    borderColor: 'rgba(106, 158, 174, 0.22)',
  },
  snapshotLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
  snapshotLabelWarn: {
    color: colors.dangerSoft,
  },
  snapshotValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.brandDeep,
    marginTop: 2,
  },
  snapshotValueWarn: {
    color: colors.dangerSoft,
  },
  goalsStrip: {
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalsLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.calm,
  },
  goalsPct: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.brandDeep,
  },
  track: {
    height: 7,
    borderRadius: 7,
    backgroundColor: 'rgba(63, 111, 98, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: colors.brand,
  },
  fillDawn: {
    backgroundColor: colors.gratitude,
  },
  comfortStrip: {
    marginTop: 2,
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
  actions: { gap: 8, marginTop: 12 },
});
