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
        <Text style={styles.brand}>Settings</Text>
        <Text style={styles.meta}>
          {GAME.name} · {GAME.version}
        </Text>

        <SoftBlockEnter index={0} reduceMotion={reduceMotion}>
          <View style={styles.comfortStrip} accessibilityRole="summary">
            <Text style={styles.comfortTitle}>On-device comfort</Text>
            <Text style={styles.comfortBody}>
              No account · no cloud save · purchases restore via your store. Stub buys stay on this
              device only.
            </Text>
          </View>
        </SoftBlockEnter>

        <SoftBlockEnter index={1} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Active looks" accent={colors.gratitude} />
            <View style={styles.statusCard} accessibilityRole="summary">
              <Text style={styles.statusLabel}>Mindscape cosmetics</Text>
              <Text style={styles.note}>
                {looks.dawn || looks.lantern
                  ? [
                      looks.dawn ? 'Dawn Path' : null,
                      looks.lantern ? 'Lantern Towers' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : 'Default mint mist — shop looks are optional'}
              </Text>
              <Text style={styles.note}>
                Looks only — never change Calm, Clarity costs, or tower power. Clarity Pass unlocks
                both themes while active.
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

        <SoftBlockEnter index={2} reduceMotion={reduceMotion}>
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
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Entitlements</Text>
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

        <SoftBlockEnter index={3} reduceMotion={reduceMotion}>
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

        <SoftBlockEnter index={4} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="Legal" accent={colors.calm} />
            <View style={styles.privacyTeaser}>
              <Text style={styles.privacyTeaserTitle}>Privacy at a glance</Text>
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

        <SoftBlockEnter index={5} reduceMotion={reduceMotion}>
          <View style={styles.block}>
            <SectionHead title="About" accent={colors.gratitude} />
            <Text style={styles.versionLine}>
              Version {GAME.version.replace('-mobile', '')} · mobile build
            </Text>
            <Text style={styles.about}>
              Thought Defense is a soft metaphor game. It is not therapy, diagnosis, or medical advice.
              If you are in distress, seek real-world support.
            </Text>
          </View>
        </SoftBlockEnter>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, gap: 8 },
  back: { alignSelf: 'flex-start' },
  brand: { fontFamily: fonts.display, fontSize: 36, color: colors.brandDeep, marginTop: 8 },
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
  h: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statusLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.brand,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  privacyTeaser: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
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
});
