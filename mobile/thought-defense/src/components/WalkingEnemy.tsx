import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { pointOnPath } from '../game/config';
import type { Enemy, EnemyKind } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const ENEMY_COLOR = {
  Doubt: colors.doubt,
  Worry: colors.worry,
  SelfCritic: colors.critic,
} as const;

const ENEMY_LABEL = {
  Doubt: 'Doubt',
  Worry: 'Worry',
  SelfCritic: 'Critic',
} as const;

/** Per-kind silhouette + gait — readable variety without combat-game harshness. */
const KIND_LOOK: Record<
  EnemyKind,
  {
    size: number;
    radius: number;
    bobAmp: number;
    bobMs: number;
    swayAmp: number;
    /** brief hold at end of bob for hesitant Doubt gait */
    pauseMs: number;
  }
> = {
  Doubt: { size: 34, radius: 999, bobAmp: 1.6, bobMs: 520, swayAmp: 0.8, pauseMs: 160 },
  Worry: { size: 28, radius: 999, bobAmp: 3.2, bobMs: 240, swayAmp: 2.6, pauseMs: 0 },
  SelfCritic: { size: 42, radius: 12, bobAmp: 1.1, bobMs: 700, swayAmp: 0.4, pauseMs: 80 },
};

type Props = {
  enemy: Enemy;
  width: number;
  height: number;
  now: number;
};

/** Top-down soft blob that tweens along the path plane + kind-specific walk gait. */
export function WalkingEnemy({ enemy, width, height, now }: Props) {
  const look = KIND_LOOK[enemy.kind];
  const pos = pointOnPath(enemy.pathT);
  const x = useSharedValue(pos.x * width);
  const y = useSharedValue(pos.y * height);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.55);
  const bob = useSharedValue(0);
  const sway = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const duration = reduceMotion ? 0 : 90;
    x.value = withTiming(pos.x * width, {
      duration,
      easing: Easing.linear,
    });
    y.value = withTiming(pos.y * height, {
      duration,
      easing: Easing.linear,
    });
  }, [enemy.pathT, width, height, x, y, pos.x, pos.y, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      bob.value = 0;
      sway.value = 0;
      return;
    }
    opacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.back(1.2)) });

    const half = look.bobMs;
    const pause = look.pauseMs;
    bob.value = withRepeat(
      withSequence(
        withTiming(-look.bobAmp, { duration: half, easing: Easing.inOut(Easing.sin) }),
        ...(pause > 0
          ? [withTiming(-look.bobAmp, { duration: pause, easing: Easing.linear })]
          : []),
        withTiming(look.bobAmp, { duration: half, easing: Easing.inOut(Easing.sin) }),
        ...(pause > 0
          ? [withTiming(look.bobAmp, { duration: pause, easing: Easing.linear })]
          : []),
      ),
      -1,
      false,
    );

    if (look.swayAmp > 0.5) {
      sway.value = withRepeat(
        withSequence(
          withTiming(-look.swayAmp, {
            duration: Math.max(180, half * 0.85),
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(look.swayAmp, {
            duration: Math.max(180, half * 0.85),
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        true,
      );
    } else {
      sway.value = 0;
    }

    return () => {
      cancelAnimation(bob);
      cancelAnimation(sway);
    };
  }, [enemy.id, enemy.kind, opacity, scale, bob, sway, reduceMotion, look]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x.value - look.size / 2 + sway.value,
    top: y.value - look.size / 2 + bob.value,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const age = now - enemy.bornAt;
  const showFlavor = age < 2.4;
  const slowed = now < enemy.slowUntil;

  return (
    <Animated.View
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {enemy.kind === 'Worry' ? <View style={styles.worryHalo} /> : null}
      {enemy.kind === 'Doubt' ? <View style={styles.doubtRing} /> : null}
      {enemy.kind === 'SelfCritic' ? <View style={styles.criticCorner} /> : null}
      <View
        style={[
          styles.blob,
          {
            backgroundColor: ENEMY_COLOR[enemy.kind],
            width: look.size,
            height: look.size,
            borderRadius: look.radius,
            borderColor: slowed ? colors.gratitude : 'rgba(255,255,255,0.45)',
            opacity: slowed ? 0.85 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.hp,
            { width: `${Math.max(10, (enemy.health / enemy.maxHealth) * 100)}%` as `${number}%` },
          ]}
        />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {ENEMY_LABEL[enemy.kind]}
      </Text>
      {showFlavor ? (
        <Text style={styles.flavor} numberOfLines={1}>
          {enemy.flavor}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignSelf: 'center',
  },
  doubtRing: {
    position: 'absolute',
    alignSelf: 'center',
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(110, 101, 120, 0.45)',
    top: -4,
    left: -4,
  },
  worryHalo: {
    position: 'absolute',
    alignSelf: 'center',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(90, 122, 146, 0.55)',
    top: -6,
    right: 2,
  },
  criticCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'rgba(160, 96, 104, 0.55)',
    top: -2,
    left: -2,
    borderRadius: 2,
  },
  hp: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  label: {
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 56,
  },
  flavor: {
    fontFamily: fonts.body,
    fontSize: 8,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 72,
  },
});
