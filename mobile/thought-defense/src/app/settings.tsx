import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { resetWelcomeDismissed } from '../components/SoftWelcomeSheet';
import { GAME } from '../game/config';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    entitlements,
    restore,
    resetStub,
    stubMode,
    passDaysRemaining,
    describeEntitlements,
  } = useIap();

  return (
    <Atmosphere>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.brand}>Settings</Text>
        <Text style={styles.meta}>
          {GAME.name} · {GAME.version}
        </Text>

        <View style={styles.block}>
          <Text style={styles.h}>Purchases</Text>
          <SoftButton
            label="Restore purchases"
            onPress={async () => {
              const { summary } = await restore();
              Alert.alert('Restored', summary);
            }}
          />
          {stubMode ? (
            <SoftButton
              label="Reset stub purchases"
              variant="ghost"
              onPress={async () => {
                await resetStub();
                Alert.alert('Cleared', 'Stub entitlements + purchase log reset.');
              }}
            />
          ) : null}
          <Text style={styles.note}>{describeEntitlements()}</Text>
          {entitlements.clarityPassActive && passDaysRemaining != null ? (
            <Text style={styles.note}>
              Pass ~{passDaysRemaining} day{passDaysRemaining === 1 ? '' : 's'} remaining
              {entitlements.passExpiresAt
                ? ` · ${new Date(entitlements.passExpiresAt).toLocaleDateString()}`
                : ''}
            </Text>
          ) : null}
          {stubMode && entitlements.stubPurchaseLog.length > 0 ? (
            <Text style={styles.note}>
              Last stub buy:{' '}
              {entitlements.stubPurchaseLog[entitlements.stubPurchaseLog.length - 1]?.productId} ·{' '}
              {new Date(
                entitlements.stubPurchaseLog[entitlements.stubPurchaseLog.length - 1]?.at ?? '',
              ).toLocaleString()}
            </Text>
          ) : null}
        </View>

        <View style={styles.block}>
          <Text style={styles.h}>Onboarding</Text>
          <SoftButton
            label="Replay welcome"
            variant="soft"
            onPress={async () => {
              await resetWelcomeDismissed();
              Alert.alert(
                'Welcome ready',
                'Head Home to see the soft welcome again. Skip anytime.',
                [{ text: 'Go Home', onPress: () => router.replace('/') }, { text: 'OK' }],
              );
            }}
          />
          <Text style={styles.note}>
            Replays the first-launch sheet (metaphor · plant loop · optional comfort). OS Reduce
            Motion still softens the rise animation.
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.h}>Legal</Text>
          <SoftButton label="Privacy policy" variant="soft" onPress={() => router.push('/privacy')} />
          <SoftButton label="Terms of use" variant="soft" onPress={() => router.push('/terms')} />
        </View>

        <View style={styles.block}>
          <Text style={styles.h}>About</Text>
          <Text style={styles.versionLine}>
            Version {GAME.version.replace('-mobile', '')} · mobile build
          </Text>
          <Text style={styles.about}>
            Thought Defense is a soft metaphor game. It is not therapy, diagnosis, or medical advice.
            If you are in distress, seek real-world support.
          </Text>
        </View>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, gap: 8 },
  back: { alignSelf: 'flex-start' },
  brand: { fontFamily: fonts.display, fontSize: 36, color: colors.brandDeep, marginTop: 8 },
  meta: { fontFamily: fonts.body, color: colors.inkSoft, marginBottom: 12 },
  block: { gap: 10, marginBottom: 18 },
  h: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  versionLine: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.brand,
    marginBottom: 4,
  },
  about: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
});
