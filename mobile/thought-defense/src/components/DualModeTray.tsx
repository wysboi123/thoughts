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

const KIND_ACCENT: Record<TowerKind, string> = {
  Affirmation: colors.affirmation,
  Gratitude: colors.gratitude,
  Humor: colors.humor,
};

type Props = {
  state: GameState;
  onSelectKind: (kind: TowerKind) => void;
  onUpgrade: () => void;
  onSell: () => void;
  onBack: () => void;
  /** Lantern Towers look — plant card swatches get soft lantern rims */
  themeLantern?: boolean;
  themeDawn?: boolean;
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
  themeDawn,
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
    maxHeight: interpolate(mode.value, [0, 1], [0, 112]),
    transform: [{ translateY: interpolate(mode.value, [0, 1], [8, 0]) }],
    overflow: 'hidden' as const,
  }));

  const upgradeLabel = (() => {
    if (!selected) return 'Upgrade';
    if (selected.level >= GAME.maxTowerLevel) return 'Maxed';
    return `Upgrade · ${upgradeCost(selected.kind, selected.level)}`;
  })();

  const selectAccent = selected ? KIND_ACCENT[selected.kind] : colors.brand;
  const selectStats = selected
    ? `${GAME.towers[selected.kind].blurb} · L${selected.level}/${GAME.maxTowerLevel}`
    : '';

  return (
    <View
      style={[
        styles.tray,
        themeDawn ? styles.trayDawn : null,
        selectMode ? { borderColor: `${selectAccent}66` } : null,
      ]}
    >
      <View style={styles.titleRow}>
        <View
          style={[
            styles.modeChip,
            {
              backgroundColor: selectMode ? `${selectAccent}22` : 'rgba(63,111,98,0.12)',
              borderColor: selectMode ? `${selectAccent}55` : 'rgba(63,111,98,0.22)',
            },
          ]}
        >
          <Text
            style={[
              styles.modeChipText,
              { color: selectMode ? selectAccent : colors.brand },
            ]}
          >
            {selectMode ? 'Selected' : 'Plant'}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {selectMode
            ? `${GAME.towers[selected.kind].displayName} · L${selected.level}`
            : themeLantern
              ? 'Plant kindness · lantern light'
              : 'Plant kindness'}
        </Text>
      </View>

      <Animated.View style={[styles.plantRow, plantRowStyle]}>
        {KINDS.map((k) => {
          const active = !selectMode && state.selectedTower === k;
          const cost = GAME.towers[k].cost;
          const canAfford = state.clarity >= cost;
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={`${GAME.towers[k].displayName}, ${cost} Clarity${
                canAfford ? '' : ', need more Clarity'
              }`}
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
                active && { borderColor: KIND_ACCENT[k] },
                selectMode && styles.plantCardLocked,
                themeLantern && !selectMode && { borderColor: LANTERN_RIM[k] },
                !selectMode && !canAfford && styles.plantCardSoft,
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: KIND_ACCENT[k] },
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
              <Text
                style={[
                  styles.plantCost,
                  selectMode && styles.dimText,
                  !canAfford && !selectMode && styles.plantCostLow,
                ]}
              >
                {cost} Clarity
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
        {selectMode ? (
          <View style={[styles.selectBanner, { borderColor: `${selectAccent}55` }]}>
            <View style={[styles.selectDot, { backgroundColor: selectAccent }]} />
            <Text style={styles.selectStats}>{selectStats}</Text>
          </View>
        ) : null}
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
  trayDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.78)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
    flexShrink: 1,
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
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  plantCardLocked: {
    borderColor: 'transparent',
  },
  plantCardSoft: {
    opacity: 0.72,
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
  plantCostLow: {
    color: colors.inkSoft,
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
  selectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginBottom: 6,
  },
  selectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectStats: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    flex: 1,
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
