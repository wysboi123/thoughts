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
  plant: 1.28,
  shot: 0.78,
  clear: 1.16,
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
    const size = 6 + t.value * 6.5;
    return {
      position: 'absolute' as const,
      left: item.x * width + dx * t.value - size / 2,
      top: item.y * height + dy * t.value - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: accent,
      opacity: 0.92 * (1 - t.value),
      borderWidth: 1.6,
      borderColor: 'rgba(255,255,255,0.68)',
      shadowColor: accent,
      shadowOpacity: 0.54 * (1 - t.value),
      shadowRadius: 6.5,
      shadowOffset: { width: 0, height: 0 },
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
  const mid = useSharedValue(0);
  const halo = useSharedValue(0);
  const wash = useSharedValue(0);
  const spark = useSharedValue(0);
  const isPlant = item.kind === 'plant';
  const isClear = item.kind === 'clear';
  const accent = item.color ?? (isClear ? colors.affirmation : colors.calm);

  useEffect(() => {
    progress.value = 0;
    inner.value = 0;
    mid.value = 0;
    halo.value = 0;
    wash.value = 0;
    spark.value = 0;
    if (reduceMotion) {
      progress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      spark.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      return;
    }
    const outerDur = isPlant ? 1020 : isClear ? 940 : 620;
    progress.value = withTiming(1, {
      duration: outerDur,
      easing: Easing.out(Easing.cubic),
    });
    mid.value = withDelay(
      isPlant ? 50 : 30,
      withTiming(1, {
        duration: outerDur * 0.94,
        easing: Easing.out(Easing.cubic),
      }),
    );
    inner.value = withDelay(
      isPlant ? 90 : 50,
      withTiming(1, {
        duration: outerDur * 0.9,
        easing: Easing.out(Easing.cubic),
      }),
    );
    if (isPlant || isClear) {
      wash.value = withTiming(1, {
        duration: outerDur * 1.28,
        easing: Easing.out(Easing.cubic),
      });
      halo.value = withDelay(
        30,
        withTiming(1, {
          duration: outerDur * 1.22,
          easing: Easing.out(Easing.cubic),
        }),
      );
      spark.value = withTiming(1, {
        duration: 780,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      spark.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [item.id, progress, inner, mid, halo, wash, spark, reduceMotion, isPlant, isClear]);

  const outerStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 44 : isClear ? 36 : 20;
    const base = isPlant ? 14 : isClear ? 13 : 9.5;
    const size = base * 2 + progress.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: isPlant ? 2.8 : isClear ? 2.5 : 2,
      borderColor: accent,
      opacity: (isPlant ? 0.8 : isClear ? 0.72 : 0.58) * (1 - progress.value),
      backgroundColor: isPlant
        ? `${accent}30`
        : isClear
          ? `${accent}20`
          : 'transparent',
    };
  });

  const midStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 30 : isClear ? 24 : 13;
    const base = isPlant ? 10.5 : isClear ? 9 : 7;
    const size = base * 2 + mid.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.8,
      borderColor: `${accent}bb`,
      opacity: (isPlant ? 0.56 : isClear ? 0.5 : 0.42) * (1 - mid.value),
      backgroundColor: isPlant ? `${accent}16` : 'transparent',
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 22 : isClear ? 18 : 10;
    const base = isPlant ? 7 : isClear ? 6 : 5;
    const size = base * 2 + inner.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.6,
      borderColor: `${accent}ee`,
      opacity: (isPlant ? 0.62 : 0.52) * (1 - inner.value),
      backgroundColor: isClear ? `${accent}2a` : 'transparent',
    };
  });

  const washStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 76 : 60;
    const size = 32 + wash.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.1,
      borderColor: `${accent}42`,
      opacity: 0.36 * (1 - wash.value),
      backgroundColor: `${accent}0e`,
    };
  });

  const haloStyle = useAnimatedStyle(() => {
    const grow = isPlant ? 68 : 56;
    const size = 28 + halo.value * grow * 2;
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: `${accent}7a`,
      opacity: 0.48 * (1 - halo.value),
      backgroundColor: `${accent}14`,
    };
  });

  const sparkStyle = useAnimatedStyle(() => {
    const size = (isPlant ? 15 : 12) * (0.55 + spark.value * 0.76);
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: accent,
      opacity: 0.98 * (1 - spark.value * 0.78),
      transform: [{ scale: 0.64 + spark.value * 0.68 }],
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.72)',
      shadowColor: accent,
      shadowOpacity: 0.6 * (1 - spark.value),
      shadowRadius: 7.5,
      shadowOffset: { width: 0, height: 0 },
    };
  });

  const sparkHaloStyle = useAnimatedStyle(() => {
    const size = (isPlant ? 26 : 20) * (0.5 + spark.value * 0.96);
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      borderWidth: 1.4,
      borderColor: `${accent}aa`,
      opacity: 0.6 * (1 - spark.value),
      backgroundColor: `${accent}1c`,
    };
  });

  const sparkCoreStyle = useAnimatedStyle(() => {
    const size = (isPlant ? 7.5 : 6) * (0.8 + spark.value * 0.48);
    return {
      position: 'absolute' as const,
      left: item.x * width - size / 2,
      top: item.y * height - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.86)',
      opacity: 0.94 * (1 - spark.value * 0.86),
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      {!reduceMotion && (isPlant || isClear) ? <Animated.View style={washStyle} /> : null}
      {!reduceMotion && (isPlant || isClear) ? <Animated.View style={haloStyle} /> : null}
      <Animated.View style={outerStyle} />
      {!reduceMotion ? <Animated.View style={midStyle} /> : null}
      {!reduceMotion ? <Animated.View style={innerStyle} /> : null}
      {isClear || isPlant || !reduceMotion ? <Animated.View style={sparkHaloStyle} /> : null}
      {isClear || isPlant || !reduceMotion ? <Animated.View style={sparkStyle} /> : null}
      {isClear || isPlant || !reduceMotion ? <Animated.View style={sparkCoreStyle} /> : null}
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
            accent={accent}
            dx={6}
            dy={12}
            delay={120}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={-8}
            dy={14}
            delay={150}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={16}
            dy={6}
            delay={180}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={-16}
            dy={2}
            delay={210}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={2}
            dy={-16}
            delay={240}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={-4}
            dy={18}
            delay={270}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={12}
            dy={-14}
            delay={300}
            reduceMotion={reduceMotion}
          />
        </>
      ) : null}
      {!reduceMotion && !isPlant && !isClear ? (
        <>
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={10}
            dy={-6}
            delay={30}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={-8}
            dy={8}
            delay={80}
            reduceMotion={reduceMotion}
          />
          <SoftMote
            item={item}
            width={width}
            height={height}
            accent={accent}
            dx={4}
            dy={-12}
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
