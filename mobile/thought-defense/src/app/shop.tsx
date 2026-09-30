import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { products, entitlements, purchase, stubMode } = useIap();
  const [busy, setBusy] = useState<string | null>(null);

  const owned = (id: string) =>
    entitlements.ownedCosmetics.includes(id) ||
    (id === 'clarity_pass_monthly' && entitlements.clarityPassActive);

  const onBuy = async (id: string) => {
    setBusy(id);
    const result = await purchase(id);
    setBusy(null);
    if (!result.ok) {
      Alert.alert('Purchase', result.reason ?? 'Could not complete');
      return;
    }
    Alert.alert(
      'Thank you',
      stubMode
        ? 'Stub purchase saved on device. Wire StoreKit / Play Billing before store submit.'
        : 'Purchase complete.',
    );
  };

  return (
    <Atmosphere>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.brand}>Clarity shop</Text>
        <Text style={styles.lead}>
          Optional comfort only — plant, clear waves, and soft goals stay free. No fake urgency, no
          medical claims.
        </Text>

        {stubMode ? (
          <Text style={styles.stub}>
            Stub IAP mode (Expo Go / missing credentials). Product IDs are ready for App Store & Play.
          </Text>
        ) : null}

        {products.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.kind}>
              {p.kind === 'subscription' ? 'Subscription' : p.kind === 'consumable' ? 'One-time boost' : 'Cosmetic'}
              {' · '}
              {p.priceHint}
            </Text>
            <Text style={styles.blurb}>{p.blurb}</Text>
            <Text style={styles.ids}>
              iOS: {p.iosProductId}
              {'\n'}
              Android: {p.androidProductId}
            </Text>
            <SoftButton
              label={
                owned(p.id) && p.kind !== 'consumable'
                  ? 'Owned'
                  : busy === p.id
                    ? 'Working…'
                    : p.kind === 'subscription'
                      ? 'Start Clarity Pass'
                      : 'Get'
              }
              disabled={busy != null || (owned(p.id) && p.kind !== 'consumable')}
              onPress={() => onBuy(p.id)}
            />
          </View>
        ))}
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  brand: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.brandDeep,
  },
  lead: {
    marginTop: 8,
    marginBottom: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  stub: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink },
  kind: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.calm },
  blurb: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  ids: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    opacity: 0.8,
  },
});
