import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
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

  useEffect(() => {
    if (!visible) {
      enter.value = reduceMotion ? 1 : 0;
      return;
    }
    if (reduceMotion) {
      enter.value = 1;
      breath.value = 1;
      return;
    }
    enter.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    breath.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.94, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [visible, enter, breath, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.96 + enter.value * 0.04 }, { translateY: (1 - enter.value) * 10 }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: 0.35 + (breath.value - 0.94) * 0.8,
  }));

  const progressPct =
    softGoalsTotal > 0 ? Math.round((softGoalsDone / softGoalsTotal) * 100) : 0;

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
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.card, dawn ? styles.cardDawn : null, cardStyle]}>
          <Animated.View
            pointerEvents="none"
            style={[styles.breathOrb, dawn ? styles.breathOrbDawn : null, orbStyle]}
          />
          <Text style={styles.eyebrow}>Mindscape paused</Text>
          <Text style={styles.title}>Take a breath</Text>
          <Text style={styles.lead}>
            The path holds still. Planting, upgrades, and soft goals wait exactly where you left
            them. Metaphor only — not therapy.
          </Text>

          {phaseLabel ? (
            <View style={styles.phaseChip} accessibilityRole="text">
              <Text style={styles.phaseText}>{phaseLabel}</Text>
            </View>
          ) : null}

          <Text style={styles.meta}>{waveLabel}</Text>
          {calm != null && clarity != null ? (
            <View style={styles.snapshotRow} accessibilityRole="summary">
              <View style={styles.snapshotPill}>
                <Text style={styles.snapshotLabel}>Calm</Text>
                <Text style={styles.snapshotValue}>{calm}</Text>
              </View>
              <View style={[styles.snapshotPill, styles.snapshotClarity]}>
                <Text style={styles.snapshotLabel}>Clarity</Text>
                <Text style={styles.snapshotValue}>{clarity}</Text>
              </View>
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
                <View style={[styles.fill, { width: `${progressPct}%` }]} />
              </View>
            </View>
          ) : null}

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
  card: {
    borderRadius: 24,
    padding: 22,
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
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.calm,
    textTransform: 'uppercase',
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
  phaseText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.clarity,
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
  snapshotClarity: {
    backgroundColor: 'rgba(106, 158, 174, 0.14)',
    borderColor: 'rgba(106, 158, 174, 0.22)',
  },
  snapshotLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
  snapshotValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.brandDeep,
    marginTop: 2,
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
  actions: { gap: 8, marginTop: 12 },
});
