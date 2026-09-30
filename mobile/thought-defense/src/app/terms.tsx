import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function TermsScreen() {
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
        <Text style={styles.title}>Terms of use</Text>
        <Text style={styles.p}>
          Placeholder terms for store review. Replace before production publish.
        </Text>
        <Text style={styles.p}>
          Thought Defense is entertainment with a soft mental metaphor. It is not medical advice,
          therapy, or a crisis service. Subscriptions renew until cancelled in your store account
          settings. Restore purchases anytime from Settings.
        </Text>
        <Text style={styles.p}>
          Cosmetics and Clarity boosts are optional. The core calm loop remains playable without
          purchase. Contact: ngkdevid@gmail.com
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
