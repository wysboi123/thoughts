import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GAME, pointOnPath, upgradeCost } from '../game/config';
import type { GameState, TowerKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  state: GameState;
  width: number;
  height: number;
  onPad: (index: number) => void;
  themeDawn?: boolean;
};

const TOWER_COLOR: Record<TowerKind, string> = {
  Affirmation: colors.affirmation,
  Gratitude: colors.gratitude,
  Humor: colors.humor,
};

const ENEMY_COLOR = {
  Doubt: colors.doubt,
  Worry: colors.worry,
  SelfCritic: colors.critic,
} as const;

export function GameBoard({ state, width, height, onPad, themeDawn }: Props) {
  const pathPoints = useMemo(
    () =>
      GAME.path.map((p) => ({
        left: p.x * width - 6,
        top: p.y * height - 6,
      })),
    [width, height],
  );

  return (
    <View style={[styles.board, { width, height }]}>
      {/* Path ribbon */}
      {GAME.path.slice(0, -1).map((a, i) => {
        const b = GAME.path[i + 1];
        const x1 = a.x * width;
        const y1 = a.y * height;
        const x2 = b.x * width;
        const y2 = b.y * height;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        return (
          <View
            key={`seg-${i}`}
            style={[
              styles.seg,
              {
                width: len,
                left: x1,
                top: y1 - 10,
                backgroundColor: themeDawn ? '#E8C9A0' : colors.path,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
      {pathPoints.map((p, i) => (
        <View
          key={`pt-${i}`}
          style={[
            styles.pathDot,
            { left: p.left, top: p.top, backgroundColor: themeDawn ? '#F0D4A8' : colors.pathEdge },
          ]}
        />
      ))}

      {/* Peace Core */}
      <View
        style={[
          styles.core,
          {
            left: GAME.path[GAME.path.length - 1].x * width - 28,
            top: GAME.path[GAME.path.length - 1].y * height - 28,
            backgroundColor: themeDawn ? colors.coreGlow : colors.core,
          },
        ]}
      >
        <Text style={styles.coreLabel}>Peace</Text>
      </View>

      {/* Pads + towers */}
      {GAME.pads.map((pad, i) => {
        const tower = state.towers.find((t) => t.padIndex === i);
        const selected = state.selectedPad === i;
        return (
          <Pressable
            key={`pad-${i}`}
            onPress={() => onPad(i)}
            style={[
              styles.pad,
              {
                left: pad.x * width - 22,
                top: pad.y * height - 22,
                borderColor: selected ? colors.brand : colors.line,
                backgroundColor: tower
                  ? TOWER_COLOR[tower.kind]
                  : 'rgba(255,255,255,0.5)',
              },
            ]}
          >
            <Text style={styles.padText}>
              {tower ? `L${tower.level}` : '+'}
            </Text>
          </Pressable>
        );
      })}

      {/* Enemies */}
      {state.enemies.map((e) => {
        const pos = pointOnPath(e.pathT);
        return (
          <View
            key={e.id}
            style={[
              styles.enemy,
              {
                left: pos.x * width - 14,
                top: pos.y * height - 14,
                backgroundColor: ENEMY_COLOR[e.kind],
              },
            ]}
          >
            <View
              style={[
                styles.hp,
                { width: `${Math.max(8, (e.health / e.maxHealth) * 100)}%` as `${number}%` },
              ]}
            />
          </View>
        );
      })}

      {state.selectedPad != null &&
        (() => {
          const tower = state.towers.find((t) => t.padIndex === state.selectedPad);
          if (!tower) return null;
          const cost =
            tower.level < GAME.maxTowerLevel
              ? upgradeCost(tower.kind, tower.level)
              : null;
          return (
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                {GAME.towers[tower.kind].displayName} L{tower.level}
                {cost != null ? ` · upgrade ${cost}` : ' · max'}
              </Text>
            </View>
          );
        })()}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  seg: {
    position: 'absolute',
    height: 20,
    borderRadius: 10,
    transformOrigin: 'left center',
  },
  pathDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  core: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  coreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brandDeep,
  },
  pad: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  padText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
  },
  enemy: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  hp: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  tip: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceStrong,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
