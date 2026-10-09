import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
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
    accent: colors.calm,
    chip: 'Metaphor only',
  },
  {
    title: 'Plant · wave · soften',
    body: 'Tap empty pads to plant Affirmation, Gratitude, or Humor. Tap a planted thought for Upgrade or Sell (Tray dual-mode). Soft goals track gently as you play.',
    accent: colors.affirmation,
    chip: 'Draft C tray',
  },
  {
    title: 'Comfort stays optional',
    body: 'The calm loop is free. Clarity Pass and looks are optional thank-yous — never required to progress. No fake urgency.',
    accent: colors.gratitude,
    chip: 'Free forever core',
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
  const pageFade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const reduceMotion = useReducedMotion();
  const { entitlements } = useIap();
  const looks = activeLooksFromEntitlements(entitlements);

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
      scale.setValue(1);
      return;
    }
    rise.setValue(0);
    scale.setValue(0.97);
    Animated.parallel([
      Animated.timing(rise, {
        toValue: 1,
        duration: 440,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start();
  }, [ready, visible, rise, scale, reduceMotion]);

  const animatePage = (next: number) => {
    if (reduceMotion) {
      setPage(next);
      return;
    }
    Animated.sequence([
      Animated.timing(pageFade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pageFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    // Swap content mid-fade
    setTimeout(() => setPage(next), 120);
  };

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
    animatePage(page + 1);
  };

  if (!ready || !visible) return null;

  const current = PAGES[page];
  const isLast = page >= PAGES.length - 1;
  const progress = (page + 1) / PAGES.length;

  return (
    <Modal transparent animationType={reduceMotion ? 'none' : 'fade'} visible={visible}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <Animated.View
          style={[
            styles.card,
            looks.dawn ? styles.cardDawn : null,
            {
              opacity: rise,
              transform: [
                {
                  translateY: rise.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                { scale },
              ],
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[styles.accentBar, { backgroundColor: current.accent }]}
          />
          <View pointerEvents="none" style={styles.topSheen} />
          <View
            pointerEvents="none"
            style={[styles.orbHalo, { backgroundColor: `${current.accent}22` }]}
          />
          <View
            pointerEvents="none"
            style={[styles.orb, { backgroundColor: `${current.accent}44` }]}
          />
          <View
            pointerEvents="none"
            style={[styles.orbSoft, { backgroundColor: `${current.accent}18` }]}
          />
          <View style={styles.topRow}>
            <View style={styles.eyebrowRow}>
              <View style={[styles.eyebrowDot, { backgroundColor: current.accent }]} />
              <Text style={[styles.eyebrow, { color: current.accent }]}>Welcome</Text>
            </View>
            <View style={[styles.stepChip, { borderColor: `${current.accent}44` }]}>
              <View style={[styles.stepDot, { backgroundColor: current.accent }]} />
              <Text style={[styles.step, { color: current.accent }]}>
                {page + 1} of {PAGES.length}
              </Text>
            </View>
          </View>

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

          <Animated.View style={{ opacity: pageFade, gap: 10 }}>
            <View style={[styles.chip, { borderColor: `${current.accent}66` }]}>
              <View style={[styles.chipDot, { backgroundColor: current.accent }]} />
              <Text style={[styles.chipLabel, { color: current.accent }]}>{current.chip}</Text>
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>
          </Animated.View>

          <View style={styles.dots} accessibilityRole="tablist">
            {PAGES.map((p, i) => (
              <View
                key={p.title}
                style={[
                  styles.dot,
                  i === page && styles.dotOn,
                  i === page ? { backgroundColor: p.accent } : null,
                  i < page ? { backgroundColor: `${p.accent}88` } : null,
                ]}
              />
            ))}
          </View>

          {isLast ? (
            <View style={styles.comfortStrip} accessibilityRole="summary">
              <View style={styles.comfortHead}>
                <View style={styles.comfortDot} />
                <Text style={styles.comfortTitle}>Metaphor only</Text>
              </View>
              <Text style={styles.comfortBody}>
                Soft play aims — not therapy, diagnosis, or medical advice. Comfort purchases stay
                optional.
              </Text>
            </View>
          ) : null}

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
              accessibilityLabel={isLast ? 'Enter Thought Defense' : 'Next'}
              hitSlop={TAP_SLOP}
              onPress={onNext}
              style={[styles.next, { backgroundColor: current.accent }]}
            >
              <View pointerEvents="none" style={styles.nextSheen} />
              <Text style={styles.nextLabel}>{isLast ? 'Enter' : 'Next'}</Text>
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
    paddingTop: 26,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardDawn: {
    backgroundColor: '#F6EBDA',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  orbHalo: {
    position: 'absolute',
    top: -48,
    right: -36,
    width: 150,
    height: 150,
    borderRadius: 150,
  },
  orb: {
    position: 'absolute',
    top: -36,
    right: -24,
    width: 120,
    height: 120,
    borderRadius: 120,
  },
  orbSoft: {
    position: 'absolute',
    bottom: -40,
    left: -28,
    width: 110,
    height: 110,
    borderRadius: 110,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  stepDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  step: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(36, 58, 52, 0.08)',
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
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
    width: 18,
  },
  comfortStrip: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 158, 174, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(106, 158, 174, 0.22)',
    gap: 3,
  },
  comfortHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comfortDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.clarity,
  },
  comfortTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.clarity,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
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
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  nextSheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: '45%',
  },
  nextLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#F7FBF9',
  },
});
