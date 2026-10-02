import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';

type Props = {
  children: React.ReactNode;
  /** Dawn Path look — warmer mist (cosmetic only) */
  dawn?: boolean;
};

/** Soft atmosphere — mist gradient + drifting orbs. Brand atmosphere, not flat fill. */
export function Atmosphere({ children, dawn }: Props) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      a.setValue(0.5);
      b.setValue(0.5);
      return;
    }
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ]),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(b, { toValue: 1, duration: 12000, useNativeDriver: true }),
        Animated.timing(b, { toValue: 0, duration: 12000, useNativeDriver: true }),
      ]),
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [a, b, reduceMotion]);

  const driftA = {
    transform: [
      {
        translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }),
      },
      {
        translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }),
      },
    ],
    opacity: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.55, 0.35] }),
  };
  const driftB = {
    transform: [
      {
        translateY: b.interpolate({ inputRange: [0, 1], outputRange: [10, -20] }),
      },
      {
        translateX: b.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }),
      },
    ],
    opacity: b.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.45, 0.25] }),
  };

  const mist = dawn
    ? (['#E8D9C4', '#F0E4D2', '#E8F0EC'] as const)
    : ([colors.mistTop, colors.mistMid, colors.mistBottom] as const);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...mist]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[
          styles.orb,
          styles.orbA,
          dawn ? styles.orbADawn : null,
          driftA,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbB,
          dawn ? styles.orbBDawn : null,
          driftB,
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbA: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(107, 184, 154, 0.35)',
    top: 80,
    right: -40,
  },
  orbADawn: {
    backgroundColor: 'rgba(232, 201, 160, 0.4)',
  },
  orbB: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(224, 138, 104, 0.22)',
    bottom: 120,
    left: -50,
  },
  orbBDawn: {
    backgroundColor: 'rgba(240, 180, 120, 0.28)',
  },
});
