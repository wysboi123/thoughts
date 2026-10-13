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
  const enter = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    mode.value = withTiming(selectMode ? 1 : 0, {
      duration: reduceMotion ? 0 : 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectMode, mode, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    enter.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
  }, [enter, reduceMotion]);

  const trayEnterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 8 }],
  }));

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
    maxHeight: interpolate(mode.value, [0, 1], [0, 132]),
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
    <Animated.View
      style={[
        styles.tray,
        themeDawn ? styles.trayDawn : null,
        selectMode ? { borderColor: `${selectAccent}66` } : null,
        trayEnterStyle,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.accentBar,
          { backgroundColor: selectMode ? selectAccent : colors.brand },
        ]}
      />
      <View pointerEvents="none" style={styles.topSheen} />
      <View
        pointerEvents="none"
        style={[
          styles.cornerOrb,
          {
            backgroundColor: selectMode ? `${selectAccent}14` : `${colors.brand}12`,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bottomWash,
          {
            backgroundColor: selectMode ? `${selectAccent}10` : `${colors.brand}0C`,
          },
        ]}
      />
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
          <View pointerEvents="none" style={styles.modeChipSheen} />
          <View
            style={[
              styles.modeDot,
              { backgroundColor: selectMode ? selectAccent : colors.brand },
            ]}
          />
          <Text
            style={[
              styles.modeChipText,
              { color: selectMode ? selectAccent : colors.brand },
            ]}
          >
            {selectMode ? 'Selected' : 'Plant'}
          </Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            {selectMode
              ? `${GAME.towers[selected.kind].displayName} · L${selected.level}`
              : themeLantern
                ? 'Plant kindness · lantern light'
                : 'Plant kindness'}
          </Text>
          <Text
            style={[
              styles.modeHint,
              { color: selectMode ? selectAccent : colors.brand },
            ]}
          >
            {selectMode ? 'Hold gently · draft locked' : 'Soft plant · no rush'}
          </Text>
        </View>
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
                pointerEvents="none"
                style={[
                  styles.cardSheen,
                  {
                    backgroundColor: active
                      ? `${KIND_ACCENT[k]}18`
                      : 'rgba(255,255,255,0.28)',
                  },
                ]}
              />
              {active ? (
                <View
                  pointerEvents="none"
                  style={[styles.cardTopAccent, { backgroundColor: KIND_ACCENT[k] }]}
                />
              ) : null}
              {active ? (
                <View
                  pointerEvents="none"
                  style={[styles.cardGlow, { backgroundColor: `${KIND_ACCENT[k]}22` }]}
                />
              ) : null}
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
              >
                <View
                  pointerEvents="none"
                  style={[styles.swatchRing, { borderColor: `${KIND_ACCENT[k]}66` }]}
                />
              </View>
              <Text style={[styles.plantName, selectMode && styles.dimText]}>
                {GAME.towers[k].displayName}
              </Text>
              <View
                style={[
                  styles.costChip,
                  !canAfford && !selectMode ? styles.costChipLow : null,
                ]}
              >
                <View pointerEvents="none" style={styles.chipSheen} />
                <Text
                  style={[
                    styles.plantCost,
                    selectMode && styles.dimText,
                    !canAfford && !selectMode && styles.plantCostLow,
                  ]}
                >
                  {cost} Clarity
                </Text>
              </View>
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
            <View
              pointerEvents="none"
              style={[styles.selectBannerSheen, { backgroundColor: `${selectAccent}14` }]}
            />
            <View
              pointerEvents="none"
              style={[styles.selectBannerGlow, { backgroundColor: `${selectAccent}18` }]}
            />
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
        <View style={styles.hintChip}>
          <View pointerEvents="none" style={styles.chipSheen} />
          <Text style={styles.hint}>
            Tap an empty pad to plant · tap a planted thought to upgrade
          </Text>
        </View>
      </Animated.View>

      <View style={styles.footer} accessibilityRole="text">
        <View
          style={[
            styles.footerBadge,
            {
              backgroundColor: selectMode ? `${selectAccent}14` : `${colors.brand}14`,
              borderColor: selectMode ? `${selectAccent}33` : `${colors.brand}33`,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.chipSheen} />
          <View
            style={[
              styles.footerDot,
              { backgroundColor: selectMode ? selectAccent : colors.brand },
            ]}
          />
          <Text style={styles.footerLabel}>Draft C tray</Text>
        </View>
        <View style={styles.footerHintChip}>
          <View pointerEvents="none" style={styles.chipSheen} />
          <Text style={styles.footerHint}>
            {selectMode ? 'Upgrade · Sell · Back' : 'Plant · dim on select'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tray: {
    marginTop: 8,
    padding: 12,
    paddingTop: 14,
    borderRadius: 22,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  trayDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.78)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
    zIndex: 2,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cornerOrb: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    right: -20,
    top: 40,
  },
  bottomWash: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 6,
    height: 36,
    borderRadius: 16,
  },
  chipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modeChipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  titleCol: {
    flexShrink: 1,
    gap: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
  },
  modeHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.2,
    opacity: 0.9,
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
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  cardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
  cardGlow: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 4,
    height: 14,
    borderRadius: 10,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    opacity: 0.7,
  },
  plantName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  costChip: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(106,158,174,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(106,158,174,0.22)',
    overflow: 'hidden',
  },
  costChipLow: {
    backgroundColor: 'rgba(36,58,52,0.06)',
    borderColor: 'rgba(36,58,52,0.1)',
  },
  plantCost: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.clarity,
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
    overflow: 'hidden',
  },
  selectBannerSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  selectBannerGlow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 0,
    height: 8,
    borderRadius: 6,
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
  hintChip: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(36,58,52,0.1)',
    overflow: 'hidden',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 2,
    gap: 8,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.7,
  },
  footerLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.inkSoft,
    letterSpacing: 0.2,
  },
  footerHintChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(36,58,52,0.1)',
    overflow: 'hidden',
  },
  footerHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
    opacity: 0.9,
  },
});
