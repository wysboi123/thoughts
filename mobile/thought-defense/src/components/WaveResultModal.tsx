import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SOFT_GOAL_COPY, softGoalsDone } from '../game/softGoals';
import type { GameState, SoftGoalId } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { SoftButton } from './SoftButton';

type Props = {
  visible: boolean;
  state: GameState;
  onRetry: () => void;
  onClose: () => void;
};

const ORDER: SoftGoalId[] = [
  'plant_three',
  'clear_wave_one',
  'upgrade_once',
  'reach_wave_three',
  'keep_calm',
];

export function WaveResultModal({ visible, state, onRetry, onClose }: Props) {
  const won = state.phase === 'won';
  const done = softGoalsDone(state.softGoals);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{won ? 'Peace held' : 'Soft pause'}</Text>
          <Text style={styles.lead}>
            {won
              ? 'The noise grew quiet. Soft goals for this run:'
              : 'The core needs rest. Soft goals still count:'}
          </Text>
          <Text style={styles.count}>
            {done}/5 soft goals · {state.thoughtsCleared} thoughts cleared
          </Text>
          {ORDER.map((id) => (
            <View key={id} style={styles.row}>
              <Text style={styles.check}>{state.softGoals[id] ? '✓' : '○'}</Text>
              <Text style={[styles.goal, !state.softGoals[id] && styles.goalOpen]}>
                {SOFT_GOAL_COPY[id].title}
              </Text>
            </View>
          ))}
          <View style={styles.actions}>
            <SoftButton label="Try again" onPress={onRetry} />
            <SoftButton
              label="Soft goals journal"
              variant="soft"
              onPress={() => {
                onClose();
                router.push('/goals');
              }}
            />
            <SoftButton label="Home" variant="ghost" onPress={() => router.replace('/')} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 51, 58, 0.35)',
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
  count: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.calm,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  check: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.brand, width: 20 },
  goal: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, flex: 1 },
  goalOpen: { color: colors.inkSoft },
  actions: { gap: 8, marginTop: 12 },
});
