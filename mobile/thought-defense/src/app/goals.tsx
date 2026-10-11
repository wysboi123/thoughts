import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { softHaptic } from '../a11y/haptics';
import { MIN_TAP } from '../a11y/tapTargets';
import { useReducedMotion } from '../a11y/useReducedMotion';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { SOFT_GOAL_COPY, SOFT_GOAL_ORDER, SOFT_GOAL_TOTAL } from '../game/softGoals';
import type { SoftGoalId } from '../game/types';
import { activeLooksFromEntitlements } from '../iap/cosmetics';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const JOURNAL_KEY = 'td.journal.notes.v1';
const MANUAL_KEY = 'td.journal.manualGoals.v1';

const GOAL_ACCENTS: Record<SoftGoalId, string> = {
  plant_three: colors.affirmation,
  clear_wave_one: colors.clarity,
  upgrade_once: colors.gratitude,
  reach_wave_three: colors.calm,
  plant_all_kinds: colors.humor,
  reach_wave_six: colors.brand,
  keep_calm: colors.successSoft,
};

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
      40 + index * 42,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      40 + index * 42,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Soft goals journal — interactive checklist + optional gentle note (not therapy). */
export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { entitlements } = useIap();
  const looks = activeLooksFromEntitlements(entitlements);
  const [note, setNote] = useState('');
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [n, m] = await Promise.all([
          AsyncStorage.getItem(JOURNAL_KEY),
          AsyncStorage.getItem(MANUAL_KEY),
        ]);
        if (n) setNote(n);
        if (m) setManual(JSON.parse(m));
      } catch {
        // ignore
      }
    })();
  }, []);

  const checkedCount = SOFT_GOAL_ORDER.filter((id) => !!manual[id]).length;
  const allChecked = checkedCount >= SOFT_GOAL_TOTAL;
  const progressPct = Math.round((checkedCount / SOFT_GOAL_TOTAL) * 100);

  const saveNote = useCallback(async () => {
    softHaptic('plant');
    await AsyncStorage.setItem(JOURNAL_KEY, note);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }, [note]);

  const toggleManual = useCallback(async (id: SoftGoalId) => {
    softHaptic('tap');
    setManual((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(MANUAL_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  return (
    <Atmosphere dawn={looks.dawn}>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />

        <SoftBlockEnter index={0} reduceMotion={reduceMotion}>
          <Text style={styles.brand}>Soft goals</Text>
          <Text style={styles.lead}>
            Gentle session aims — metaphor only, not therapy or treatment. Tick what feels true today,
            or let Play clear them as you plant and wave.
          </Text>
        </SoftBlockEnter>

        <SoftBlockEnter index={1} reduceMotion={reduceMotion}>
          <View style={styles.progressCard} accessibilityRole="summary">
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {checkedCount}/{SOFT_GOAL_TOTAL} checked here
              </Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.track} accessibilityElementsHidden>
              <View style={[styles.fill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressHint}>
              {allChecked
                ? 'All ticked for today — soft win. Play still tracks the same aims live.'
                : 'Play also tracks these aims during a run. This list is just for you.'}
            </Text>
          </View>
        </SoftBlockEnter>

        {SOFT_GOAL_ORDER.map((id, i) => {
          const checked = !!manual[id];
          const accent = GOAL_ACCENTS[id];
          return (
            <SoftBlockEnter key={id} index={2 + i} reduceMotion={reduceMotion}>
              <Pressable
                onPress={() => toggleManual(id)}
                style={[styles.card, checked && styles.cardDone, { borderLeftColor: accent }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityHint="Double tap to toggle this soft goal"
              >
                <View style={[styles.accentDot, { backgroundColor: accent }]} />
                <Text style={[styles.check, checked && styles.checkOn]}>{checked ? '✓' : '○'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, checked && styles.titleDone]}>
                    {SOFT_GOAL_COPY[id].title}
                  </Text>
                  <Text style={styles.blurb}>{SOFT_GOAL_COPY[id].blurb}</Text>
                </View>
              </Pressable>
            </SoftBlockEnter>
          );
        })}

        <SoftBlockEnter index={2 + SOFT_GOAL_TOTAL} reduceMotion={reduceMotion}>
          <View style={styles.journalHead}>
            <View style={[styles.accentBar, { backgroundColor: colors.clarity }]} />
            <Text style={styles.h}>Journal-lite</Text>
          </View>
          <Text style={styles.lead}>
            One optional note for yourself. Stays on this device. Not advice — just a place to
            remember.
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. today I planted Humor first…"
            placeholderTextColor={colors.inkSoft}
            multiline
            style={styles.input}
            accessibilityLabel="Optional journal note"
          />
          <SoftButton label={savedFlash ? 'Saved' : 'Save note'} onPress={saveNote} />
          <SoftButton
            label="Enter mindscape"
            variant="soft"
            onPress={() => {
              softHaptic('tap');
              router.push('/play');
            }}
          />
        </SoftBlockEnter>

        <SoftBlockEnter index={3 + SOFT_GOAL_TOTAL} reduceMotion={reduceMotion}>
          <View style={styles.comfortStrip} accessibilityRole="summary">
            <Text style={styles.comfortTitle}>Metaphor only</Text>
            <Text style={styles.comfortBody}>
              Soft goals are play aims, not health metrics. Nothing here is therapy, diagnosis, or
              medical advice.
            </Text>
          </View>
        </SoftBlockEnter>
      </ScrollView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, gap: 10 },
  back: { alignSelf: 'flex-start' },
  brand: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.brandDeep,
    marginTop: 4,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    marginBottom: 4,
  },
  progressCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.calm,
  },
  progressPct: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.brandDeep,
  },
  track: {
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(63, 111, 98, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.brand,
  },
  progressHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  card: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: MIN_TAP + 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    alignItems: 'flex-start',
  },
  cardDone: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginTop: 7,
  },
  check: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.inkSoft,
    width: 22,
    marginTop: 2,
  },
  checkOn: { color: colors.brand },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  titleDone: { color: colors.brandDeep },
  blurb: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 2, lineHeight: 18 },
  journalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  accentBar: {
    width: 4,
    height: 18,
    borderRadius: 4,
  },
  h: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  input: {
    minHeight: 96,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.line,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  comfortStrip: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 158, 174, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(106, 158, 174, 0.22)',
    gap: 4,
  },
  comfortTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.clarity,
  },
  comfortBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
});
