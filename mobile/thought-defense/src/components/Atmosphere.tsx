import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/** Soft atmosphere — mist gradient + drifting orbs. Brand atmosphere, not flat fill. */
export function Atmosphere({ children }: { children: React.ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [a, b]);

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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.mistTop, colors.mistMid, colors.mistBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.orb, styles.orbA, driftA]} />
      <Animated.View style={[styles.orb, styles.orbB, driftB]} />
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
  orbB: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(224, 138, 104, 0.22)',
    bottom: 120,
    left: -50,
  },
});
