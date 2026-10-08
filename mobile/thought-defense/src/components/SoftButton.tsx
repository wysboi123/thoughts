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
        {!reduceMotion ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.pressWash, { opacity: pressWash }]}
          />
        ) : null}
        {variant === 'primary' ? (
          <View pointerEvents="none" style={styles.bottomGlow} />
        ) : null}
        <View style={styles.row}>
          {variant === 'primary' ? <View style={styles.leadDot} /> : null}
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
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  soft: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.18)',
    shadowColor: '#243A34',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  disabled: { opacity: 0.45 },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
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
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  pressWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(36, 51, 58, 0.2)',
  },
  bottomGlow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(247, 251, 249, 0.28)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(247, 251, 249, 0.85)',
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
