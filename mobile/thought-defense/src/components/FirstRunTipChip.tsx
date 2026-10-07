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
  { text: 'Tip · Tap empty pads to plant kindness', accent: colors.affirmation },
  { text: 'Tip · Tap a planted thought to Upgrade or Sell', accent: colors.gratitude },
  { text: 'Tip · Soft goals count even if Calm dips', accent: colors.calm },
  { text: 'Tip · Pause anytime — the path holds still', accent: colors.clarity },
] as const;

type Props = {
  /** Hide while paused / result modal / mid-wave clutter */
  visible: boolean;
  dawn?: boolean;
};

/**
 * Soft first-run coaching chip — dismissible once, persists on device.
 * Complementary to engine toasts (not a redo of Pause / walkers / a11y).
 */
export function FirstRunTipChip({ visible, dawn }: Props) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const tipFade = useRef(new Animated.Value(1)).current;
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
      scale.setValue(0.97);
      return;
    }
    if (reduceMotion) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    opacity.setValue(0);
    scale.setValue(0.97);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [show, opacity, scale, reduceMotion]);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      if (reduceMotion) {
        setTipIndex((i) => (i + 1) % TIPS.length);
        return;
      }
      Animated.timing(tipFade, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setTipIndex((i) => (i + 1) % TIPS.length);
        Animated.timing(tipFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, 5200);
    return () => clearInterval(id);
  }, [show, tipFade, reduceMotion]);

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

  const current = TIPS[tipIndex];
  const progress = (tipIndex + 1) / TIPS.length;

  return (
    <Animated.View
      style={[styles.wrap, { opacity, transform: [{ scale }] }]}
      accessibilityRole="summary"
      accessibilityLabel={current.text}
    >
      <View
        style={[
          styles.chip,
          dawn ? styles.chipDawn : null,
          { borderLeftColor: current.accent },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.glow, { backgroundColor: `${current.accent}28` }]}
        />
        <Animated.View style={[styles.textWrap, { opacity: tipFade }]}>
          <View style={[styles.badge, { borderColor: `${current.accent}66` }]}>
            <View style={[styles.badgeDot, { backgroundColor: current.accent }]} />
            <Text style={[styles.badgeLabel, { color: current.accent }]}>Soft tip</Text>
          </View>
          <Text style={styles.text}>{current.text}</Text>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: current.accent,
                },
              ]}
            />
          </View>
          <View style={styles.dots}>
            {TIPS.map((t, i) => (
              <View
                key={t.text}
                style={[
                  styles.dot,
                  i === tipIndex && styles.dotOn,
                  i === tipIndex ? { backgroundColor: t.accent } : null,
                  i < tipIndex ? { backgroundColor: `${t.accent}88` } : null,
                ]}
              />
            ))}
          </View>
        </Animated.View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss tip"
          hitSlop={TAP_SLOP}
          onPress={onDismiss}
          style={styles.dismiss}
        >
          <View pointerEvents="none" style={styles.dismissSheen} />
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
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(63, 111, 98, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.22)',
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chipDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.75)',
    borderColor: 'rgba(201, 168, 90, 0.3)',
  },
  glow: {
    position: 'absolute',
    top: -18,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 70,
  },
  textWrap: {
    flexShrink: 1,
    gap: 5,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brandDeep,
  },
  progressTrack: {
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(36, 58, 52, 0.08)',
    overflow: 'hidden',
    marginTop: 1,
  },
  progressFill: {
    height: 3,
    borderRadius: 3,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotOn: {
    width: 12,
  },
  dismiss: {
    minHeight: MIN_TAP,
    minWidth: MIN_TAP,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  dismissSheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.35)',
    height: '45%',
  },
  dismissLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
});
