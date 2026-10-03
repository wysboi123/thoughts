import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export const WELCOME_STORAGE_KEY = 'td.welcome.dismissed.v1';

/** Clears dismiss flag so SoftWelcomeSheet shows again on next Home focus. */
export async function resetWelcomeDismissed(): Promise<void> {
  await AsyncStorage.removeItem(WELCOME_STORAGE_KEY);
}

const PAGES = [
  {
    title: 'A soft mindscape',
    body: 'Thought Defense is a gentle metaphor game. Plant kindness, clear noisy thoughts, keep the Peace Core. Not therapy, diagnosis, or medical advice.',
  },
  {
    title: 'Plant · wave · soften',
    body: 'Tap empty pads to plant Affirmation, Gratitude, or Humor. Tap a planted thought for Upgrade or Sell (Tray dual-mode). Soft goals track gently as you play.',
  },
  {
    title: 'Comfort stays optional',
    body: 'The calm loop is free. Clarity Pass and looks are optional thank-yous — never required to progress. No fake urgency.',
  },
] as const;

/**
 * First-launch welcome overlay on Home — distinct from play-side FirstRunTipChip.
 * Persists dismiss on device. Reduce Motion: skip rise animation.
 */
export function SoftWelcomeSheet() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const rise = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  const readFlag = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(WELCOME_STORAGE_KEY);
      setVisible(raw !== '1');
      setReady(true);
      if (raw !== '1') setPage(0);
    } catch {
      setVisible(true);
      setReady(true);
      setPage(0);
    }
  }, []);

  useEffect(() => {
    void readFlag();
  }, [readFlag]);

  useFocusEffect(
    useCallback(() => {
      void readFlag();
    }, [readFlag]),
  );

  useEffect(() => {
    if (!ready || !visible) return;
    if (reduceMotion) {
      rise.setValue(1);
      return;
    }
    rise.setValue(0);
    Animated.timing(rise, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [ready, visible, rise, reduceMotion]);

  const dismiss = async () => {
    softHaptic('clear');
    setVisible(false);
    try {
      await AsyncStorage.setItem(WELCOME_STORAGE_KEY, '1');
    } catch {
      /* keep dismissed in-session */
    }
  };

  const onNext = () => {
    softHaptic('tap');
    if (page >= PAGES.length - 1) {
      void dismiss();
      return;
    }
    setPage((p) => p + 1);
  };

  if (!ready || !visible) return null;

  const current = PAGES[page];

  return (
    <Modal transparent animationType={reduceMotion ? 'none' : 'fade'} visible={visible}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: rise,
              transform: [
                {
                  translateY: rise.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip welcome"
              hitSlop={TAP_SLOP}
              onPress={() => void dismiss()}
              style={styles.skip}
            >
              <Text style={styles.skipLabel}>Skip</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={page >= PAGES.length - 1 ? 'Enter Thought Defense' : 'Next'}
              hitSlop={TAP_SLOP}
              onPress={onNext}
              style={styles.next}
            >
              <Text style={styles.nextLabel}>
                {page >= PAGES.length - 1 ? 'Enter' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 58, 52, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.calm,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.brandDeep,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotOn: {
    backgroundColor: colors.brand,
    width: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skip: {
    minHeight: MIN_TAP,
    minWidth: MIN_TAP,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  next: {
    minHeight: MIN_TAP,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#F7FBF9',
  },
});
