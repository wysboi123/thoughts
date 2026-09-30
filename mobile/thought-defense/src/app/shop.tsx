import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { useIap } from '../iap/IapProvider';
import type { StoreProduct } from '../iap/products';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const SECTIONS: { title: string; kind: StoreProduct['kind'] }[] = [
  { title: 'Clarity Pass', kind: 'subscription' },
  { title: 'Looks only', kind: 'nonconsumable' },
  { title: 'Optional boost', kind: 'consumable' },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { products, entitlements, purchase, restore, stubMode } = useIap();
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
            Prices: Pass $2.99/mo · cosmetics $1.99 · boost $0.99 (pending Femmy confirm).
          </Text>
        ) : null}

        {entitlements.pendingClarity > 0 ? (
          <Text style={styles.pending}>
            +{entitlements.pendingClarity} Clarity waiting — opens on next mindscape session.
          </Text>
        ) : null}

        <SoftButton
          label="Restore purchases"
          variant="soft"
          onPress={async () => {
            setBusy('restore');
            await restore();
            setBusy(null);
            Alert.alert(
              'Restored',
              stubMode
                ? 'Re-checked stub entitlements on this device.'
                : 'Checked store purchases.',
            );
          }}
          disabled={busy != null}
          style={styles.restore}
        />

        {SECTIONS.map((section) => {
          const items = products.filter((p) => p.kind === section.kind);
          if (items.length === 0) return null;
          return (
            <View key={section.kind} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {items.map((p) => (
                <View key={p.id} style={[styles.card, owned(p.id) && p.kind !== 'consumable' && styles.cardOwned]}>
                  <View style={styles.cardTop}>
                    <Text style={styles.title}>{p.title}</Text>
                    {owned(p.id) && p.kind !== 'consumable' ? (
                      <Text style={styles.badge}>Owned</Text>
                    ) : null}
                  </View>
                  <Text style={styles.kind}>
                    {p.kind === 'subscription'
                      ? 'Subscription'
                      : p.kind === 'consumable'
                        ? 'One-time boost'
                        : 'Cosmetic'}
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
                            : p.kind === 'consumable'
                              ? 'Get boost'
                              : 'Get pack'
                    }
                    disabled={busy != null || (owned(p.id) && p.kind !== 'consumable')}
                    onPress={() => onBuy(p.id)}
                  />
                </View>
              ))}
            </View>
          );
        })}
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
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
  pending: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 158, 174, 0.18)',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clarity,
  },
  restore: { marginBottom: 16 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.brandDeep,
    marginBottom: 8,
    marginTop: 4,
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
  cardOwned: {
    borderColor: colors.calm,
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink, flex: 1 },
  badge: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  kind: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.calm },
  blurb: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  ids: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    opacity: 0.8,
  },
});
