import { Platform, Vibration } from 'react-native';

/**
 * Soft haptic stub — no native module required (works in Expo Go).
 * Swap to `expo-haptics` ImpactFeedbackStyle.Light once a custom/dev client ships.
 * ToS-safe: comfort only, never used for dark-pattern urgency.
 */
export type SoftHapticKind = 'tap' | 'plant' | 'clear' | 'warn';

const PATTERN_MS: Record<SoftHapticKind, number> = {
  tap: 8,
  plant: 12,
  clear: 18,
  warn: 28,
};

let enabled = true;

export function setSoftHapticsEnabled(on: boolean) {
  enabled = on;
}

export function softHaptic(kind: SoftHapticKind = 'tap') {
  if (!enabled) return;
  try {
    if (Platform.OS === 'web') return;
    Vibration.vibrate(PATTERN_MS[kind]);
  } catch {
    // Stub: devices without vibrator / restricted profiles — ignore
  }
}
