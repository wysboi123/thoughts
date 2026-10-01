import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { SoftButton } from '../components/SoftButton';
import { SOFT_GOAL_COPY, SOFT_GOAL_ORDER, SOFT_GOAL_TOTAL } from '../game/softGoals';
import type { SoftGoalId } from '../game/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const JOURNAL_KEY = 'td.journal.notes.v1';
const MANUAL_KEY = 'td.journal.manualGoals.v1';

/** Soft goals journal — interactive checklist + optional gentle note (not therapy). */
export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
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

  const saveNote = useCallback(async () => {
    await AsyncStorage.setItem(JOURNAL_KEY, note);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }, [note]);

  const toggleManual = useCallback(async (id: SoftGoalId) => {
    setManual((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(MANUAL_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  return (
    <Atmosphere>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.brand}>Soft goals</Text>
        <Text style={styles.lead}>
          Gentle session aims — metaphor only, not therapy or treatment. Tick what feels true today, or
          let Play clear them as you plant and wave.
        </Text>
        <Text style={styles.progress}>
          {SOFT_GOAL_ORDER.filter((id) => !!manual[id]).length}/{SOFT_GOAL_TOTAL} checked here · Play
          also tracks the same aims
        </Text>

        {SOFT_GOAL_ORDER.map((id) => {
          const checked = !!manual[id];
          return (
            <Pressable
              key={id}
              onPress={() => toggleManual(id)}
              style={[styles.card, checked && styles.cardDone]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
            >
              <Text style={[styles.check, checked && styles.checkOn]}>{checked ? '✓' : '○'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, checked && styles.titleDone]}>
                  {SOFT_GOAL_COPY[id].title}
                </Text>
                <Text style={styles.blurb}>{SOFT_GOAL_COPY[id].blurb}</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.h}>Journal-lite</Text>
        <Text style={styles.lead}>
          One optional note for yourself. Stays on this device. Not advice — just a place to remember.
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. today I planted Humor first…"
          placeholderTextColor={colors.inkSoft}
          multiline
          style={styles.input}
        />
        <SoftButton label={savedFlash ? 'Saved' : 'Save note'} onPress={saveNote} />
        <SoftButton label="Enter mindscape" variant="soft" onPress={() => router.push('/play')} />
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
  progress: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.calm,
    marginBottom: 6,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'flex-start',
  },
  cardDone: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(91, 138, 122, 0.12)',
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
  h: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    marginTop: 12,
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
});
