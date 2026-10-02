import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { describeWave, GAME } from '../game/config';
import type { EnemyKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const KIND_TINT: Record<EnemyKind, string> = {
  Doubt: colors.doubt,
  Worry: colors.worry,
  SelfCritic: colors.critic,
};

type Props = {
  waveIndex: number;
  visible: boolean;
};

/**
 * Soft next-wave composition under the board during prep / intermission.
 * Helps plan kindness without spoiling mid-wave tension.
 */
export function WavePreviewChip({ waveIndex, visible }: Props) {
  if (!visible || waveIndex < 0 || waveIndex >= GAME.waveCount) return null;
  const groups = describeWave(waveIndex);
  if (groups.length === 0) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel={`Next wave composition: ${groups
        .map((g) => `${g.count} ${GAME.enemies[g.kind].displayName}`)
        .join(', ')}`}
    >
      <Text style={styles.label}>
        Next · wave {waveIndex + 1}/{GAME.waveCount}
      </Text>
      <View style={styles.row}>
        {groups.map((g) => (
          <View key={g.kind} style={styles.pill}>
            <View style={[styles.dot, { backgroundColor: KIND_TINT[g.kind] }]} />
            <Text style={styles.pillText}>
              {g.count} {GAME.enemies[g.kind].displayName}
            </Text>
          </View>
        ))}
      </View>
    </View>
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
    maxWidth: 360,
    gap: 6,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
});
