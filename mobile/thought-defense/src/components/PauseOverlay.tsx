import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { softHaptic } from '../a11y/haptics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

type Props = {
  visible: boolean;
  waveLabel: string;
  calm?: number;
  clarity?: number;
  onResume: () => void;
};

/** Mid-run soft pause — freezes the mindscape without medical framing. */
export function PauseOverlay({ visible, waveLabel, calm, clarity, onResume }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Resume mindscape"
        onPress={() => {
          softHaptic('tap');
          onResume();
        }}
      >
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.eyebrow}>Mindscape paused</Text>
          <Text style={styles.title}>Take a breath</Text>
          <Text style={styles.lead}>
            The path holds still. Planting, upgrades, and soft goals wait exactly where you left
            them. Metaphor only — not therapy.
          </Text>
          <Text style={styles.meta}>{waveLabel}</Text>
          {calm != null && clarity != null ? (
            <Text style={styles.snapshot}>
              Calm {calm} · Clarity {clarity}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <SoftButton label="Resume" onPress={onResume} />
            <SoftButton
              label="Soft goals journal"
              variant="soft"
              onPress={() => router.push('/goals')}
            />
            <SoftButton label="Leave mindscape" variant="ghost" onPress={() => router.replace('/')} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 51, 58, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.mistBottom,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.calm,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.brandDeep,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clarity,
    marginBottom: 4,
  },
  snapshot: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.calm,
    marginTop: -2,
  },
  actions: { gap: 8, marginTop: 12 },
});
