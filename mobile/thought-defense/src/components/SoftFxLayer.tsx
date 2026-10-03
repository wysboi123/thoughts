import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
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
  const isPlant = item.kind === 'plant';

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: reduceMotion ? 0 : isPlant ? 640 : 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [item.id, progress, reduceMotion, isPlant]);

  const style = useAnimatedStyle(() => {
    const grow = isPlant ? 28 : 18;
    const base = isPlant ? 14 : 10;
    return {
      position: 'absolute' as const,
      left: item.x * width - base - progress.value * grow,
      top: item.y * height - base - progress.value * grow,
      width: base * 2 + progress.value * grow * 2,
      height: base * 2 + progress.value * grow * 2,
      borderRadius: 999,
      borderWidth: isPlant ? 2.5 : 2,
      borderColor: item.color ?? colors.affirmation,
      opacity: (isPlant ? 0.65 : 0.55) * (1 - progress.value),
      backgroundColor: isPlant
        ? `${item.color ?? colors.affirmation}22`
        : 'transparent',
    };
  });

  return <Animated.View pointerEvents="none" style={style} />;
}

/** Soft kindness ripples when towers fire / thoughts clear / plant·upgrade. */
export function SoftFxLayer({ fx, width, height, now }: Props) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  const live = fx.filter((f) => now - f.bornAt < (f.kind === 'plant' ? 0.7 : 0.55));
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
