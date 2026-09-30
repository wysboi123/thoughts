import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
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
  themeDawn?: boolean;
  stressed?: boolean;
};

/** Top-down Peace Core with soft halo breath. */
export function PeaceCore({ left, top, themeDawn, stressed }: Props) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: stressed ? 700 : 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: stressed ? 700 : 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse, glow, stressed]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + glow.value * 0.4,
  }));

  return (
    <View style={[styles.wrap, { left, top }]}>
      <Animated.View
        style={[
          styles.halo,
          ringStyle,
          { backgroundColor: themeDawn ? colors.coreGlow : colors.core },
        ]}
      />
      <View
        style={[
          styles.coreRing,
          {
            backgroundColor: themeDawn ? colors.coreGlow : colors.core,
            borderColor: stressed ? colors.dangerSoft : 'rgba(255,255,255,0.75)',
          },
        ]}
      >
        <View style={styles.coreInner}>
          <Text style={styles.coreLabel}>Peace</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  coreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
});
