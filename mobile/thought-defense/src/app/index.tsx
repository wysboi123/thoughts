import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { GAME } from '../game/config';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { entitlements } = useIap();
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [rise]);

  return (
    <Atmosphere>
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
          <Text style={styles.brand}>{GAME.name}</Text>
          <Text style={styles.tag}>{GAME.tagline}</Text>
          <Text style={styles.support}>
            A soft mindscape. Plant positive thoughts. Clear the noise. Metaphor only — not
            therapy or medical advice.
          </Text>
        </Animated.View>

        <View style={styles.cta}>
          <SoftButton label="Enter the mindscape" onPress={() => router.push('/play')} />
          <SoftButton label="Clarity shop" variant="soft" onPress={() => router.push('/shop')} />
          <SoftButton
            label="Settings & restore"
            variant="ghost"
            onPress={() => router.push('/settings')}
          />
          {entitlements.clarityPassActive ? (
            <Text style={styles.pass}>Clarity Pass active — thank you</Text>
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
    marginTop: 48,
  },
  tag: {
    marginTop: 10,
    fontFamily: fonts.displaySoft,
    fontSize: 20,
    color: colors.brand,
  },
  support: {
    marginTop: 18,
    maxWidth: 320,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  cta: { gap: 12, marginBottom: 12 },
  pass: {
    textAlign: 'center',
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    color: colors.calm,
    fontSize: 13,
  },
});
