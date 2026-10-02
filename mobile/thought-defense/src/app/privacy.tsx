import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { softHaptic } from '../a11y/haptics';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'What stays on your device',
    body:
      'Welcome dismiss, soft-goal progress, tip chips, and stub purchase entitlements use on-device storage (AsyncStorage). There is no Thought Defense account or cloud save in this build.',
  },
  {
    title: 'What we do not collect',
    body:
      'No analytics SDK ships by default. No contact list, location, or health data. We do not ask for therapy notes or diagnosis information.',
  },
  {
    title: 'Purchases',
    body:
      'Paid items (Clarity Pass, looks, optional Clarity boost) are processed by Apple App Store and Google Play. Their receipts and billing history follow those stores’ privacy policies. Restore anytime from Settings.',
  },
  {
    title: 'If we add more later',
    body:
      'Crash reporting, accounts, or optional analytics — if ever added — will be named here with opt-in or clear disclosure where required before they ship.',
  },
  {
    title: 'Not medical advice',
    body:
      'Thought Defense is entertainment with a soft mental metaphor. It is not therapy, diagnosis, treatment, or a crisis service. If you are in distress, please seek real-world support.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Atmosphere>
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
        <Text style={styles.title}>Privacy policy</Text>
        <Text style={styles.lede}>
          Store-listing stub — replace with counsel-reviewed text and a public HTTPS URL before
          submit. Soft, ToS-safe summary of how this vertical slice treats your data.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.accent} />
              <Text style={styles.h}>{section.title}</Text>
            </View>
            <Text style={styles.p}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.p}>Contact: ngkdevid@gmail.com</Text>
        <Text style={styles.meta}>Last updated: 2026-10-02 · Thought Defense mobile</Text>
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
    marginBottom: 14,
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
