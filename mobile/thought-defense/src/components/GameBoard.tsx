import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GAME } from '../game/config';
import type { GameState, TowerKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { WalkingEnemy } from './WalkingEnemy';

type Props = {
  state: GameState;
  width: number;
  height: number;
  onPad: (index: number) => void;
  onBackground?: () => void;
  themeDawn?: boolean;
};

const TOWER_COLOR: Record<TowerKind, string> = {
  Affirmation: colors.affirmation,
  Gratitude: colors.gratitude,
  Humor: colors.humor,
};

const TOWER_GLYPH: Record<TowerKind, string> = {
  Affirmation: 'A',
  Gratitude: 'G',
  Humor: 'H',
};

/** True top-down / plan-view mindscape — pads & towers as discs, path as corridors. */
export function GameBoard({
  state,
  width,
  height,
  onPad,
  onBackground,
  themeDawn,
}: Props) {
  const pathColor = themeDawn ? '#E8C9A0' : colors.path;
  const pathEdge = themeDawn ? '#F0D4A8' : colors.pathEdge;
  const ground = themeDawn ? 'rgba(232, 201, 160, 0.18)' : 'rgba(91, 138, 122, 0.12)';

  const segments = useMemo(() => {
    return GAME.path.slice(0, -1).map((a, i) => {
      const b = GAME.path[i + 1];
      const x1 = a.x * width;
      const y1 = a.y * height;
      const x2 = b.x * width;
      const y2 = b.y * height;
      const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
      if (horizontal) {
        const left = Math.min(x1, x2);
        const top = y1 - 14;
        return {
          key: `h-${i}`,
          style: {
            left,
            top,
            width: Math.abs(x2 - x1) + 28,
            height: 28,
          },
        };
      }
      const left = x1 - 14;
      const top = Math.min(y1, y2);
      return {
        key: `v-${i}`,
        style: {
          left,
          top,
          width: 28,
          height: Math.abs(y2 - y1) + 28,
        },
      };
    });
  }, [width, height]);

  return (
    <Pressable
      onPress={onBackground}
      style={[styles.board, { width, height, backgroundColor: ground }]}
    >
      <Text style={styles.compass}>N ↑ · plan view</Text>

      {/* Soft lawn tiles (top-down grid hint) */}
      {[0.2, 0.4, 0.6, 0.8].map((gx) =>
        [0.2, 0.4, 0.6, 0.8].map((gy) => (
          <View
            key={`g-${gx}-${gy}`}
            style={[
              styles.lawn,
              {
                left: gx * width - 10,
                top: gy * height - 10,
              },
            ]}
          />
        )),
      )}

      {/* Path corridors — axis-aligned for clear top-down read */}
      {segments.map((seg) => (
        <View
          key={seg.key}
          style={[styles.corridor, seg.style, { backgroundColor: pathColor }]}
        />
      ))}
      {GAME.path.map((p, i) => (
        <View
          key={`node-${i}`}
          style={[
            styles.node,
            {
              left: p.x * width - 8,
              top: p.y * height - 8,
              backgroundColor: pathEdge,
            },
          ]}
        />
      ))}

      {/* Entrance marker */}
      <View
        style={[
          styles.entrance,
          {
            left: GAME.path[0].x * width - 22,
            top: GAME.path[0].y * height - 22,
          },
        ]}
      >
        <Text style={styles.entranceText}>in</Text>
      </View>

      {/* Peace Core — circular glow from above */}
      <View
        style={[
          styles.coreRing,
          {
            left: GAME.path[GAME.path.length - 1].x * width - 36,
            top: GAME.path[GAME.path.length - 1].y * height - 36,
            backgroundColor: themeDawn ? colors.coreGlow : colors.core,
          },
        ]}
      >
        <View style={styles.coreInner}>
          <Text style={styles.coreLabel}>Peace</Text>
        </View>
      </View>

      {/* Pads / towers as top-down discs */}
      {GAME.pads.map((pad, i) => {
        const tower = state.towers.find((t) => t.padIndex === i);
        const selected = state.selectedPad === i;
        return (
          <Pressable
            key={`pad-${i}`}
            onPress={(e) => {
              e.stopPropagation?.();
              onPad(i);
            }}
            style={[
              styles.pad,
              {
                left: pad.x * width - 24,
                top: pad.y * height - 24,
                borderColor: selected ? colors.brandDeep : tower ? 'rgba(255,255,255,0.7)' : colors.line,
                backgroundColor: tower ? TOWER_COLOR[tower.kind] : 'rgba(255,255,255,0.72)',
                borderWidth: selected ? 3 : 2,
              },
            ]}
          >
            <Text style={styles.padText}>
              {tower ? `${TOWER_GLYPH[tower.kind]}${tower.level}` : '+'}
            </Text>
          </Pressable>
        );
      })}

      {/* Walking thoughts */}
      {state.enemies.map((e) => (
        <WalkingEnemy
          key={e.id}
          enemy={e}
          width={width}
          height={height}
          now={state.elapsed}
        />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  compass: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
    zIndex: 2,
  },
  lawn: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  corridor: {
    position: 'absolute',
    borderRadius: 14,
  },
  node: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  entrance: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.worry,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90, 122, 146, 0.15)',
  },
  entranceText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.worry,
  },
  coreRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  coreInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brandDeep,
  },
  pad: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
  },
});
