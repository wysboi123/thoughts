import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../a11y/useReducedMotion';
import type { SoftFx } from '../game/types';
import { colors } from '../theme/colors';

type Props = {
  fx: SoftFx[];
  width: number;
  height: number;
  now: number;
};

const LIFE = {
  plant: 0.88,
  shot: 0.52,
  clear: 0.78,
} as const;

function SoftMote({
  item,
  width,
  height,
  accent,
  dx,
  dy,
  delay,
  reduceMotion,
}: {
  item: SoftFx;
  width: number;
  height: number;
  accent: string;
  dx: number;
  dy: number;
  delay: number;
  reduceMotion: boolean;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    if (reduceMotion) {
      t.value = withTiming(1, { duration: 160 });
      return;
    }
    t.value = withDelay(
      delay,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }),
    );
  }, [item.id, t, delay, reduceMotion]);

  const style = useAnimatedStyle(() => {
    const size = 4 + t.value * 3;
    return {
      position: 'absolute' as const,
      left: item.x * width + dx * t.value - size / 2,
      top: item.y * height + dy * t.value - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: accent,
      opacity: 0.7 * (1 - t.value),
    };
  });

  return <Animated.View style={style} />;
}

function FxRipple({
  item,
  width,
  height,
  reduceMotion,
}: {
  item: SoftFx;
  width: number;
  height: number;
  reduceMotion: boolean;
}) {
  const progress = useSharedValue(0);
  const inner = useSharedValue(0);
  const halo = useSharedValue(0);
  const spark = useSharedValue(0);
  const isPlant = item.kind === 'plant';
  const isClear = item.kind === 'clear';
  const accent = item.color ?? (isClear ? colors.affirmation : colors.calm);

  useEffect(() => {
    progress.value = 0;
    inner.value = 0;
    halo.value = 0;
    spark.value = 0;
    if (reduceMotion) {
      progress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      spark.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      return;
    }
    const outerDur = isPlant ? 780 : isClear ? 720 : 500;
    progress.value = withTiming(1, {
      duration: outerDur,
      easing: Easing.out(Easing.cubic),
    });
    inner.value = withDelay(
      isPlant ? 80 : 40,
      withTiming(1, {
        duration: outerDur * 0.85,
        easing: Easing.out(Easing.cubic),
      }),
    );
    if (isPlant || isClear) {
      halo.value = withDelay(
        30,
        withTiming(1, {
          duration: outerDur * 1.05,
          easing: Easing.out(Easing.cubic),
        }),
      );
      spark.value = withTiming(1, {
        duration: 560,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [item.id, progress, inner, halo, spark, reduceMotion, isPlant, isClear]);

  const outerStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 36 : isClear ? 28 : 16;
    const base = isPlant ? 12 : isClear ? 11 : 8;
    const size = base * 2 + progress.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: isPlant ? 2.5 : isClear ? 2.2 : 1.8,
      borderColor: accent,
      opacity: (isPlant ? 0.72 : isClear ? 0.64 : 0.5) * (1 - progress.value),
      backgroundColor: isPlant
        ? `${accent}28`
        : isClear
          ? `${accent}18`
          : 'transparent',
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 18 : isClear ? 14 : 8;
    const base = isPlant ? 6 : isClear ? 5 : 4;
    const size = base * 2 + inner.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.4,
      borderColor: `${accent}cc`,
      opacity: (isPlant ? 0.55 : 0.45) * (1 - inner.value),
      backgroundColor: isClear ? `${accent}22` : 'transparent',
    };
  });

  const haloStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 48 : 38;
    const size = 20 + halo.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${accent}66`,
      opacity: 0.35 * (1 - halo.value),
      backgroundColor: 'transparent',
    };
  });

  const sparkStyle = useAnimatedStyle(() => {
    const size = (isPlant ? 11 : 8) * (0.55 + spark.value * 0.7);
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: accent,
      opacity: 0.88 * (1 - spark.value * 0.85),
      transform: [{ scale: 0.7 + spark.value * 0.55 }],
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      {!reduceMotion && (isPlant || isClear) ? <Animated.View style={haloStyle} /> : null}
      <Animated.View style={outerStyle} />
      {!reduceMotion ? <Animated.View style={innerStyle} /> : null}
      {isClear || isPlant ? <Animated.View style={sparkStyle} /> : null}
      {!reduceMotion && (isPlant || isClear) ? (
        <>
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={14}
            dy={-10}
            delay={40}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={-12}
            dy={-8}
            delay={90}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={`${accent}`}
            dx={6}
            dy={12}
            delay={120}
            reduceMotion={reduceMotion}
          />
        </>
      ) : null}
    </View>
  );
}

/** Soft kindness ripples when towers fire / thoughts clear / plant·upgrade. */
export function SoftFxLayer({ fx, width, height, now }: Props) {
  const reduceMotion = useReducedMotion();
  const live = fx.filter((f) => now - f.bornAt < LIFE[f.kind]);

  // Reduce Motion: still show a brief soft flash so plant/clear stay readable.
  return (
    <>
      {live.map((item) => (
        <FxRipple
          key={item.id}
          item={item}
          width={width}
          height={height}
          reduceMotion={reduceMotion}
        />
      ))}
    </>
  );
}
