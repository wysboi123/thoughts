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
import { describeWave, GAME } from '../game/config';
import type { EnemyKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const KIND_TINT: Record<EnemyKind, string> = {
  Doubt: colors.doubt,
  Worry: colors.worry,
  SelfCritic: colors.critic,
};

const KIND_HINT: Record<EnemyKind, string> = {
  Doubt: 'steady Affirmation helps',
  Worry: 'Gratitude slows the flutter',
  SelfCritic: 'Humor softens clusters',
};

type Props = {
  waveIndex: number;
  visible: boolean;
  dawn?: boolean;
};

function KindPill({
  kind,
  count,
  index,
  total,
  reduceMotion,
  visible,
}: {
  kind: EnemyKind;
  count: number;
  index: number;
  total: number;
  reduceMotion: boolean;
  visible: boolean;
}) {
  const enter = useSharedValue(reduceMotion || !visible ? 1 : 0);
  const tint = KIND_TINT[kind];
  const share = total > 0 ? count / total : 0;

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
      60 + index * 55,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
    );
  }, [visible, kind, count, enter, index, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 5 }, { scale: 0.94 + enter.value * 0.06 }],
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        { borderColor: `${tint}66`, backgroundColor: `${tint}14` },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <View style={styles.pillBody}>
        <Text style={styles.pillText}>
          {count} {GAME.enemies[kind].displayName}
        </Text>
        <View style={styles.miniTrack} accessibilityElementsHidden>
          <View
            style={[
              styles.miniFill,
              { width: `${Math.max(12, share * 100)}%` as `${number}%`, backgroundColor: tint },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Soft next-wave composition under the board during prep / intermission.
 * Helps plan kindness without spoiling mid-wave tension.
 */
export function WavePreviewChip({ waveIndex, visible, dawn }: Props) {
  const reduceMotion = useReducedMotion();
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
    enter.value = 0;
    enter.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, [visible, waveIndex, enter, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 8 },
      { scale: 0.97 + enter.value * 0.03 },
    ],
  }));

  if (!visible || waveIndex < 0 || waveIndex >= GAME.waveCount) return null;
  const groups = describeWave(waveIndex);
  if (groups.length === 0) return null;

  const total = groups.reduce((sum, g) => sum + g.count, 0);
  const heaviest = groups.reduce((a, b) => (b.count > a.count ? b : a), groups[0]);
  const accent = KIND_TINT[heaviest.kind];
  const tip = KIND_HINT[heaviest.kind];

  return (
    <Animated.View
      style={[styles.wrap, dawn ? styles.wrapDawn : null, { borderLeftColor: accent }, style]}
      accessibilityRole="summary"
      accessibilityLabel={`Next wave composition: ${groups
        .map((g) => `${g.count} ${GAME.enemies[g.kind].displayName}`)
        .join(', ')}. ${total} thoughts total. Tip: ${tip}`}
    >
      <View style={styles.headRow}>
        <View style={styles.headLeft}>
          <Text style={styles.label}>
            Next · wave {waveIndex + 1}/{GAME.waveCount}
          </Text>
          <View style={[styles.accentDot, { backgroundColor: accent }]} />
        </View>
        <View style={[styles.totalChip, dawn ? styles.totalChipDawn : null]}>
          <Text style={styles.total}>{total} thoughts</Text>
        </View>
      </View>
      <View style={styles.row}>
        {groups.map((g, i) => (
          <KindPill
            key={g.kind}
            kind={g.kind}
            count={g.count}
            index={i}
            total={total}
            reduceMotion={reduceMotion}
            visible={visible}
          />
        ))}
      </View>
      <View
        style={[styles.tipChip, { borderColor: `${accent}44`, backgroundColor: `${accent}12` }]}
      >
        <Text style={styles.hint}>Plant before they walk · {tip}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    maxWidth: 360,
    gap: 7,
  },
  wrapDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.72)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  totalChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(63, 111, 98, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.2)',
  },
  totalChipDawn: {
    backgroundColor: 'rgba(201, 168, 90, 0.16)',
    borderColor: 'rgba(201, 168, 90, 0.3)',
  },
  total: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.brandDeep,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 108,
  },
  pillBody: {
    flex: 1,
    gap: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
  },
  miniTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(36,51,58,0.1)',
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  tipChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkSoft,
  },
});
