import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { SoftActionToast } from '../components/SoftActionToast';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import type { ToastKind } from '../game/types';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
import type { ProductKind, StoreProduct } from '../iap/products';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const SECTIONS: { title: string; kind: ProductKind; hint: string }[] = [
  { title: 'Clarity Pass', kind: 'subscription', hint: 'Comfort thank-you · never required' },
  { title: 'Looks only', kind: 'nonconsumable', hint: 'Themes & glows · no power' },
  { title: 'Optional boost', kind: 'consumable', hint: 'One soft head start' },
];

const PASS_PERKS = [
  'Quieter between-run notes',
  'Dawn & Lantern themes included',
  'Soft Pass badge on Home',
];

/** Soft preview swatches — looks only, not gameplay stats. */
const LOOK_SWATCHES: Record<string, { label: string; tones: string[] }> = {
  cosmetic_dawn: {
    label: 'Sunrise path',
    tones: ['#F2E6C8', '#E8C9A0', '#D9CDB8', '#FFE8A8'],
  },
  cosmetic_lantern: {
    label: 'Lantern kindness',
    tones: [colors.affirmation, colors.gratitude, colors.humor, colors.coreGlow],
  },
};

const KIND_ACCENT: Record<ProductKind, string> = {
  subscription: colors.calm,
  nonconsumable: colors.gratitude,
  consumable: colors.clarity,
};

