import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { GAME, towerRange } from '../game/config';
import type { GameState, TowerKind } from '../game/types';
import { LANTERN_RIM } from '../iap/cosmetics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { PadDisc } from './PadDisc';
import { PeaceCore } from './PeaceCore';
import { SoftFxLayer } from './SoftFxLayer';
import { WalkingEnemy } from './WalkingEnemy';

type Props = {
  state: GameState;
  width: number;
  height: number;
  onPad: (index: number) => void;
  onBackground?: () => void;
  themeDawn?: boolean;
  /** Lantern Towers pack / Pass — tower discs get soft lantern rims */
  themeLantern?: boolean;
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

const LANTERN_FILL: Record<TowerKind, string> = {
  Affirmation: '#7BC4A0',
  Gratitude: '#D4B46A',
  Humor: '#E89878',
};

function SoftRangeRing({
  left,
  top,
  size,
  color,
  firing,
  reduceMotion,
}: {
  left: number;
  top: number;
  size: number;
  color: string;
  firing: boolean;
  reduceMotion: boolean;
}) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      glow.value = firing ? 0.5 : 0.3;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(firing ? 0.62 : 0.42, {
          duration: firing ? 320 : 1100,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(firing ? 0.38 : 0.22, {
          duration: firing ? 320 : 1100,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [pulse, glow, firing, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.rangeRing,
        {
          left,
          top,
          width: size,
          height: size,
          borderColor: color,
          backgroundColor: `${color}12`,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.rangeRingOuter,
          {
            borderColor: `${color}55`,
            backgroundColor: `${color}08`,
          },
        ]}
      />
    </Animated.View>
  );
}

function SoftEntrance({
  left,
  top,
  dawn,
  reduceMotion,
}: {
  left: number;
  top: number;
  dawn?: boolean;
  reduceMotion: boolean;
}) {
  const breath = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [breath, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: 0.75 + (breath.value - 1) * 2,
  }));

  return (
    <Animated.View
      style={[
        styles.entrance,
        dawn ? styles.entranceDawn : null,
        { left, top },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.entranceHalo, dawn ? styles.entranceHaloDawn : null]}
      />
      <View style={[styles.entranceDot, dawn ? styles.entranceDotDawn : null]} />
      <Text style={[styles.entranceText, dawn ? styles.entranceTextDawn : null]}>in</Text>
    </Animated.View>
  );
}

/** True top-down / plan-view mindscape — pads & towers as discs, path as corridors. */
export function GameBoard({
  state,
  width,
  height,
  onPad,
  onBackground,
  themeDawn,
  themeLantern,
}: Props) {
  const reduceMotion = useReducedMotion();
  const pathColor = themeDawn ? '#E8C9A0' : colors.path;
  const pathEdge = themeDawn ? '#F0D4A8' : colors.pathEdge;
  const pathGlow = themeDawn ? 'rgba(232, 201, 160, 0.35)' : 'rgba(91, 138, 122, 0.28)';
  const ground = themeDawn ? 'rgba(232, 201, 160, 0.18)' : 'rgba(91, 138, 122, 0.12)';
  const selectedTower = state.towers.find((t) => t.padIndex === state.selectedPad);
  const boardMin = Math.min(width, height);
  const firing =
    !!selectedTower && state.elapsed - selectedTower.lastFiredAt < 0.25;

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
          glow: {
            left: left - 4,
            top: top - 4,
            width: Math.abs(x2 - x1) + 36,
            height: 36,
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
        glow: {
          left: left - 4,
          top: top - 4,
          width: 36,
          height: Math.abs(y2 - y1) + 36,
        },
      };
    });
  }, [width, height]);

  return (
    <Pressable
      onPress={onBackground}
      style={[
        styles.board,
        themeDawn ? styles.boardDawn : null,
        { width, height, backgroundColor: ground },
      ]}
    >
      <View style={[styles.chip, styles.legendChip, themeDawn ? styles.chipDawn : null]}>
        <View style={[styles.chipDot, themeDawn ? styles.chipDotDawn : null]} />
        <Text style={styles.legend}>path → Peace · discs = thoughts</Text>
      </View>
      <View style={[styles.chip, styles.compassChip, themeDawn ? styles.chipDawn : null]}>
        <View style={[styles.chipDot, themeDawn ? styles.chipDotDawn : null]} />
        <Text style={styles.compass}>plan · N ↑</Text>
      </View>
      <View pointerEvents="none" style={[styles.boardRim, themeDawn ? styles.boardRimDawn : null]} />

      {/* Soft lawn tiles (top-down grid hint) */}
      {[0.2, 0.4, 0.6, 0.8].map((gx) =>
        [0.2, 0.4, 0.6, 0.8].map((gy) => (
          <View
            key={`g-${gx}-${gy}`}
            style={[
              styles.lawn,
              themeDawn ? styles.lawnDawn : null,
              {
                left: gx * width - 10,
                top: gy * height - 10,
              },
            ]}
          />
        )),
      )}

      {/* Soft path glow under corridors */}
      {segments.map((seg) => (
        <View
          key={`glow-${seg.key}`}
          style={[styles.corridorGlow, seg.glow, { backgroundColor: pathGlow }]}
        />
      ))}

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
              borderColor: themeDawn ? 'rgba(255,236,200,0.9)' : 'rgba(255,255,255,0.65)',
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.nodeRing,
              {
                borderColor: themeDawn ? 'rgba(232, 201, 160, 0.45)' : 'rgba(91, 138, 122, 0.35)',
              },
            ]}
          />
        </View>
      ))}

      {/* Entrance marker */}
      <SoftEntrance
        left={GAME.path[0].x * width - 22}
        top={GAME.path[0].y * height - 22}
        dawn={themeDawn}
        reduceMotion={reduceMotion}
      />

      <PeaceCore
        left={GAME.path[GAME.path.length - 1].x * width - 36}
        top={GAME.path[GAME.path.length - 1].y * height - 36}
        themeDawn={themeDawn}
        stressed={state.calm <= 5}
      />

      {/* Selected tower range ring (Draft C select mode cue) */}
      {selectedTower ? (
        <SoftRangeRing
          left={
            GAME.pads[selectedTower.padIndex].x * width -
            towerRange(selectedTower.kind, selectedTower.level) * boardMin
          }
          top={
            GAME.pads[selectedTower.padIndex].y * height -
            towerRange(selectedTower.kind, selectedTower.level) * boardMin
          }
          size={towerRange(selectedTower.kind, selectedTower.level) * boardMin * 2}
          color={TOWER_COLOR[selectedTower.kind]}
          firing={firing}
          reduceMotion={reduceMotion}
        />
      ) : null}

      {/* Pads / towers as top-down discs */}
      {GAME.pads.map((pad, i) => {
        const tower = state.towers.find((t) => t.padIndex === i);
        const selected = state.selectedPad === i;
        const pulseAt =
          state.padPulse?.padIndex === i ? state.padPulse.at : null;
        return (
          <PadDisc
            key={`pad-${i}`}
            left={pad.x * width - 24}
            top={pad.y * height - 24}
            label={tower ? `${TOWER_GLYPH[tower.kind]}${tower.level}` : '+'}
            filled={!!tower}
            selected={selected}
            fillColor={
              tower
                ? themeLantern
                  ? LANTERN_FILL[tower.kind]
                  : TOWER_COLOR[tower.kind]
                : 'rgba(255,255,255,0.72)'
            }
            lantern={!!tower && !!themeLantern}
            lanternRim={tower && themeLantern ? LANTERN_RIM[tower.kind] : undefined}
            dawn={themeDawn}
            pulseAt={pulseAt}
            now={state.elapsed}
            onPress={() => onPad(i)}
          />
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

      <SoftFxLayer fx={state.fx} width={width} height={height} now={state.elapsed} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#243A34',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  boardDawn: {
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  boardRim: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    zIndex: 1,
  },
  boardRimDawn: {
    borderColor: 'rgba(255, 244, 220, 0.4)',
  },
  chip: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#243A34',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.72)',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  chipDotDawn: {
    backgroundColor: '#C9A85A',
  },
  legendChip: {
    top: 8,
    left: 10,
    maxWidth: '52%',
  },
  compassChip: {
    top: 8,
    right: 10,
  },
  compass: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
  },
  legend: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.inkSoft,
    flexShrink: 1,
  },
  lawn: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lawnDawn: {
    backgroundColor: 'rgba(255, 236, 210, 0.28)',
    borderColor: 'rgba(232, 201, 160, 0.2)',
  },
  corridorGlow: {
    position: 'absolute',
    borderRadius: 18,
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    opacity: 0.7,
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
    gap: 1,
  },
  entranceDawn: {
    borderColor: 'rgba(180, 140, 90, 0.75)',
    backgroundColor: 'rgba(232, 201, 160, 0.22)',
  },
  entranceHalo: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(90, 122, 146, 0.28)',
    backgroundColor: 'rgba(90, 122, 146, 0.06)',
  },
  entranceHaloDawn: {
    borderColor: 'rgba(201, 168, 90, 0.35)',
    backgroundColor: 'rgba(232, 201, 160, 0.1)',
  },
  entranceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.worry,
    opacity: 0.7,
  },
  entranceDotDawn: {
    backgroundColor: colors.gratitude,
  },
  entranceText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.worry,
  },
  entranceTextDawn: {
    color: colors.gratitude,
  },
  rangeRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRingOuter: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    borderWidth: 1,
    transform: [{ scale: 1.08 }],
  },
});
