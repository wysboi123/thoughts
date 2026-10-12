import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { Atmosphere } from '../components/Atmosphere';
import { HomeMindscapePreview } from '../components/HomeMindscapePreview';
import { SoftButton } from '../components/SoftButton';
import { SoftWelcomeSheet } from '../components/SoftWelcomeSheet';
import { GAME } from '../game/config';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const LOOP_CHIPS = [
  { label: 'Plant', tone: colors.affirmation },
  { label: 'Clear', tone: colors.clarity },
  { label: 'Hold Peace', tone: colors.gratitude },
] as const;

function SoftCtaEnter({
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
      120 + index * 70,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      120 + index * 70,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Reanimated.View style={style}>{children}</Reanimated.View>;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { entitlements, passDaysRemaining } = useIap();
  const looks = activeLooksFromEntitlements(entitlements);
  const rise = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      rise.setValue(1);
      return;
    }
    Animated.timing(rise, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [rise, reduceMotion]);

  return (
    <Atmosphere dawn={looks.dawn}>
      <SoftWelcomeSheet />
      <View style={[styles.wrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
        <Animated.View
          style={{
            opacity: rise,
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.brand} accessibilityRole="header">
            {GAME.name}
          </Text>
          <Text style={styles.tag}>{GAME.tagline}</Text>
          <Text style={styles.support}>
            A soft mindscape. Plant positive thoughts. Clear the noise. Metaphor only — not
            therapy or medical advice.
          </Text>
          <HomeMindscapePreview dawn={looks.dawn} lantern={looks.lantern} />
          <View style={styles.chips} accessibilityRole="summary">
            {LOOP_CHIPS.map((chip) => (
              <View key={chip.label} style={styles.chip}>
                <View style={[styles.chipDot, { backgroundColor: chip.tone }]} />
                <Text style={styles.chipLabel}>{chip.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.cta}>
          <SoftCtaEnter index={0} reduceMotion={reduceMotion}>
            <SoftButton
              label="Enter the mindscape"
              accessibilityHint="Starts a soft tower-defense session"
              onPress={() => router.push('/play')}
            />
          </SoftCtaEnter>
          <SoftCtaEnter index={1} reduceMotion={reduceMotion}>
            <SoftButton
              label="Soft goals journal"
              variant="soft"
              accessibilityHint="Opens your session soft goals"
              onPress={() => router.push('/goals')}
            />
          </SoftCtaEnter>
          <SoftCtaEnter index={2} reduceMotion={reduceMotion}>
            <SoftButton
              label="Clarity shop"
              variant="soft"
              accessibilityHint="Optional comfort purchases — core loop stays free"
              onPress={() => router.push('/shop')}
            />
          </SoftCtaEnter>
          <SoftCtaEnter index={3} reduceMotion={reduceMotion}>
            <SoftButton
              label="Settings & restore"
              variant="ghost"
              onPress={() => router.push('/settings')}
            />
          </SoftCtaEnter>
          {entitlements.clarityPassActive ? (
            <SoftCtaEnter index={4} reduceMotion={reduceMotion}>
              <View style={styles.passBadge} accessibilityRole="text">
                <View style={styles.passDot} />
                <Text style={styles.pass}>
                  Clarity Pass · thank you
                  {passDaysRemaining != null ? ` · ~${passDaysRemaining}d` : ''}
                </Text>
              </View>
            </SoftCtaEnter>
          ) : null}
        </View>
      </View>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 54,
    color: colors.brandDeep,
    letterSpacing: -0.5,
    marginTop: 28,
  },
  tag: {
    marginTop: 10,
    fontFamily: fonts.displaySoft,
    fontSize: 20,
    color: colors.brand,
  },
  support: {
    marginTop: 14,
    maxWidth: 320,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.brandDeep,
  },
  cta: { gap: 12, marginBottom: 12 },
  passBadge: {
    marginTop: 4,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(91, 138, 122, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 122, 0.28)',
  },
  passDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.calm,
  },
  pass: {
    fontFamily: fonts.bodyMedium,
    color: colors.calm,
    fontSize: 13,
  },
});
