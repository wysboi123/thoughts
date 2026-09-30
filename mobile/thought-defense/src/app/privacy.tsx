import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

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
        <SoftButton label="← Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>Privacy policy</Text>
        <Text style={styles.p}>
          Placeholder for App Store / Play listing. Replace with counsel-reviewed text before submit.
        </Text>
        <Text style={styles.p}>
          Thought Defense collects no account data in the vertical-slice build. Purchases are handled
          by Apple App Store and Google Play. Stub IAP stores entitlements only on-device via AsyncStorage.
        </Text>
        <Text style={styles.p}>
          Analytics, crash reporting, and accounts — if added later — will be disclosed here with opt-in
          where required. Contact: ngkdevid@gmail.com
        </Text>
        <Text style={styles.p}>Last updated: 2026-09-30</Text>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.brandDeep, marginBottom: 12 },
  p: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: 12,
  },
});
