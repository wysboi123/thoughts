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
  const c = useRef(new Animated.Value(0)).current;
  const haze = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      a.setValue(0.5);
      b.setValue(0.5);
      c.setValue(0.45);
      haze.setValue(0.4);
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, {
      toValue: 1,
      duration: 720,
      useNativeDriver: true,
    }).start();
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
    const loopC = Animated.loop(
      Animated.sequence([
        Animated.timing(c, { toValue: 1, duration: 15000, useNativeDriver: true }),
        Animated.timing(c, { toValue: 0, duration: 15000, useNativeDriver: true }),
      ]),
    );
    const loopHaze = Animated.loop(
      Animated.sequence([
        Animated.timing(haze, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(haze, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ]),
    );
    loopA.start();
    loopB.start();
    loopC.start();
    loopHaze.start();
    return () => {
      loopA.stop();
      loopB.stop();
      loopC.stop();
      loopHaze.stop();
    };
  }, [a, b, c, haze, enter, reduceMotion]);

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
  const driftC = {
    transform: [
      {
        translateY: c.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }),
      },
      {
        translateX: c.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
      },
      {
        scale: c.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.06, 0.92] }),
      },
    ],
    opacity: c.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.34, 0.18] }),
  };
  const hazeStyle = {
    opacity: haze.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] }),
  };
  const hazeSoftStyle = {
    opacity: haze.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.16] }),
  };
  const contentStyle = {
    opacity: enter,
    flex: 1,
    transform: [
      {
        scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }),
      },
      {
        translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
      },
    ],
  };

  const mist = dawn
    ? (['#E8D9C4', '#F0E4D2', '#E8F0EC'] as const)
    : ([colors.mistTop, colors.mistMid, colors.mistBottom] as const);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...mist]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View
        pointerEvents="none"
        style={[styles.hazeBand, dawn ? styles.hazeBandDawn : null, hazeStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.hazeBandSoft, dawn ? styles.hazeBandSoftDawn : null, hazeSoftStyle]}
      />
      <Animated.View
        style={[styles.orb, styles.orbA, dawn ? styles.orbADawn : null, driftA]}
      >
        <View style={[styles.orbHalo, dawn ? styles.orbHaloDawn : null]} />
      </Animated.View>
      <Animated.View
        style={[styles.orb, styles.orbB, dawn ? styles.orbBDawn : null, driftB]}
      >
        <View style={[styles.orbHalo, dawn ? styles.orbHaloDawn : null]} />
      </Animated.View>
      <Animated.View
        style={[styles.orb, styles.orbC, dawn ? styles.orbCDawn : null, driftC]}
      >
        <View style={[styles.orbHalo, dawn ? styles.orbHaloDawn : null]} />
      </Animated.View>
      <View pointerEvents="none" style={styles.edgeTop}>
        <LinearGradient
          colors={
            dawn
              ? ['rgba(232, 201, 160, 0.28)', 'transparent']
              : ['rgba(197, 221, 214, 0.35)', 'transparent']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View pointerEvents="none" style={styles.edgeBottom}>
        <LinearGradient
          colors={
            dawn
              ? ['transparent', 'rgba(232, 240, 236, 0.45)']
              : ['transparent', 'rgba(232, 240, 236, 0.5)']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View pointerEvents="none" style={styles.edgeLeft}>
        <LinearGradient
          colors={
            dawn
              ? ['rgba(232, 201, 160, 0.14)', 'transparent']
              : ['rgba(197, 221, 214, 0.18)', 'transparent']
          }
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View pointerEvents="none" style={styles.edgeRight}>
        <LinearGradient
          colors={
            dawn
              ? ['transparent', 'rgba(240, 180, 120, 0.12)']
              : ['transparent', 'rgba(106, 158, 174, 0.14)']
          }
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View
        pointerEvents="none"
        style={[styles.centerGlow, dawn ? styles.centerGlowDawn : null]}
      />
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hazeBand: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: '38%',
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 80,
  },
  hazeBandDawn: {
    backgroundColor: 'rgba(255, 236, 210, 0.4)',
  },
  hazeBandSoft: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: '58%',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 40,
  },
  hazeBandSoftDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.28)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'visible',
  },
  orbHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    transform: [{ scale: 1.12 }],
  },
  orbHaloDawn: {
    borderColor: 'rgba(255, 244, 220, 0.45)',
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
  orbC: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(106, 158, 174, 0.22)',
    top: '52%',
    right: 24,
  },
  orbCDawn: {
    backgroundColor: 'rgba(201, 168, 90, 0.26)',
  },
  edgeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 90,
  },
  edgeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  edgeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 48,
  },
  edgeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
  },
  centerGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centerGlowDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.12)',
  },
});
