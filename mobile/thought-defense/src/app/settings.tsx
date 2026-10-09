import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { resetWelcomeDismissed } from '../components/SoftWelcomeSheet';
import { GAME } from '../game/config';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

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
      36 + index * 48,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      36 + index * 48,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function SectionHead({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={styles.sectionHead}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <Text style={styles.h}>{title}</Text>
      <View style={[styles.sectionDot, { backgroundColor: accent }]} />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const {
    entitlements,
    restore,
    resetStub,
    stubMode,
    passDaysRemaining,
    describeEntitlements,
  } = useIap();
  const looks = activeLooksFromEntitlements(entitlements);

  return (
    <Atmosphere dawn={looks.dawn}>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <SoftBlockEnter index={0} reduceMotion={reduceMotion}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>Settings</Text>
            <View style={[styles.versionChip, looks.dawn ? styles.versionChipDawn : null]}>
              <View style={[styles.versionDot, looks.dawn ? styles.versionDotDawn : null]} />
              <Text style={styles.versionChipText}>
                {GAME.version.replace('-mobile', '')}
              </Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {GAME.name} · soft mindscape comfort
          </Text>
        </SoftBlockEnter>

        <SoftBlockEnter index={1} reduceMotion={reduceMotion}>
          <View
            style={[styles.comfortStrip, looks.dawn ? styles.comfortStripDawn : null]}
            accessibilityRole="summary"
          >
            <View style={styles.comfortHead}>
              <View style={[styles.leadDot, looks.dawn ? styles.leadDotDawn : null]} />
              <Text style={styles.comfortTitle}>On-device comfort</Text>
            </View>
            <Text style={styles.comfortBody}>
              No account · no cloud save · purchases restore via your store. Stub buys stay on this
              device only.
            </Text>
          </View>
        </SoftBlockEnter>

        <SoftBlockEnter index={2} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Active looks" accent={colors.gratitude} />
            <View
              style={[styles.statusCard, looks.dawn ? styles.statusCardDawn : null]}
              accessibilityRole="summary"
            >
              <View
                pointerEvents="none"
                style={[styles.cardTopAccent, { backgroundColor: colors.gratitude }]}
              />
              <Text style={styles.statusLabel}>Mindscape cosmetics</Text>
              <View style={styles.lookRow}>
                <View
                  style={[
                    styles.lookChip,
                    looks.dawn ? styles.lookChipOn : styles.lookChipOff,
                  ]}
                >
                  <View
                    style={[
                      styles.lookDot,
                      looks.dawn ? styles.lookDotOn : styles.lookDotOff,
                    ]}
                  />
                  <Text style={looks.dawn ? styles.lookChipTextOn : styles.lookChipTextOff}>
                    Dawn Path
                  </Text>
                </View>
                <View
                  style={[
                    styles.lookChip,
                    looks.lantern ? styles.lookChipOn : styles.lookChipOff,
                  ]}
                >
                  <View
                    style={[
                      styles.lookDot,
                      looks.lantern ? styles.lookDotOn : styles.lookDotOff,
                    ]}
                  />
                  <Text style={looks.lantern ? styles.lookChipTextOn : styles.lookChipTextOff}>
                    Lantern Towers
                  </Text>
                </View>
              </View>
              <Text style={styles.note}>
                {looks.dawn || looks.lantern
                  ? 'Looks only — never change Calm, Clarity costs, or tower power.'
                  : 'Default mint mist — shop looks are optional. Clarity Pass unlocks both themes while active.'}
              </Text>
              <SoftButton
                label="Open Clarity shop"
                variant="soft"
                onPress={() => {
                  softHaptic('tap');
                  router.push('/shop');
                }}
              />
            </View>
          </View>
        </SoftBlockEnter>

        <SoftBlockEnter index={3} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Purchases" accent={colors.clarity} />
            <SoftButton
              label="Restore purchases"
              onPress={async () => {
                softHaptic('tap');
                const { summary } = await restore();
                softHaptic('clear');
                Alert.alert('Restored', summary);
              }}
            />
            {stubMode ? (
              <SoftButton
                label="Reset stub purchases"
                variant="ghost"
                onPress={async () => {
                  softHaptic('warn');
                  await resetStub();
                  Alert.alert('Cleared', 'Stub entitlements + purchase log reset.');
                }}
              />
            ) : null}
            <View
              style={[
                styles.statusCard,
                entitlements.clarityPassActive ? styles.statusCardPass : null,
                looks.dawn ? styles.statusCardDawn : null,
              ]}
            >
              <View
                pointerEvents="none"
                style={[styles.cardTopAccent, { backgroundColor: colors.clarity }]}
              />
              <View style={styles.statusHead}>
                <Text style={styles.statusLabel}>Entitlements</Text>
                {entitlements.clarityPassActive ? (
                  <View style={styles.passLiveChip}>
                    <View style={styles.passLiveDot} />
                    <Text style={styles.passLiveText}>Pass live</Text>
                  </View>
                ) : null}
              </View>
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
          </View>
        </SoftBlockEnter>

        <SoftBlockEnter index={4} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Onboarding" accent={colors.affirmation} />
            <SoftButton
              label="Replay welcome"
              variant="soft"
              onPress={async () => {
                softHaptic('tap');
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
        </SoftBlockEnter>

        <SoftBlockEnter index={5} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Legal" accent={colors.calm} />
            <View
              style={[styles.privacyTeaser, looks.dawn ? styles.privacyTeaserDawn : null]}
            >
              <View
                pointerEvents="none"
                style={[styles.cardTopAccent, { backgroundColor: colors.calm }]}
              />
              <View style={styles.privacyTeaserHead}>
                <View style={styles.privacyDot} />
                <Text style={styles.privacyTeaserTitle}>Privacy at a glance</Text>
              </View>
              <Text style={styles.note}>
                Entertainment metaphor only · no therapy claims · device-local progress · store
                handles paid items.
              </Text>
            </View>
            <SoftButton
              label="Privacy policy"
              variant="soft"
              onPress={() => {
                softHaptic('tap');
                router.push('/privacy');
              }}
            />
            <SoftButton
              label="Terms of use"
              variant="soft"
              onPress={() => {
                softHaptic('tap');
                router.push('/terms');
              }}
            />
          </View>
        </SoftBlockEnter>

        <SoftBlockEnter index={6} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="About" accent={colors.gratitude} />
            <Text style={styles.versionLine}>
              Version {GAME.version.replace('-mobile', '')} · mobile build
            </Text>
            <Text style={styles.about}>
              Thought Defense is a soft metaphor game. It is not therapy, diagnosis, or medical advice.
              If you are in distress, seek real-world support.
            </Text>
            <View style={styles.footerStrip} accessibilityRole="summary">
              <View style={styles.footerHead}>
                <View style={styles.footerDot} />
                <Text style={styles.footerTitle}>Metaphor only</Text>
              </View>
              <Text style={styles.footerBody}>
                Soft goals and comfort purchases never change the free kindness loop.
              </Text>
            </View>
          </View>
        </SoftBlockEnter>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, gap: 8 },
  back: { alignSelf: 'flex-start' },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  brand: { fontFamily: fonts.display, fontSize: 36, color: colors.brandDeep, flex: 1 },
  versionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 111, 98, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.25)',
  },
  versionChipDawn: {
    backgroundColor: 'rgba(201, 168, 90, 0.18)',
    borderColor: 'rgba(201, 168, 90, 0.35)',
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  versionDotDawn: {
    backgroundColor: '#C9A85A',
  },
  versionChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brandDeep,
  },
  meta: { fontFamily: fonts.body, color: colors.inkSoft, marginBottom: 12 },
  comfortStrip: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    gap: 4,
    shadowColor: '#243A34',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  comfortStripDawn: {
    backgroundColor: 'rgba(255, 246, 230, 0.72)',
    borderColor: 'rgba(201, 168, 90, 0.32)',
  },
  comfortHead: {
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
  comfortTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brand,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  block: { gap: 10, marginBottom: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  accentBar: { width: 3, height: 16, borderRadius: 2 },
  sectionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.7,
    marginLeft: 'auto',
  },
  h: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
  lookRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  lookChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  lookChipOn: {
    backgroundColor: 'rgba(91, 138, 122, 0.18)',
    borderColor: 'rgba(91, 138, 122, 0.4)',
  },
  lookChipOff: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderColor: colors.line,
  },
  lookDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lookDotOn: {
    backgroundColor: colors.calm,
  },
  lookDotOff: {
    backgroundColor: 'rgba(36, 51, 58, 0.2)',
  },
  lookChipTextOn: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brandDeep,
  },
  lookChipTextOff: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    shadowColor: '#243A34',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.55,
  },
  statusCardDawn: {
    backgroundColor: 'rgba(255, 248, 235, 0.7)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  statusCardPass: {
    borderColor: 'rgba(91, 138, 122, 0.4)',
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brand,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
  privacyTeaser: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  privacyTeaserDawn: {
    backgroundColor: 'rgba(255, 248, 235, 0.7)',
    borderColor: 'rgba(201, 168, 90, 0.28)',
  },
  privacyTeaserHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.calm,
  },
  privacyTeaserTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  versionLine: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.brand,
    marginBottom: 4,
  },
  about: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
  footerStrip: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 2,
  },
  footerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    opacity: 0.7,
  },
  footerTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brand,
  },
  footerBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
});
