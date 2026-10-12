import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP, TAP_SLOP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'soft';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  /** Optional soft accent bar (default on for primary) */
  accent?: boolean;
};

export function SoftButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  accessibilityHint,
  accent,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();
  const showAccent = accent ?? variant === 'primary';

  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return;
    }
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [enter, reduceMotion]);

  const pressIn = () => {
    if (reduceMotion) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 7 }),
      Animated.timing(press, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };
  const pressOut = () => {
    if (reduceMotion) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
      Animated.timing(press, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const sheenOpacity = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.08],
  });
  const pressWash = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });
  const enterOpacity = enter;
  const enterY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });

  return (
    <Animated.View
      style={[
        {
          opacity: enterOpacity,
          transform: [{ scale }, { translateY: enterY }],
        },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <View pointerEvents="none" style={styles.primaryHalo} />
      ) : null}
      {variant === 'soft' ? (
        <View pointerEvents="none" style={styles.softHalo} />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: Boolean(disabled) }}
        hitSlop={TAP_SLOP}
        disabled={disabled}
        onPress={() => {
          softHaptic(variant === 'primary' ? 'plant' : 'tap');
          onPress();
        }}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.base,
          variant === 'primary' && styles.primary,
          variant === 'ghost' && styles.ghost,
          variant === 'soft' && styles.soft,
          disabled && styles.disabled,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.cornerWash,
            variant === 'primary' && styles.cornerWashPrimary,
            variant === 'soft' && styles.cornerWashSoft,
            variant === 'ghost' && styles.cornerWashGhost,
          ]}
        />
        {showAccent ? (
          <View
            pointerEvents="none"
            style={[
              styles.accentBar,
              variant === 'primary' && styles.accentPrimary,
              variant === 'soft' && styles.accentSoft,
              variant === 'ghost' && styles.accentGhost,
            ]}
          />
        ) : null}
        {(variant === 'primary' || variant === 'soft') && !reduceMotion ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.sheen, { opacity: sheenOpacity }]}
          />
        ) : null}
        {variant === 'ghost' ? (
          <View pointerEvents="none" style={styles.ghostSheen} />
        ) : null}
        {!reduceMotion ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.pressWash, { opacity: pressWash }]}
          />
        ) : null}
        {variant === 'primary' ? (
          <View pointerEvents="none" style={styles.innerRim} />
        ) : null}
        {variant === 'primary' ? (
          <View pointerEvents="none" style={styles.bottomGlow} />
        ) : null}
        {variant === 'soft' ? (
          <View pointerEvents="none" style={styles.softBottomGlow} />
        ) : null}
        <View style={styles.row}>
          {variant === 'primary' ? (
            <View style={styles.leadWrap}>
              <View pointerEvents="none" style={styles.leadHalo} />
              <View style={styles.leadDot} />
            </View>
          ) : null}
          {variant === 'soft' ? (
            <View style={styles.leadWrap}>
              <View pointerEvents="none" style={styles.softLeadHalo} />
              <View style={styles.softLeadDot} />
            </View>
          ) : null}
          <Text
            style={[
              styles.label,
              variant === 'ghost' && styles.labelGhost,
              variant === 'soft' && styles.labelSoft,
            ]}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    marginHorizontal: -3,
    marginVertical: -3,
    backgroundColor: 'rgba(91, 138, 122, 0.18)',
  },
  softHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    marginHorizontal: -2,
    marginVertical: -2,
    backgroundColor: 'rgba(91, 138, 122, 0.1)',
  },
  base: {
    minHeight: MIN_TAP,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.brand,
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.36,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(247, 251, 249, 0.22)',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#243A34',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  soft: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.18)',
    shadowColor: '#243A34',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  disabled: { opacity: 0.45 },
  cornerWash: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    right: -12,
    top: -10,
  },
  cornerWashPrimary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  cornerWashSoft: {
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
  },
  cornerWashGhost: {
    backgroundColor: 'rgba(91, 138, 122, 0.08)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    zIndex: 2,
  },
  accentPrimary: {
    backgroundColor: 'rgba(247, 251, 249, 0.55)',
  },
  accentSoft: {
    backgroundColor: colors.brand,
  },
  accentGhost: {
    backgroundColor: colors.calm,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  ghostSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  pressWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(36, 51, 58, 0.2)',
  },
  innerRim: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    opacity: 0.9,
  },
  bottomGlow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(247, 251, 249, 0.32)',
  },
  softBottomGlow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(91, 138, 122, 0.32)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadWrap: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(247, 251, 249, 0.22)',
  },
  softLeadHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(91, 138, 122, 0.2)',
  },
  leadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(247, 251, 249, 0.9)',
  },
  softLeadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    opacity: 0.9,
  },
  label: {
    fontFamily: fonts.bodyBold,
    color: '#F7FBF9',
    fontSize: 16,
    letterSpacing: 0.25,
  },
  labelGhost: { color: colors.ink, fontFamily: fonts.bodyMedium },
  labelSoft: { color: colors.brandDeep, fontFamily: fonts.bodyMedium },
});
