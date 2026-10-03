import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const STORAGE_KEY = 'td_first_run_tip_dismissed_v1';

const TIPS = [
  'Tip · Tap empty pads to plant kindness',
  'Tip · Tap a planted thought to Upgrade or Sell',
  'Tip · Soft goals count even if Calm dips',
] as const;

type Props = {
  /** Hide while paused / result modal / mid-wave clutter */
  visible: boolean;
};

/**
 * Soft first-run coaching chip — dismissible once, persists on device.
 * Complementary to engine toasts (not a redo of Pause / walkers / a11y).
 */
export function FirstRunTipChip({ visible }: Props) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (alive) {
          setDismissed(raw === '1');
          setReady(true);
        }
      } catch {
        if (alive) {
          setDismissed(false);
          setReady(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const show = ready && !dismissed && visible;

  useEffect(() => {
    if (!show) {
      opacity.setValue(0);
      return;
    }
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [show, opacity, reduceMotion]);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 5200);
    return () => clearInterval(id);
  }, [show]);

  const onDismiss = async () => {
    softHaptic('tap');
    setDismissed(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* keep dismissed in-session */
    }
  };

  if (!show) return null;

  return (
    <Animated.View
      style={[styles.wrap, { opacity }]}
      accessibilityRole="summary"
      accessibilityLabel={TIPS[tipIndex]}
    >
      <View style={styles.chip}>
        <Text style={styles.text}>{TIPS[tipIndex]}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss tip"
          hitSlop={TAP_SLOP}
          onPress={onDismiss}
          style={styles.dismiss}
        >
          <Text style={styles.dismissLabel}>Got it</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 2,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '100%',
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(63, 111, 98, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.22)',
  },
  text: {
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brandDeep,
  },
  dismiss: {
    minHeight: MIN_TAP,
    minWidth: MIN_TAP,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceStrong,
  },
  dismissLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
});
