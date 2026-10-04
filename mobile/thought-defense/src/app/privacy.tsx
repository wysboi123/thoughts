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
    title: 'What stays on your device',
    body:
      'Welcome dismiss, soft-goal progress, tip chips, and stub purchase entitlements use on-device storage (AsyncStorage). There is no Thought Defense account or cloud save in this build.',
    accent: colors.calm,
  },
  {
    title: 'What we do not collect',
    body:
      'No analytics SDK ships by default. No contact list, location, or health data. We do not ask for therapy notes or diagnosis information.',
    accent: colors.clarity,
  },
  {
    title: 'Purchases',
    body:
      'Paid items (Clarity Pass, looks, optional Clarity boost) are processed by Apple App Store and Google Play. Their receipts and billing history follow those stores’ privacy policies. Restore anytime from Settings.',
    accent: colors.gratitude,
  },
  {
    title: 'If we add more later',
    body:
      'Crash reporting, accounts, or optional analytics — if ever added — will be named here with opt-in or clear disclosure where required before they ship.',
    accent: colors.affirmation,
  },
  {
    title: 'Not medical advice',
    body:
      'Thought Defense is entertainment with a soft mental metaphor. It is not therapy, diagnosis, treatment, or a crisis service. If you are in distress, please seek real-world support.',
    accent: colors.humor,
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

export default function PrivacyScreen() {
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
          <Text style={styles.title}>Privacy policy</Text>
          <Text style={styles.lede}>
            Store-listing stub — replace with counsel-reviewed text and a public HTTPS URL before
            submit. Soft, ToS-safe summary of how this vertical slice treats your data.
          </Text>
        </SoftBlockEnter>

        <SoftBlockEnter index={1} reduceMotion={reduceMotion}>
          <View style={styles.comfortStrip} accessibilityRole="summary">
            <Text style={styles.comfortTitle}>On-device first</Text>
            <Text style={styles.comfortBody}>
              No Thought Defense account. Core loop stays free. Metaphor play only — not medical
              advice.
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
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.22)',
    gap: 4,
    marginBottom: 12,
  },
  comfortTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brand,
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
  accent: { width: 3, height: 14, borderRadius: 2, backgroundColor: colors.calm },
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
