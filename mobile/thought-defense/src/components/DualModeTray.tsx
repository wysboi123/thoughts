import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { GAME, upgradeCost } from '../game/config';
import type { GameState, TowerKind } from '../game/types';
import { LANTERN_RIM } from '../iap/cosmetics';
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
  /** Lantern Towers look — plant card swatches get soft lantern rims */
  themeLantern?: boolean;
};

/**
 * Draft C — Tray dual-mode
 * Plant mode: three plant cards (+ optional idle hint)
 * Select mode: plant cards dim/non-interactive; Upgrade · Sell · Back
 * Mode swaps animate (opacity + soft slide) — locked UX, polish only.
 */
export function DualModeTray({
  state,
  onSelectKind,
  onUpgrade,
  onSell,
  onBack,
  themeLantern,
}: Props) {
  const selected = state.towers.find((t) => t.padIndex === state.selectedPad);
  const selectMode = selected != null;
  const mode = useSharedValue(selectMode ? 1 : 0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    mode.value = withTiming(selectMode ? 1 : 0, {
      duration: reduceMotion ? 0 : 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectMode, mode, reduceMotion]);

  const plantRowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mode.value, [0, 1], [1, 0.38]),
    transform: [{ scale: interpolate(mode.value, [0, 1], [1, 0.97]) }],
  }));

  const plantHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mode.value, [0, 0.4, 1], [1, 0.2, 0]),
    maxHeight: interpolate(mode.value, [0, 1], [28, 0]),
    transform: [{ translateY: interpolate(mode.value, [0, 1], [0, -4]) }],
    overflow: 'hidden' as const,
  }));

  const actionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mode.value, [0, 0.35, 1], [0, 0.4, 1]),
    maxHeight: interpolate(mode.value, [0, 1], [0, 96]),
    transform: [{ translateY: interpolate(mode.value, [0, 1], [8, 0]) }],
    overflow: 'hidden' as const,
  }));

  const upgradeLabel = (() => {
    if (!selected) return 'Upgrade';
    if (selected.level >= GAME.maxTowerLevel) return 'Maxed';
    return `Upgrade · ${upgradeCost(selected.kind, selected.level)}`;
  })();

  const selectStats = selected
    ? `${GAME.towers[selected.kind].blurb} · L${selected.level}/${GAME.maxTowerLevel}`
    : '';

  return (
    <View style={styles.tray}>
      <Text style={styles.title}>
        {selectMode
          ? `Selected · ${GAME.towers[selected.kind].displayName} L${selected.level}`
          : themeLantern
            ? 'Plant kindness · lantern light'
            : 'Plant kindness'}
      </Text>

      <Animated.View style={[styles.plantRow, plantRowStyle]}>
        {KINDS.map((k) => {
          const active = !selectMode && state.selectedTower === k;
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={`${GAME.towers[k].displayName}, ${GAME.towers[k].cost} Clarity`}
              accessibilityState={{ selected: active, disabled: selectMode }}
              accessibilityHint="Select this kindness to plant on an empty pad"
              hitSlop={TAP_SLOP}
              disabled={selectMode}
              onPress={() => {
                softHaptic('tap');
                onSelectKind(k);
              }}
              style={[
                styles.plantCard,
                active && styles.plantCardActive,
                selectMode && styles.plantCardLocked,
                themeLantern && !selectMode && { borderColor: LANTERN_RIM[k] },
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
                  themeLantern
                    ? {
                        borderWidth: 2,
                        borderColor: LANTERN_RIM[k],
                      }
                    : null,
                ]}
              />
              <Text style={[styles.plantName, selectMode && styles.dimText]}>
                {GAME.towers[k].displayName}
              </Text>
              <Text style={[styles.plantCost, selectMode && styles.dimText]}>
                {GAME.towers[k].cost}
              </Text>
              {!selectMode && active ? (
                <Text style={styles.plantBlurb} numberOfLines={2}>
                  {GAME.towers[k].blurb}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </Animated.View>

      <Animated.View style={actionStyle} pointerEvents={selectMode ? 'auto' : 'none'}>
        {selectMode ? <Text style={styles.selectStats}>{selectStats}</Text> : null}
        <View style={styles.actionRow}>
          <SoftButton
            label={upgradeLabel}
            onPress={onUpgrade}
            disabled={!selected || selected.level >= GAME.maxTowerLevel}
            style={styles.actionBtn}
          />
          <SoftButton label="Sell 50%" variant="soft" onPress={onSell} style={styles.actionBtn} />
          <SoftButton label="Back" variant="ghost" onPress={onBack} style={styles.backBtn} />
        </View>
      </Animated.View>

      <Animated.View style={plantHintStyle} pointerEvents="none">
        <Text style={styles.hint}>Tap an empty pad to plant · tap a planted thought to upgrade</Text>
      </Animated.View>
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
  plantCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TAP + 28,
    paddingVertical: 12,
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
  plantBlurb: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 12,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  dimText: {
    color: colors.inkSoft,
  },
  selectStats: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 6,
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
