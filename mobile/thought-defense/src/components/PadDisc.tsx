import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  left: number;
  top: number;
  label: string;
  filled: boolean;
  selected: boolean;
  fillColor: string;
  onPress: () => void;
};

/** Top-down plant disc — empty pads breathe softly until occupied. */
export function PadDisc({
  left,
  top,
  label,
  filled,
  selected,
  fillColor,
  onPress,
}: Props) {
  const breath = useSharedValue(1);

  useEffect(() => {
    if (filled) {
      breath.value = withTiming(1, { duration: 200 });
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
    return () => cancelAnimation(breath);
  }, [filled, breath]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: selected ? 1.06 : breath.value }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left, top }, style]}>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          onPress();
        }}
        style={[
          styles.pad,
          {
            borderColor: selected ? colors.brandDeep : filled ? 'rgba(255,255,255,0.7)' : colors.line,
            backgroundColor: filled ? fillColor : 'rgba(255,255,255,0.72)',
            borderWidth: selected ? 3 : 2,
          },
        ]}
      >
        <Text style={styles.padText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pad: {
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