function SoftCardEnter({
  index,
  reduceMotion,
  children,
}: {
  index: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 10);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(
      40 + index * 55,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      40 + index * 55,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

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
  const looks = activeLooksFromEntitlements(entitlements);
  const reduceMotion = useReducedMotion();
  const [busy, setBusy] = useState<string | null>(null);
  const [showIds, setShowIds] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  let cardIndex = 4;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const owned = (id: string) =>
    entitlements.ownedCosmetics.includes(id) ||
    (id === 'clarity_pass_monthly' && entitlements.clarityPassActive);

  const flash = (message: string, kind: ToastKind) => {
    setToast({ message, kind });
    softHaptic(kind === 'warn' ? 'warn' : kind === 'success' ? 'clear' : 'tap');
  };

  const onBuy = async (id: string) => {
    setBusy(id);
    softHaptic('tap');
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
    softHaptic('tap');
    const { summary } = await restore();
    setBusy(null);
    flash(summary, 'info');
  };

  return (
    <Atmosphere dawn={looks.dawn}>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <SoftCardEnter index={0} reduceMotion={reduceMotion}>
          <Text style={styles.brand}>Clarity shop</Text>
          <Text style={styles.lead}>
            Optional comfort only — plant, clear waves, and soft goals stay free. No fake urgency, no
            medical claims.
          </Text>
        </SoftCardEnter>

        <SoftCardEnter index={1} reduceMotion={reduceMotion}>
          <View
            style={[styles.freeStrip, looks.dawn ? styles.freeStripDawn : null]}
            accessibilityRole="text"
          >
            <View pointerEvents="none" style={styles.chipSheen} />
            <View style={styles.freeStripHead}>
              <View style={[styles.leadDot, looks.dawn ? styles.leadDotDawn : null]} />
              <Text style={styles.freeStripTitle}>Core loop stays free</Text>
            </View>
            <Text style={styles.freeStripBody}>
              Every wave, plant, upgrade, and soft goal works without a purchase. Pass & packs are
              thank-yous for looks and quiet comfort.
            </Text>
          </View>
        </SoftCardEnter>

        <SoftActionToast message={toast?.message ?? null} kind={toast?.kind ?? null} />

        {stubMode ? (
          <SoftCardEnter index={2} reduceMotion={reduceMotion}>
            <Text style={[styles.stub, looks.dawn ? styles.stubDawn : null]}>
              Stub IAP mode (Expo Go / missing credentials). Purchases persist on-device with a soft
              audit log. Wire RevenueCat or react-native-iap before store submit — ask Femmy which.
              Prices: Pass $2.99/mo · cosmetics $1.99 · boost $0.99 (price confirm still open).
            </Text>
          </SoftCardEnter>
        ) : null}

        <SoftCardEnter index={3} reduceMotion={reduceMotion}>
          <View
            style={[
              styles.statusCard,
              entitlements.clarityPassActive ? styles.statusCardPass : null,
              looks.dawn ? styles.statusCardDawn : null,
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.statusTopAccent,
                {
                  backgroundColor: entitlements.clarityPassActive
                    ? colors.calm
                    : looks.dawn
                      ? colors.gratitude
                      : colors.clarity,
                },
              ]}
            />
            <View pointerEvents="none" style={styles.chipSheen} />
            <View style={styles.statusHead}>
              <Text style={styles.statusTitle}>Your comfort</Text>
              {entitlements.clarityPassActive ? (
                <View style={styles.passLiveChip}>
                  <View pointerEvents="none" style={styles.chipSheen} />
                  <View style={styles.passLiveDot} />
                  <Text style={styles.passLiveText}>Pass live</Text>
                </View>
              ) : null}
            </View>
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
            {(looks.dawn || looks.lantern) ? (
              <Text style={styles.activeLooks}>
                Active looks · {[looks.dawn && 'Dawn', looks.lantern && 'Lantern'].filter(Boolean).join(' + ')}
              </Text>
            ) : null}
          </View>
        </SoftCardEnter>

        <SoftButton
          label={busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
          variant="soft"
          onPress={onRestore}
          disabled={busy != null}
          style={styles.restore}
        />

        <Pressable
          onPress={() => {
            softHaptic('tap');
            setShowIds((v) => !v);
          }}
          accessibilityRole="button"
          accessibilityLabel={showIds ? 'Hide store product IDs' : 'Show store product IDs'}
        >
          <Text style={styles.idsToggle}>
            {showIds ? 'Hide store product IDs' : 'Show store product IDs'}
          </Text>
        </Pressable>

        {SECTIONS.map((section) => {
          const items = products.filter((p) => p.kind === section.kind);
          if (items.length === 0) return null;
          const accent = KIND_ACCENT[section.kind];
          return (
            <View key={section.kind} style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
                <View style={styles.sectionCopy}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={[styles.sectionChip, { backgroundColor: `${accent}22`, borderColor: `${accent}44` }]}>
                      <View pointerEvents="none" style={styles.chipSheen} />
                      <View style={[styles.sectionChipDot, { backgroundColor: accent }]} />
                      <Text style={[styles.sectionChipText, { color: accent }]}>
                        {section.kind === 'subscription'
                          ? 'Pass'
                          : section.kind === 'consumable'
                            ? 'Boost'
                            : 'Looks'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sectionHint}>{section.hint}</Text>
                </View>
              </View>
              {items.map((p) => {
                const idx = cardIndex++;
                const isPass = p.kind === 'subscription';
                const isOwned = owned(p.id) && p.kind !== 'consumable';
                const swatch = LOOK_SWATCHES[p.id];
                return (
                  <SoftCardEnter key={p.id} index={idx} reduceMotion={reduceMotion}>
                    <View
                      style={[
                        styles.card,
                        isPass && styles.cardPass,
                        isOwned && styles.cardOwned,
                        looks.dawn && styles.cardDawn,
                        { borderLeftColor: accent, borderLeftWidth: 3 },
                      ]}
                    >
                      <View
                        pointerEvents="none"
                        style={[styles.cardTopAccent, { backgroundColor: accent }]}
                      />
                      {isPass ? (
                        <View style={styles.passSheen} pointerEvents="none" />
                      ) : (
                        <View style={styles.cardSheen} pointerEvents="none" />
                      )}
                      {isPass ? (
                        <Text style={styles.passEyebrow}>Monthly comfort · cancel anytime</Text>
                      ) : null}
                      <View style={styles.cardTop}>
                        <Text style={[styles.title, isPass && styles.titlePass]}>{p.title}</Text>
                        {isOwned ? (
                          <View style={styles.badge}>
                            <View pointerEvents="none" style={styles.chipSheen} />
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>
                              {p.kind === 'subscription' ? 'Active' : 'Owned'}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.kindRow}>
                        <Text style={[styles.kind, { color: accent }]}>
                          {p.kind === 'subscription'
                            ? 'Subscription'
                            : p.kind === 'consumable'
                              ? 'One-time boost'
                              : 'Cosmetic'}
                        </Text>
                        <View style={[styles.priceChip, { borderColor: `${accent}55`, backgroundColor: `${accent}14` }]}>
                          <View pointerEvents="none" style={styles.chipSheen} />
                          <Text style={[styles.priceChipText, { color: accent }]}>{p.priceHint}</Text>
                        </View>
                      </View>
                      <Text style={styles.blurb}>{p.blurb}</Text>
                      {isPass ? (
                        <View style={styles.perkList}>
                          {PASS_PERKS.map((line) => (
                            <Text key={line} style={styles.perkLine}>
                              · {line}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                      {swatch ? (
                        <View style={styles.swatchRow} accessibilityLabel={`${swatch.label} palette`}>
                          <Text style={styles.swatchLabel}>{swatch.label}</Text>
                          <View style={styles.swatches}>
                            {swatch.tones.map((tone) => (
                              <View
                                key={tone}
                                style={[
                                  styles.swatchDot,
                                  { backgroundColor: tone, borderColor: `${tone}99` },
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                      ) : null}
                      {isOwned && p.kind === 'nonconsumable' ? (
                        <Text style={styles.ownedNote}>Looks apply in the mindscape — no power.</Text>
                      ) : null}
                      {showIds ? (
                        <Text style={styles.ids}>
                          iOS: {p.iosProductId}
                          {'\n'}
                          Android: {p.androidProductId}
                        </Text>
                      ) : null}
                      <SoftButton
                        label={buttonLabel(p, owned(p.id), busy)}
                        disabled={busy != null || (owned(p.id) && p.kind === 'nonconsumable')}
                        onPress={() => {
                          if (stubMode && !(owned(p.id) && p.kind === 'nonconsumable')) {
                            Alert.alert(
                              'Stub purchase',
                              `Simulate ${p.title} on this device? No real charge in stub mode.`,
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
                  </SoftCardEnter>
                );
              })}
            </View>
          );
        })}

        <SoftCardEnter index={cardIndex + 1} reduceMotion={reduceMotion}>
          <View style={styles.comfortStrip} accessibilityRole="summary">
            <View pointerEvents="none" style={styles.chipSheen} />
            <View style={styles.comfortHead}>
              <View style={styles.comfortDot} />
              <Text style={styles.comfortTitle}>Metaphor only</Text>
            </View>
            <Text style={styles.comfortBody}>
              Purchases never change the core kindness loop. Soft looks and quiet comfort only —
              not therapy, diagnosis, or treatment.
            </Text>
          </View>
        </SoftCardEnter>
      </ScrollView>
    </Atmosphere>
  );
}

function buttonLabel(p: StoreProduct, isOwned: boolean, busy: string | null): string {
  if (busy === p.id) return 'Working…';
  if (isOwned && p.kind === 'subscription') return 'Extend stub Pass (+30d)';
  if (isOwned && p.kind !== 'consumable') return 'Owned';
  if (p.kind === 'subscription') return 'Start Clarity Pass';
  if (p.kind === 'consumable') return 'Get boost';
  return 'Get pack';
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
    marginBottom: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  chipSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  freeStrip: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 138, 122, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.28)',
    gap: 4,
    overflow: 'hidden',
  },
  freeStripDawn: {
    backgroundColor: 'rgba(232, 201, 160, 0.22)',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  freeStripHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.calm,
  },
  leadDotDawn: {
    backgroundColor: '#C9A85A',
  },
  freeStripTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
  },
  freeStripBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
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
  stubDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.75)',
  },
  statusCard: {
    marginBottom: 12,
    padding: 14,
    paddingTop: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 158, 174, 0.12)',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
    overflow: 'hidden',
  },
  statusTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.55,
  },
  statusCardPass: {
    borderColor: 'rgba(91, 138, 122, 0.4)',
    backgroundColor: 'rgba(91, 138, 122, 0.14)',
  },
  statusCardDawn: {
    backgroundColor: 'rgba(255, 244, 220, 0.55)',
    borderColor: 'rgba(201, 168, 90, 0.32)',
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.brandDeep,
  },
  passLiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(91, 138, 122, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.35)',
    overflow: 'hidden',
  },
  passLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  passLiveText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brand,
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
  activeLooks: {
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.gratitude,
  },
  restore: { marginBottom: 8 },
  idsToggle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 14,
    textDecorationLine: 'underline',
  },
  section: { marginBottom: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionAccent: {
    width: 4,
    alignSelf: 'stretch',
    minHeight: 28,
    borderRadius: 2,
    marginTop: 2,
  },
  sectionCopy: { flex: 1, gap: 2 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.brandDeep,
    flexShrink: 1,
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionChipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  sectionChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  card: {
    marginBottom: 14,
    padding: 16,
    paddingTop: 18,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.11,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.55,
    zIndex: 2,
  },
  passSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardDawn: {
    backgroundColor: 'rgba(255, 248, 235, 0.7)',
  },
  cardPass: {
    borderColor: 'rgba(91, 138, 122, 0.45)',
    backgroundColor: 'rgba(91, 138, 122, 0.1)',
    paddingTop: 16,
  },
  cardOwned: {
    borderColor: colors.calm,
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
  },
  passEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
    letterSpacing: 0.2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink, flex: 1 },
  titlePass: { fontSize: 20, color: colors.brandDeep },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.calm,
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kind: { fontFamily: fonts.bodyMedium, fontSize: 12, flexShrink: 1 },
  priceChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  priceChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  blurb: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  perkList: { gap: 2, marginTop: 2 },
  perkLine: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.brandDeep,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  swatchLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  swatches: { flexDirection: 'row', gap: 6 },
  swatchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(36,51,58,0.12)',
  },
  ownedNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.calm,
  },
  ids: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    opacity: 0.8,
  },
  comfortStrip: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 2,
    overflow: 'hidden',
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
    backgroundColor: colors.brand,
    opacity: 0.7,
  },
  comfortTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
});
