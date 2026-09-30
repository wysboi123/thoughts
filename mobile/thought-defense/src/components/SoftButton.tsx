import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'soft';
  disabled?: boolean;
  style?: ViewStyle;
};

export function SoftButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
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
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.labelGhost,
            variant === 'soft' && styles.labelSoft,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.brand,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  soft: {
    backgroundColor: colors.surfaceStrong,
  },
  disabled: { opacity: 0.45 },
  label: {
    fontFamily: fonts.bodyBold,
    color: '#F7FBF9',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  labelGhost: { color: colors.ink, fontFamily: fonts.bodyMedium },
  labelSoft: { color: colors.brandDeep, fontFamily: fonts.bodyMedium },
});
