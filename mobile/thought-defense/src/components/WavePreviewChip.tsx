import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
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
    enter.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [visible, waveIndex, enter, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 8 }],
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
        <Text style={styles.label}>
          Next · wave {waveIndex + 1}/{GAME.waveCount}
        </Text>
        <Text style={styles.total}>{total} thoughts</Text>
      </View>
      <View style={styles.row}>
        {groups.map((g) => (
          <View
            key={g.kind}
            style={[styles.pill, { borderColor: `${KIND_TINT[g.kind]}55` }]}
          >
            <View style={[styles.dot, { backgroundColor: KIND_TINT[g.kind] }]} />
            <Text style={styles.pillText}>
              {g.count} {GAME.enemies[g.kind].displayName}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Plant before they walk · {tip}</Text>
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
    gap: 6,
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
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
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
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkSoft,
  },
});
