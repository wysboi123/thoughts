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
import type { Enemy } from '../game/types';
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

type Props = {
  enemy: Enemy;
  width: number;
  height: number;
  now: number;
};

/** Top-down soft blob that tweens along the path plane + gentle walk bob. */
export function WalkingEnemy({ enemy, width, height, now }: Props) {
  const pos = pointOnPath(enemy.pathT);
  const x = useSharedValue(pos.x * width);
  const y = useSharedValue(pos.y * height);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.55);
  const bob = useSharedValue(0);
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
      return;
    }
    opacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.back(1.2)) });
    bob.value = withRepeat(
      withSequence(
        withTiming(-2.4, { duration: 380, easing: Easing.inOut(Easing.sin) }),
        withTiming(2.4, { duration: 380, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(bob);
    };
  }, [enemy.id, opacity, scale, bob, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x.value - 18,
    top: y.value - 18 + bob.value,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const age = now - enemy.bornAt;
  const showFlavor = age < 2.2;
  const slowed = now < enemy.slowUntil;

  return (
    <Animated.View
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          styles.blob,
          {
            backgroundColor: ENEMY_COLOR[enemy.kind],
            width: enemy.kind === 'SelfCritic' ? 40 : enemy.kind === 'Worry' ? 30 : 34,
            height: enemy.kind === 'SelfCritic' ? 40 : enemy.kind === 'Worry' ? 30 : 34,
            borderRadius: enemy.kind === 'SelfCritic' ? 14 : 999,
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
