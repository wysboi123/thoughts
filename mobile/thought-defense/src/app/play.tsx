import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { GameBoard } from '../components/GameBoard';
import { SoftButton } from '../components/SoftButton';
import { GAME } from '../game/config';
import {
  applyClarityBoost,
  beginWave,
  createInitialState,
  selectTowerKind,
  sellSelected,
  tapPad,
  tick,
  upgradeSelected,
} from '../game/engine';
import type { GameState, TowerKind } from '../game/types';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const KINDS: TowerKind[] = ['Affirmation', 'Gratitude', 'Humor'];

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { entitlements, consumePendingClarity } = useIap();
  const [state, setState] = useState<GameState>(() => createInitialState());

  const boardW = Math.min(width - 32, 420);
  const boardH = boardW * 1.15;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setState((s) => tick(s, dt));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const amount = await consumePendingClarity();
      if (alive && amount > 0) {
        setState((s) => applyClarityBoost(s, amount));
      }
    })();
    return () => {
      alive = false;
    };
  }, [consumePendingClarity]);

  const onPad = useCallback((i: number) => {
    setState((s) => tapPad(s, i));
  }, []);

  return (
    <Atmosphere>
      <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.topRow}>
          <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.homeBtn} />
          <Text style={styles.title}>Mindscape</Text>
          <View style={{ width: 88 }} />
        </View>

        <View style={styles.hud}>
          <Text style={styles.stat}>Calm {state.calm}</Text>
          <Text style={styles.stat}>Clarity {state.clarity}</Text>
          <Text style={styles.stat}>
            Wave {Math.min(state.waveIndex + 1, GAME.waveCount)}/{GAME.waveCount}
          </Text>
        </View>

        {state.toast ? <Text style={styles.toast}>{state.toast}</Text> : <View style={{ height: 18 }} />}

        <View style={styles.boardWrap}>
          <GameBoard
            state={state}
            width={boardW}
            height={boardH}
            onPad={onPad}
            themeDawn={entitlements.ownedCosmetics.includes('cosmetic_dawn')}
          />
        </View>

        <View style={styles.tray}>
          {KINDS.map((k) => (
            <SoftButton
              key={k}
              label={GAME.towers[k].displayName}
              variant={state.selectedTower === k ? 'primary' : 'soft'}
              onPress={() => setState((s) => selectTowerKind(s, k))}
              style={styles.trayBtn}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {(state.phase === 'prep' || state.phase === 'intermission') && (
            <SoftButton label="Begin wave" onPress={() => setState((s) => beginWave(s))} />
          )}
          {state.selectedPad != null && state.towers.some((t) => t.padIndex === state.selectedPad) && (
            <>
              <SoftButton
                label="Upgrade"
                variant="soft"
                onPress={() => setState((s) => upgradeSelected(s))}
              />
              <SoftButton label="Sell 50%" variant="ghost" onPress={() => setState((s) => sellSelected(s))} />
            </>
          )}
          {(state.phase === 'won' || state.phase === 'lost') && (
            <SoftButton label="Try again" onPress={() => setState(createInitialState())} />
          )}
          {state.phase === 'wave' && !entitlements.clarityPassActive && (
            <Text style={styles.softAd}>Soft note between runs (Clarity Pass hides these)</Text>
          )}
        </View>
      </View>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.brandDeep,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  stat: {
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
    fontSize: 14,
  },
  toast: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    minHeight: 18,
  },
  boardWrap: { alignItems: 'center', marginTop: 8, flex: 1, justifyContent: 'center' },
  tray: { flexDirection: 'row', gap: 8, marginTop: 8 },
  trayBtn: { flex: 1, paddingVertical: 10 },
  actions: { gap: 8, marginTop: 10 },
  softAd: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
});
