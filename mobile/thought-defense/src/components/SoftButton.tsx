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
        {variant === 'primary' ? (
          <View pointerEvents="none" style={styles.cornerWash} />
        ) : null}
        {variant === 'soft' ? (
          <View pointerEvents="none" style={styles.softCornerWash} />
        ) : null}
        {variant === 'ghost' ? (
          <View pointerEvents="none" style={styles.ghostCornerWash} />
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
          <View pointerEvents="none" style={styles.bottomGlow} />
        ) : null}
        {variant === 'soft' ? (
          <View pointerEvents="none" style={styles.softBottomGlow} />
        ) : null}
        {variant === 'ghost' ? (
          <View pointerEvents="none" style={styles.ghostBottomGlow} />
        ) : null}
        <View style={styles.row}>
          {variant === 'primary' ? (
            <View style={styles.leadWrap}>
              <View pointerEvents="none" style={styles.leadGlow} />
              <View style={styles.leadDot} />
            </View>
          ) : null}
          {variant === 'soft' ? (
            <View style={styles.leadWrap}>
              <View pointerEvents="none" style={styles.softLeadGlow} />
              <View style={styles.softLeadDot} />
            </View>
          ) : null}
          {variant === 'ghost' ? (
            <View style={styles.leadWrap}>
              <View pointerEvents="none" style={styles.ghostLeadGlow} />
              <View style={styles.ghostLeadDot} />
            </View>
          ) : null}
          <View style={styles.labelCol}>
            <Text
              style={[
                styles.label,
                variant === 'ghost' && styles.labelGhost,
                variant === 'soft' && styles.labelSoft,
              ]}
            >
              {label}
            </Text>
            <View
              pointerEvents="none"
              style={[
                styles.labelUnderline,
                variant === 'primary' && styles.labelUnderlinePrimary,
                variant === 'soft' && styles.labelUnderlineSoft,
                variant === 'ghost' && styles.labelUnderlineGhost,
              ]}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    marginHorizontal: -4,
    marginVertical: -4,
    backgroundColor: 'rgba(91, 138, 122, 0.2)',
  },
  softHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    marginHorizontal: -3,
    marginVertical: -3,
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
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 251, 249, 0.22)',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#243A34',
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  soft: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(63, 111, 98, 0.2)',
    shadowColor: '#243A34',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  cornerWash: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    right: -10,
    top: -12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  softCornerWash: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    right: -8,
    top: -10,
    backgroundColor: 'rgba(91, 138, 122, 0.1)',
  },
  ghostCornerWash: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    right: -6,
    top: -8,
    backgroundColor: 'rgba(91, 138, 122, 0.08)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  ghostSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.32)',
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
  ghostBottomGlow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(91, 138, 122, 0.16)',
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
  leadGlow: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(247, 251, 249, 0.28)',
  },
  softLeadGlow: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(91, 138, 122, 0.28)',
  },
  ghostLeadGlow: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(91, 138, 122, 0.2)',
  },
  leadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(247, 251, 249, 0.85)',
  },
  softLeadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    opacity: 0.85,
  },
  ghostLeadDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.calm,
    opacity: 0.75,
  },
  labelCol: {
    alignItems: 'flex-start',
    gap: 2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    color: '#F7FBF9',
    fontSize: 16,
    letterSpacing: 0.25,
  },
  labelGhost: { color: colors.ink, fontFamily: fonts.bodyMedium },
  labelSoft: { color: colors.brandDeep, fontFamily: fonts.bodyMedium },
  labelUnderline: {
    height: 2,
    borderRadius: 1,
    width: '72%',
    opacity: 0.85,
  },
  labelUnderlinePrimary: {
    backgroundColor: 'rgba(247, 251, 249, 0.35)',
  },
  labelUnderlineSoft: {
    backgroundColor: 'rgba(91, 138, 122, 0.28)',
  },
  labelUnderlineGhost: {
    backgroundColor: 'rgba(91, 138, 122, 0.2)',
  },
});
