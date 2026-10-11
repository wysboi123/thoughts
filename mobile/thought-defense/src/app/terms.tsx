import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { softHaptic } from '../a11y/haptics';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { GAME } from '../game/config';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const SECTIONS: { title: string; body: string; accent: string }[] = [
  {
    title: 'Entertainment only',
    body:
      'Thought Defense is entertainment with a soft mental metaphor. It is not medical advice, therapy, diagnosis, treatment, or a crisis service.',
    accent: colors.calm,
  },
  {
    title: 'Subscriptions & restores',
    body:
      'Subscriptions renew until cancelled in your Apple or Google account settings. Restore purchases anytime from Settings. Billing is handled by the stores.',
    accent: colors.clarity,
  },
  {
    title: 'Optional comfort',
    body:
      'Cosmetics and Clarity boosts are optional thank-yous. The core calm loop remains playable without purchase — no fake urgency.',
    accent: colors.gratitude,
  },
  {
    title: 'Stub notice',
    body:
      'These are placeholder store-listing terms. Replace with counsel-reviewed text and a public HTTPS URL before production publish.',
    accent: colors.affirmation,
  },
];

function SoftBlockEnter({
  index,
  reduceMotion,
  children,
}: {
  index: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 8);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(
      40 + index * 48,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      40 + index * 48,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { entitlements } = useIap();
  const looks = activeLooksFromEntitlements(entitlements);

  return (
    <Atmosphere dawn={looks.dawn}>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <SoftButton
          label="← Back"
          variant="ghost"
          onPress={() => {
            softHaptic('tap');
            router.back();
          }}
          style={styles.back}
        />

        <SoftBlockEnter index={0} reduceMotion={reduceMotion}>
          <Text style={styles.title}>Terms of use</Text>
          <Text style={styles.lede}>
            Soft store stub — keep ToS-safe, free-core honest, and counsel-reviewed before submit.
          </Text>
        </SoftBlockEnter>

        <SoftBlockEnter index={1} reduceMotion={reduceMotion}>
          <View style={styles.comfortStrip} accessibilityRole="summary">
            <Text style={styles.comfortTitle}>Core loop stays free</Text>
            <Text style={styles.comfortBody}>
              Clarity Pass and looks never gate Calm, wave progress, or Draft C plant/upgrade play.
            </Text>
          </View>
        </SoftBlockEnter>

        {SECTIONS.map((section, i) => (
          <SoftBlockEnter key={section.title} index={2 + i} reduceMotion={reduceMotion}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={[styles.accent, { backgroundColor: section.accent }]} />
                <Text style={styles.h}>{section.title}</Text>
              </View>
              <Text style={styles.p}>{section.body}</Text>
            </View>
          </SoftBlockEnter>
        ))}

        <SoftBlockEnter index={2 + SECTIONS.length} reduceMotion={reduceMotion}>
          <Text style={styles.p}>Contact: ngkdevid@gmail.com</Text>
          <Text style={styles.meta}>
            Last updated: 2026-10-04 · {GAME.name} {GAME.version}
          </Text>
        </SoftBlockEnter>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, gap: 4 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.brandDeep, marginBottom: 8 },
  lede: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  comfortStrip: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 168, 90, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 90, 0.28)',
    gap: 4,
    marginBottom: 12,
  },
  comfortTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.gratitude,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accent: { width: 3, height: 14, borderRadius: 2 },
  h: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, flex: 1 },
  p: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: 8,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
});
