import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SoftActionToast } from '../components/SoftActionToast';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import type { ToastKind } from '../game/types';
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
  const {
    products,
    entitlements,
    purchase,
    restore,
    stubMode,
    passDaysRemaining,
    describeEntitlements,
  } = useIap();
  const [busy, setBusy] = useState<string | null>(null);
  const [showIds, setShowIds] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const owned = (id: string) =>
    entitlements.ownedCosmetics.includes(id) ||
    (id === 'clarity_pass_monthly' && entitlements.clarityPassActive);

  const flash = (message: string, kind: ToastKind) => setToast({ message, kind });

  const onBuy = async (id: string) => {
    setBusy(id);
    const result = await purchase(id);
    setBusy(null);
    if (!result.ok) {
      flash(result.reason ?? 'Could not complete', 'warn');
      return;
    }
    flash(result.message ?? 'Thank you', 'success');
  };

  const onRestore = async () => {
    setBusy('restore');
    const { summary } = await restore();
    setBusy(null);
    flash(summary, 'info');
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

        <SoftActionToast message={toast?.message ?? null} kind={toast?.kind ?? null} />

        {stubMode ? (
          <Text style={styles.stub}>
            Stub IAP mode (Expo Go / missing credentials). Purchases persist on-device with a soft
            audit log. Wire RevenueCat or react-native-iap before store submit — ask Femmy which.
            Prices: Pass $2.99/mo · cosmetics $1.99 · boost $0.99 (price confirm still open).
          </Text>
        ) : null}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Your comfort</Text>
          <Text style={styles.statusBody}>{describeEntitlements()}</Text>
          {entitlements.clarityPassActive && passDaysRemaining != null ? (
            <Text style={styles.statusMeta}>
              Pass renews / expires in ~{passDaysRemaining} day
              {passDaysRemaining === 1 ? '' : 's'}
              {entitlements.passExpiresAt
                ? ` · ${new Date(entitlements.passExpiresAt).toLocaleDateString()}`
                : ''}
            </Text>
          ) : null}
          {entitlements.pendingClarity > 0 ? (
            <Text style={styles.pending}>
              +{entitlements.pendingClarity} Clarity waiting — opens on next mindscape session.
            </Text>
          ) : null}
        </View>

        <SoftButton
          label={busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
          variant="soft"
          onPress={onRestore}
          disabled={busy != null}
          style={styles.restore}
        />

        <Pressable onPress={() => setShowIds((v) => !v)} accessibilityRole="button">
          <Text style={styles.idsToggle}>
            {showIds ? 'Hide store product IDs' : 'Show store product IDs'}
          </Text>
        </Pressable>

        {SECTIONS.map((section) => {
          const items = products.filter((p) => p.kind === section.kind);
          if (items.length === 0) return null;
          return (
            <View key={section.kind} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {items.map((p) => (
                <View
                  key={p.id}
                  style={[styles.card, owned(p.id) && p.kind !== 'consumable' && styles.cardOwned]}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.title}>{p.title}</Text>
                    {owned(p.id) && p.kind !== 'consumable' ? (
                      <Text style={styles.badge}>
                        {p.kind === 'subscription' ? 'Active' : 'Owned'}
                      </Text>
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
                  {showIds ? (
                    <Text style={styles.ids}>
                      iOS: {p.iosProductId}
                      {'\n'}
                      Android: {p.androidProductId}
                    </Text>
                  ) : null}
                  <SoftButton
                    label={
                      owned(p.id) && p.kind === 'subscription'
                        ? busy === p.id
                          ? 'Working…'
                          : 'Extend stub Pass (+30d)'
                        : owned(p.id) && p.kind !== 'consumable'
                          ? 'Owned'
                          : busy === p.id
                            ? 'Working…'
                            : p.kind === 'subscription'
                              ? 'Start Clarity Pass'
                              : p.kind === 'consumable'
                                ? 'Get boost'
                                : 'Get pack'
                    }
                    disabled={
                      busy != null || (owned(p.id) && p.kind === 'nonconsumable')
                    }
                    onPress={() => {
                      if (stubMode && !(owned(p.id) && p.kind === 'nonconsumable')) {
                        Alert.alert(
                          stubMode ? 'Stub purchase' : 'Purchase',
                          stubMode
                            ? `Simulate ${p.title} on this device? No real charge in stub mode.`
                            : `Buy ${p.title}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Continue', onPress: () => void onBuy(p.id) },
                          ],
                        );
                        return;
                      }
                      void onBuy(p.id);
                    }}
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
    marginBottom: 8,
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
    lineHeight: 17,
    color: colors.brand,
  },
  statusCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 158, 174, 0.12)',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  statusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.brandDeep,
  },
  statusBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  statusMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.calm,
    marginTop: 2,
  },
  pending: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clarity,
  },
  restore: { marginBottom: 8 },
  idsToggle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 14,
    textDecorationLine: 'underline',
  },
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
