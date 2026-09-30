import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
}: {
  item: SoftFx;
  width: number;
  height: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
  }, [item.id, progress]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: item.x * width - 10 - progress.value * 18,
    top: item.y * height - 10 - progress.value * 18,
    width: 20 + progress.value * 36,
    height: 20 + progress.value * 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: item.color ?? colors.affirmation,
    opacity: 0.55 * (1 - progress.value),
    backgroundColor: 'transparent',
  }));

  return <Animated.View pointerEvents="none" style={style} />;
}

/** Soft kindness ripples when towers fire / thoughts clear. */
export function SoftFxLayer({ fx, width, height, now }: Props) {
  const live = fx.filter((f) => now - f.bornAt < 0.55);
  return (
    <>
      {live.map((item) => (
        <FxRipple key={item.id} item={item} width={width} height={height} />
      ))}
    </>
  );
}
