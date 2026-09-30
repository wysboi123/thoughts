import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GAME, upgradeCost } from '../game/config';
import type { GameState, TowerKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

const KINDS: TowerKind[] = ['Affirmation', 'Gratitude', 'Humor'];

type Props = {
  state: GameState;
  onSelectKind: (kind: TowerKind) => void;
  onUpgrade: () => void;
  onSell: () => void;
  onBack: () => void;
};

/**
 * Draft C — Tray dual-mode
 * Plant mode: three plant cards (+ optional idle hint)
 * Select mode: plant cards dim/non-interactive; Upgrade · Sell · Back
 */
export function DualModeTray({
  state,
  onSelectKind,
  onUpgrade,
  onSell,
  onBack,
}: Props) {
  const selected = state.towers.find((t) => t.padIndex === state.selectedPad);
  const selectMode = selected != null;

  const upgradeLabel = (() => {
    if (!selected) return 'Upgrade';
    if (selected.level >= GAME.maxTowerLevel) return 'Maxed';
    return `Upgrade · ${upgradeCost(selected.kind, selected.level)}`;
  })();

  return (
    <View style={styles.tray}>
      <Text style={styles.title}>
        {selectMode
          ? `Selected · ${GAME.towers[selected.kind].displayName} L${selected.level}`
          : 'Plant kindness'}
      </Text>

      <View style={[styles.plantRow, selectMode && styles.plantRowDimmed]}>
        {KINDS.map((k) => {
          const active = !selectMode && state.selectedTower === k;
          return (
            <Pressable
              key={k}
              disabled={selectMode}
              onPress={() => onSelectKind(k)}
              style={[
                styles.plantCard,
                active && styles.plantCardActive,
                selectMode && styles.plantCardLocked,
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor:
                      k === 'Affirmation'
                        ? colors.affirmation
                        : k === 'Gratitude'
                          ? colors.gratitude
                          : colors.humor,
                  },
                ]}
              />
              <Text style={[styles.plantName, selectMode && styles.dimText]}>
                {GAME.towers[k].displayName}
              </Text>
              <Text style={[styles.plantCost, selectMode && styles.dimText]}>
                {GAME.towers[k].cost}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectMode ? (
        <View style={styles.actionRow}>
          <SoftButton
            label={upgradeLabel}
            onPress={onUpgrade}
            disabled={selected.level >= GAME.maxTowerLevel}
            style={styles.actionBtn}
          />
          <SoftButton label="Sell 50%" variant="soft" onPress={onSell} style={styles.actionBtn} />
          <SoftButton label="Back" variant="ghost" onPress={onBack} style={styles.backBtn} />
        </View>
      ) : (
        <Text style={styles.hint}>Tap an empty pad to plant · tap a planted thought to upgrade</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    marginTop: 8,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
    textAlign: 'center',
  },
  plantRow: {
    flexDirection: 'row',
    gap: 8,
  },
  plantRowDimmed: {
    opacity: 0.38,
  },
  plantCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  plantCardActive: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  plantCardLocked: {
    borderColor: 'transparent',
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 4,
  },
  plantName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  plantCost: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.clarity,
    marginTop: 2,
  },
  dimText: {
    color: colors.inkSoft,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: { flex: 1, paddingVertical: 12 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 14 },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
